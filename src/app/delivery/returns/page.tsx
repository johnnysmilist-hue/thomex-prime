"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { createNotification } from "@/lib/supabaseNotifications";
import { fetchStationById } from "@/lib/supabaseStations";
import { useStationOfficer } from "@/context/StationOfficerContext";

type OrderItem = { name?: string; qty?: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  user_id: string | null;
  items: OrderItem[] | null;
  status: string;
  destination_station_id: string | null;
};

const reasons = [
  "Customer refused",
  "Customer unavailable",
  "Wrong customer details",
  "Package damaged",
  "Pickup period expired",
  "Wrong item",
  "Customer requested return",
  "Other",
];

const conditions = ["Good condition", "Packaging damaged", "Product appears tampered", "Severely damaged"];

export default function ProcessReturnPage() {
  const officer = useStationOfficer();
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [stationName, setStationName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [reason, setReason] = useState(reasons[0]);
  const [condition, setCondition] = useState(conditions[0]);
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (order?.destination_station_id) {
      fetchStationById(order.destination_station_id).then((r) => {
        if (r.data) setStationName(r.data.name);
      });
    }
  }, [order?.destination_station_id]);

  const totalQty = (order?.items || []).reduce((sum, i) => sum + (i.qty || 0), 0);

  const handleSearch = async () => {
    setSearchError("");
    setOrder(null);
    setSuccess("");
    if (!query.trim()) return;
    setSearching(true);

    const { data } = await supabase
      .from("orders")
      .select("id, order_code, customer_name, user_id, items, status, destination_station_id")
      .ilike("order_code", query.trim())
      .maybeSingle();

    setSearching(false);
    if (!data) {
      setSearchError("No matching order found.");
      return;
    }
    setOrder(data as Order);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - photos.length);
    setPhotos((prev) => [...prev, ...files].slice(0, 5));
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const resetAll = () => {
    setQuery("");
    setOrder(null);
    setReason(reasons[0]);
    setCondition(conditions[0]);
    setPhotos([]);
    setSuccess("");
    setConfirmError("");
  };

  const handleConfirmReturn = async () => {
    if (!order) return;
    setConfirming(true);
    setConfirmError("");

    const photoUrls: string[] = [];
    for (const file of photos) {
      const fileName = order.order_code + "-" + Date.now() + "-" + file.name;
      const { error: uploadError } = await supabase.storage.from("package-photos").upload(fileName, file);
      if (!uploadError) {
        photoUrls.push(supabase.storage.from("package-photos").getPublicUrl(fileName).data.publicUrl);
      }
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "Returned",
        return_reason: reason,
        return_condition: condition,
        return_photos: photoUrls,
        returned_at: new Date().toISOString(),
        returned_by_officer_id: officer.id !== "ALL" ? officer.id : null,
      })
      .eq("id", order.id);

    if (updateError) {
      setConfirmError("Could not process this return. Please try again.");
      setConfirming(false);
      return;
    }

    await supabase.from("package_events").insert({
      order_id: order.id,
      label: "Return processed by " + officer.name + " — " + reason,
      station_id: officer.station_id,
      officer_id: officer.id !== "ALL" ? officer.id : null,
    });

    if (order.user_id) {
      await createNotification({
        recipient_type: "customer",
        recipient_id: order.user_id,
        title: "Order " + order.order_code + " marked as returned",
        body: "Your order has been processed as a return. Reason: " + reason + ".",
        order_id: order.id,
      });
    }

    setSuccess("Return processed — package moved to the return queue.");
    setConfirming(false);
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-lg font-bold text-black dark:text-white">Process Return</h1>
      </div>

      <div className="p-6 max-w-4xl">
        {!order && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Order Number / Tracking Number</label>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. THX-KE-2026-000482"
                className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm"
              />
              <button onClick={handleSearch} disabled={searching} className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60">
                {searching ? "..." : "Search"}
              </button>
            </div>
            {searchError && <p className="text-xs text-red-500 mt-2">{searchError}</p>}
          </div>
        )}

        {order && !success && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <p className="text-sm font-bold text-black dark:text-white mb-4">Return Details</p>

              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Order Number</label>
              <p className="text-sm text-black dark:text-white font-medium mb-4">{order.order_code}</p>

              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Customer</label>
              <p className="text-sm text-black dark:text-white font-medium mb-4">{order.customer_name}</p>

              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Reason for Return</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm mb-4"
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Package Condition</label>
              <div className="space-y-1.5 mb-4">
                {conditions.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="radio" name="condition" checked={condition === c} onChange={() => setCondition(c)} />
                    {c}
                  </label>
                ))}
              </div>

              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Add Photos (Optional)</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl h-24 flex flex-col items-center justify-center gap-1 cursor-pointer mb-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <p className="text-[11px] text-gray-400">Click to upload photos or drag and drop</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
              <p className="text-[10px] text-gray-400 mb-2">Max 5 images, JPG/PNG</p>
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {photos.map((f, i) => (
                    <span key={i} className="text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded px-2 py-1 flex items-center gap-1">
                      {f.name.slice(0, 14)}
                      <button onClick={() => removePhoto(i)} className="text-gray-400 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}

              {confirmError && <p className="text-xs text-red-500 mb-2">{confirmError}</p>}

              <div className="flex gap-2 mt-4">
                <button onClick={resetAll} className="flex-1 border border-gray-200 dark:border-gray-700 text-black dark:text-white text-sm font-semibold py-2.5 rounded-md">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReturn}
                  disabled={confirming}
                  className="flex-1 bg-red-600 text-white text-sm font-semibold py-2.5 rounded-md disabled:opacity-60"
                >
                  {confirming ? "Processing..." : "Confirm Return"}
                </button>
              </div>
            </div>

            <div>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-4">
                <p className="text-sm font-bold text-black dark:text-white mb-4">Return Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Customer</span><span className="text-black dark:text-white font-medium">{order.customer_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Product</span><span className="text-black dark:text-white font-medium truncate max-w-[160px] text-right">{(order.items || []).map((i) => i.name).join(", ") || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Quantity</span><span className="text-black dark:text-white font-medium">{totalQty || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Reason</span><span className="text-black dark:text-white font-medium">{reason}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Condition</span><span className="text-black dark:text-white font-medium">{condition}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Station</span><span className="text-black dark:text-white font-medium">{stationName || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Officer</span><span className="text-black dark:text-white font-medium">{officer.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Date</span><span className="text-black dark:text-white font-medium">{new Date().toLocaleString()}</span></div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-400 text-xs rounded-lg px-3 py-2">
                The package will be moved to the return processing queue.
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 text-sm rounded-lg px-4 py-4 text-center">
            {success}
            <button onClick={resetAll} className="block mx-auto mt-2 text-xs font-semibold text-brand">Process another return</button>
          </div>
        )}
      </div>
    </div>
  );
}

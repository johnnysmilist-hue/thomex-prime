"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { createNotification } from "@/lib/supabaseNotifications";
import { useStationOfficer } from "@/context/StationOfficerContext";

type OrderItem = { name?: string; qty?: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  user_id: string | null;
  items: OrderItem[] | null;
  status: string;
  destination_station_id: string | null;
  fulfillment_method: string | null;
  pickup_code: string | null;
};

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 4) return phone;
  return phone.slice(0, 3) + "XXX XXX" + phone.slice(-3).slice(-2);
};

const genPickupCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const preReceiveStatuses = ["Dispatched", "In Transit", "Shipped", "Confirmed", "Pending"];

export default function ReceivePackagePage() {
  const officer = useStationOfficer();
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [searching, setSearching] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = async () => {
    setError("");
    setSuccess("");
    setOrder(null);
    if (!query.trim()) return;

    setSearching(true);
    const { data } = await supabase
      .from("orders")
      .select("id, order_code, customer_name, phone, user_id, items, status, destination_station_id, fulfillment_method, pickup_code")
      .ilike("order_code", query.trim())
      .maybeSingle();
    setSearching(false);

    if (!data) {
      setError("No package found with that tracking number.");
      return;
    }
    setOrder(data as Order);
  };

  const totalQty = (order?.items || []).reduce((sum, i) => sum + (i.qty || 0), 0);

  const alreadyReceived = order && !preReceiveStatuses.includes(order.status);

  const handleReceive = async () => {
    if (!order) return;
    setReceiving(true);
    setError("");

    const isPickupOrder = order.fulfillment_method === "pickup";
    const pickupCode = isPickupOrder ? genPickupCode() : null;
    const newStatus = isPickupOrder ? "Ready for Pickup" : "Received";

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        received_at: new Date().toISOString(),
        received_by_officer_id: officer.id !== "ALL" ? officer.id : null,
        ...(pickupCode ? { pickup_code: pickupCode } : {}),
      })
      .eq("id", order.id);

    if (updateError) {
      setError("Could not update this package. Please try again.");
      setReceiving(false);
      return;
    }

    await supabase.from("package_events").insert({
      order_id: order.id,
      label: isPickupOrder ? "Received by Station Officer — Ready for Pickup" : "Received by Station Officer",
      station_id: officer.station_id,
      officer_id: officer.id !== "ALL" ? officer.id : null,
    });

    if (order.user_id) {
      await createNotification({
        recipient_type: "customer",
        recipient_id: order.user_id,
        title: "Order " + order.order_code + (isPickupOrder ? " is ready for pickup" : " received at station"),
        body: isPickupOrder
          ? "Your order has arrived and is ready for collection." + (pickupCode ? " Your pickup code is " + pickupCode + "." : "")
          : "Your order has been received at the station and is being processed.",
        order_id: order.id,
      });
    }

    setSuccess(isPickupOrder ? "Package received — marked Ready for Pickup." : "Package received.");
    setOrder({ ...order, status: newStatus, pickup_code: pickupCode || order.pickup_code });
    setReceiving(false);
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-lg font-bold text-black dark:text-white">Receive Package</h1>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <p className="text-sm font-bold text-black dark:text-white mb-1">Scan Package Barcode / QR Code</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Scan the QR code or enter the tracking number manually.</p>

          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl h-48 flex flex-col items-center justify-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            <p className="text-xs text-gray-400">Camera scanning isn't wired up yet — use the field below</p>
          </div>

          <p className="text-center text-[11px] text-gray-400 mb-4">OR</p>

          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Enter Tracking Number</label>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. THX-KE-2026-000482"
              className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {searching ? "..." : "Search"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-black dark:text-white">Package Details</p>
            {order && (
              <span
                className={
                  "text-[11px] font-bold uppercase rounded-full px-2.5 py-1 " +
                  (alreadyReceived ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400")
                }
              >
                {order.status}
              </span>
            )}
          </div>

          {!order ? (
            <p className="text-sm text-gray-400 py-10 text-center">Search for a package to see its details here.</p>
          ) : (
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Order Number</span><span className="text-black dark:text-white font-medium">{order.order_code}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Customer</span><span className="text-black dark:text-white font-medium">{order.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Phone</span><span className="text-black dark:text-white font-medium">{maskPhone(order.phone)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Items</span><span className="text-black dark:text-white font-medium truncate max-w-[160px] text-right">{(order.items || []).map((i) => i.name).join(", ") || "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Quantity</span><span className="text-black dark:text-white font-medium">{totalQty || "—"}</span></div>
            </div>
          )}

          {order && !alreadyReceived && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-400 text-xs rounded-lg px-3 py-2 mb-4">
              Package is on transit and has not yet been received at this station.
            </div>
          )}

          {order && alreadyReceived && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 text-xs rounded-lg px-3 py-2 mb-4">
              This package has already been received{order.pickup_code ? " — pickup code " + order.pickup_code : ""}.
            </div>
          )}

          {success && <p className="text-xs text-green-600 dark:text-green-400 mb-3">{success}</p>}

          <button
            onClick={handleReceive}
            disabled={!order || !!alreadyReceived || receiving}
            className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            {receiving ? "Receiving..." : "Receive Package"}
          </button>
        </div>
      </div>
    </div>
  );
}

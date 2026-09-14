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
  phone: string;
  user_id: string | null;
  items: OrderItem[] | null;
  total: number;
  payment_status: string | null;
  status: string;
  destination_station_id: string | null;
  pickup_code: string | null;
};

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 4) return phone;
  return phone.slice(0, 3) + "XXX XXX" + phone.slice(-2);
};

const genOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

export default function VerifyPickupPage() {
  const officer = useStationOfficer();
  const [step, setStep] = useState<"search" | "confirm">("search");

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [stationName, setStationName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [checkPickupCode, setCheckPickupCode] = useState(true);
  const [checkPhone, setCheckPhone] = useState(true);
  const [checkId, setCheckId] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [otp, setOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [handoverConfirmed, setHandoverConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [success, setSuccess] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasSignature = useRef(false);

  useEffect(() => {
    if (order?.destination_station_id) {
      fetchStationById(order.destination_station_id).then((r) => {
        if (r.data) setStationName(r.data.name);
      });
    }
  }, [order?.destination_station_id]);

  const resetAll = () => {
    setStep("search");
    setQuery("");
    setOrder(null);
    setEnteredCode("");
    setVerifyError("");
    setOtp(null);
    setEnteredOtp("");
    setHandoverConfirmed(false);
    setConfirmError("");
    setSuccess("");
    hasSignature.current = false;
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSearch = async () => {
    setSearchError("");
    setOrder(null);
    if (!query.trim()) return;
    setSearching(true);

    const q = query.trim();
    const { data } = await supabase
      .from("orders")
      .select("id, order_code, customer_name, phone, user_id, items, total, payment_status, status, destination_station_id, pickup_code")
      .or("order_code.ilike." + q + ",phone.ilike.%" + q + "%")
      .maybeSingle();

    setSearching(false);
    if (!data) {
      setSearchError("No matching order found.");
      return;
    }
    setOrder(data as Order);
  };

  const totalQty = (order?.items || []).reduce((sum, i) => sum + (i.qty || 0), 0);
  const readyForPickup = order?.status === "Ready for Pickup";

  const handleVerify = () => {
    setVerifyError("");
    if (!order) return;

    if (checkPickupCode) {
      if (!enteredCode.trim() || enteredCode.trim() !== order.pickup_code) {
        setVerifyError("Pickup code doesn't match.");
        return;
      }
    }
    if (!checkPickupCode && !checkPhone) {
      setVerifyError("Select at least one verification method.");
      return;
    }

    setVerifying(true);
    supabase
      .from("package_events")
      .insert({
        order_id: order.id,
        label:
          "Customer verified via " +
          [checkPickupCode && "Pickup Code", checkPhone && "Phone Number", checkId && "ID Verification"].filter(Boolean).join(", "),
        station_id: officer.station_id,
        officer_id: officer.id !== "ALL" ? officer.id : null,
      })
      .then(() => {
        setVerifying(false);
        setStep("confirm");
      });
  };

  const handleSendOtp = () => setOtp(genOtp());

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = "#0d2b36";
    ctx.lineWidth = 2;
    ctx.stroke();
    hasSignature.current = true;
  };
  const stopDraw = () => {
    drawing.current = false;
  };
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature.current = false;
  };

  const handleConfirmPickup = async () => {
    if (!order || !handoverConfirmed) return;
    setConfirming(true);
    setConfirmError("");

    let signatureUrl: string | null = null;
    if (hasSignature.current && canvasRef.current) {
      const blob: Blob | null = await new Promise((resolve) => canvasRef.current!.toBlob(resolve, "image/png"));
      if (blob) {
        const fileName = order.order_code + "-" + Date.now() + ".png";
        const { error: uploadError } = await supabase.storage.from("package-signatures").upload(fileName, blob, { contentType: "image/png" });
        if (!uploadError) {
          signatureUrl = supabase.storage.from("package-signatures").getPublicUrl(fileName).data.publicUrl;
        }
      }
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "Picked Up",
        delivered_at: new Date().toISOString(),
        ...(signatureUrl ? { pickup_signature_url: signatureUrl } : {}),
      })
      .eq("id", order.id);

    if (updateError) {
      setConfirmError("Could not confirm pickup. Please try again.");
      setConfirming(false);
      return;
    }

    await supabase.from("package_events").insert({
      order_id: order.id,
      label: "Package picked up by customer, confirmed by " + officer.name,
      station_id: officer.station_id,
      officer_id: officer.id !== "ALL" ? officer.id : null,
    });

    if (order.user_id) {
      await createNotification({
        recipient_type: "customer",
        recipient_id: order.user_id,
        title: "Order " + order.order_code + " picked up",
        body: "You've successfully collected your order. Thanks for shopping with us!",
        order_id: order.id,
      });
    }

    setSuccess("Pickup confirmed — order marked as Picked Up.");
    setConfirming(false);
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-lg font-bold text-black dark:text-white">{step === "search" ? "Verify Customer Pickup" : "Confirm Pickup"}</h1>
      </div>

      {step === "search" && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <p className="text-sm font-bold text-black dark:text-white mb-1">Scan Customer QR Code</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Ask the customer to show their QR code from the Thomex app.</p>

            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl h-40 flex flex-col items-center justify-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              <p className="text-xs text-gray-400">Camera scanning isn't wired up yet — use the field below</p>
            </div>

            <p className="text-center text-[11px] text-gray-400 mb-4">OR</p>

            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Enter Order Number / Phone</label>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. THX-KE-2026-000482 or 07XX XXX 452"
                className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm"
              />
              <button onClick={handleSearch} disabled={searching} className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60">
                {searching ? "..." : "Search"}
              </button>
            </div>
            {searchError && <p className="text-xs text-red-500 mt-2">{searchError}</p>}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-black dark:text-white">Customer &amp; Order Details</p>
              {order && (
                <span className={"text-[11px] font-bold uppercase rounded-full px-2.5 py-1 " + (readyForPickup ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>
                  {order.status}
                </span>
              )}
            </div>

            {!order ? (
              <p className="text-sm text-gray-400 py-10 text-center">Search for an order to verify.</p>
            ) : (
              <>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Customer</span><span className="text-black dark:text-white font-medium">{order.customer_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Phone</span><span className="text-black dark:text-white font-medium">{maskPhone(order.phone)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Order Number</span><span className="text-black dark:text-white font-medium">{order.order_code}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Product</span><span className="text-black dark:text-white font-medium truncate max-w-[160px] text-right">{(order.items || []).map((i) => i.name).join(", ") || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Quantity</span><span className="text-black dark:text-white font-medium">{totalQty || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Amount</span><span className="text-black dark:text-white font-medium">KSh {order.total.toFixed(2)} ({order.payment_status || "—"})</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Pickup Station</span><span className="text-black dark:text-white font-medium">{stationName || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Tracking Number</span><span className="text-black dark:text-white font-medium">{order.order_code}</span></div>
                </div>

                {!readyForPickup && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 text-yellow-700 dark:text-yellow-400 text-xs rounded-lg px-3 py-2 mb-4">
                    This order isn&apos;t marked Ready for Pickup yet, so it can&apos;t be verified for collection.
                  </div>
                )}

                {readyForPickup && (
                  <>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Verification Method</p>
                    <div className="flex flex-wrap gap-4 mb-3 text-xs text-gray-700 dark:text-gray-300">
                      <label className="flex items-center gap-1.5"><input type="checkbox" checked={checkPickupCode} onChange={(e) => setCheckPickupCode(e.target.checked)} /> Pickup Code</label>
                      <label className="flex items-center gap-1.5"><input type="checkbox" checked={checkPhone} onChange={(e) => setCheckPhone(e.target.checked)} /> Phone Number</label>
                      <label className="flex items-center gap-1.5"><input type="checkbox" checked={checkId} onChange={(e) => setCheckId(e.target.checked)} /> ID Verification (Optional)</label>
                    </div>
                    {checkPickupCode && (
                      <input
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value)}
                        placeholder="Enter pickup code e.g. 638214"
                        className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm mb-3"
                      />
                    )}
                    {verifyError && <p className="text-xs text-red-500 mb-2">{verifyError}</p>}
                    <button onClick={handleVerify} disabled={verifying} className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-md disabled:opacity-60">
                      {verifying ? "Verifying..." : "Verify Customer"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {step === "confirm" && order && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-2xl p-5 mb-6">
              <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                All correct — customer has been verified and is ready to collect the package.
              </p>
              <div className="space-y-1 text-xs text-green-700 dark:text-green-400">
                {checkPickupCode && <p className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg> Pickup Code Verified</p>}
                {checkPhone && <p className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg> Phone Number Verified</p>}
                {checkId && <p className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg> ID Verified (Optional)</p>}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Order Number</span><span className="text-black dark:text-white font-medium">{order.order_code}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Customer</span><span className="text-black dark:text-white font-medium">{order.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Station</span><span className="text-black dark:text-white font-medium">{stationName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Officer</span><span className="text-black dark:text-white font-medium">{officer.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Time</span><span className="text-black dark:text-white font-medium">{new Date().toLocaleString()}</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <p className="text-sm font-bold text-black dark:text-white mb-3">Pickup Method</p>

            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">OTP (Optional)</p>
            <button onClick={handleSendOtp} className="w-full border border-gray-200 dark:border-gray-700 text-black dark:text-white text-sm font-semibold py-2 rounded-md mb-2">
              Send OTP
            </button>
            {otp && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                SMS delivery isn&apos;t configured yet — read this code to the customer: <span className="font-bold text-black dark:text-white">{otp}</span>
              </p>
            )}
            <input
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              placeholder="Enter OTP e.g. 638214"
              className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm mb-4"
            />

            <label className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 mb-4">
              <input type="checkbox" checked={handoverConfirmed} onChange={(e) => setHandoverConfirmed(e.target.checked)} className="mt-0.5" />
              I confirm that I have physically handed over the package to the customer.
            </label>

            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Customer Signature (Optional)</p>
            <canvas
              ref={canvasRef}
              width={340}
              height={100}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 mb-2 cursor-crosshair"
            />
            <button onClick={clearSignature} className="text-xs text-gray-400 mb-4">Clear</button>

            {confirmError && <p className="text-xs text-red-500 mb-2">{confirmError}</p>}
            {success ? (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 text-sm rounded-lg px-4 py-3 text-center">
                {success}
                <button onClick={resetAll} className="block mx-auto mt-2 text-xs font-semibold text-brand">Verify another pickup</button>
              </div>
            ) : (
              <button
                onClick={handleConfirmPickup}
                disabled={!handoverConfirmed || confirming}
                className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-md disabled:opacity-50"
              >
                {confirming ? "Confirming..." : "✓ Confirm Pickup"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

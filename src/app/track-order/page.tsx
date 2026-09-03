"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import {
  fetchStatusHistory,
  fetchDeliveryFeedback,
  submitDeliveryFeedback,
  StatusHistoryRow,
  DeliveryFeedback,
} from "@/lib/supabaseOrderTracking";

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
  items: { name?: string; price?: number; qty?: number; image?: string }[] | null;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
  delivery_date: string | null;
  payment_method: string | null;
  payment_status: string | null;
  discount_amount: number | null;
};

const STEPS = ["Pending", "Confirmed", "Shipped", "Delivered"];

const stepLabels: Record<string, string> = {
  Pending: "Ordered",
  Confirmed: "Confirmed",
  Shipped: "Shipped",
  Delivered: "Delivered",
};

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700",
  Confirmed: "bg-blue-50 text-blue-700",
  Shipped: "bg-purple-50 text-purple-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
  Returned: "bg-orange-50 text-orange-700",
};

const historyIcon = (status: string) => {
  const common = { xmlns: "http://www.w3.org/2000/svg", width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (status === "Delivered") return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
  if (status === "Shipped") return <svg {...common}><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8Z" /></svg>;
  if (status === "Confirmed") return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>;
  if (status === "Cancelled") return <svg {...common}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={"inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold " + style}>
      {status}
    </span>
  );
}

function HorizontalStepper({ status }: { status: string }) {
  if (status === "Cancelled" || status === "Returned") {
    const isCancelled = status === "Cancelled";
    return (
      <div className={"border rounded-xl p-4 text-center font-medium " + (isCancelled ? "bg-red-50 border-red-100 text-red-700" : "bg-orange-50 border-orange-100 text-orange-700")}>
        This order was {isCancelled ? "cancelled" : "returned"}.
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => (
        <div key={step} className="flex-1 flex flex-col items-center relative">
          <div className="flex items-center w-full">
            <div className={"flex-1 h-0.5 " + (i === 0 ? "invisible" : i <= activeIndex ? "bg-brand" : "bg-gray-200")} />
            <div
              className={
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 " +
                (i < activeIndex
                  ? "bg-brand text-white"
                  : i === activeIndex
                  ? "bg-brand text-white ring-4 ring-brand/20"
                  : "bg-gray-200 text-gray-400")
              }
            >
              {i < activeIndex ? "✓" : i + 1}
            </div>
            <div className={"flex-1 h-0.5 " + (i === STEPS.length - 1 ? "invisible" : i < activeIndex ? "bg-brand" : "bg-gray-200")} />
          </div>
          <span className="text-[11px] text-gray-600 font-medium mt-2 text-center">{stepLabels[step]}</span>
        </div>
      ))}
    </div>
  );
}

function timeLabel(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DeliveryRating({ orderId, existing }: { orderId: string; existing: DeliveryFeedback | null }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || "");
  const [submitted, setSubmitted] = useState(!!existing);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSaving(true);
    await submitDeliveryFeedback(orderId, rating, comment);
    setSaving(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
        <p className="font-semibold text-black mb-1">Thanks for your feedback!</p>
        <p className="text-sm text-gray-500">You rated this delivery {rating} / 5.</p>
      </div>
    );
  }

  const faces = [
    { v: 1, label: "Bad" },
    { v: 2, label: "Ok" },
    { v: 3, label: "Avg" },
    { v: 4, label: "Good" },
    { v: 5, label: "Best" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <p className="font-semibold text-black mb-4 text-center">How was your delivery experience?</p>
      <div className="flex justify-center gap-3 mb-4">
        {faces.map((f) => (
          <button
            key={f.v}
            onClick={() => setRating(f.v)}
            className="flex flex-col items-center gap-1"
          >
            <span
              className={
                "w-10 h-10 rounded-full flex items-center justify-center text-lg " +
                (rating === f.v ? "bg-brand text-white" : "bg-gray-100 text-gray-400")
              }
            >
              {f.v <= 2 ? "🙁" : f.v === 3 ? "😐" : "🙂"}
            </span>
            <span className="text-[10px] text-gray-500">{f.label}</span>
          </button>
        ))}
      </div>
      {rating > 0 && (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any comments? (optional)"
            rows={2}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mb-3 resize-none focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-brand text-white py-2 rounded-md text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit Feedback"}
          </button>
        </>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<StatusHistoryRow[]>([]);
  const [feedback, setFeedback] = useState<DeliveryFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    setHistory([]);
    setFeedback(null);
    setSearched(true);

    const { data, error: dbError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_code", orderCode.trim())
      .eq("phone", phone.trim())
      .maybeSingle();

    if (dbError || !data) {
      setError("We couldn't find an order matching that order code and phone number.");
      setLoading(false);
      return;
    }

    setOrder(data as Order);

    const [{ data: historyData }, { data: feedbackData }] = await Promise.all([
      fetchStatusHistory(data.id),
      fetchDeliveryFeedback(data.id),
    ]);
    setHistory((historyData as StatusHistoryRow[]) || []);
    setFeedback((feedbackData as DeliveryFeedback) || null);
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-black text-center mb-1">Track Your Order</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Enter your order details to check the current status</p>

        <form onSubmit={handleTrack} className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <p className="font-semibold text-black mb-1">Find Your Order</p>
          <p className="text-xs text-gray-500 mb-4">Enter your order code and phone number to track your order</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Order Code</label>
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="e.g. THX-A1B2C3"
                required
                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                required
                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-md py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>

        {searched && !loading && error && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-center text-sm text-gray-500">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl p-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-black">Order {order.order_code}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-500">
                  Placed on {new Date(order.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  {order.delivery_date && " · Expected delivery " + new Date(order.delivery_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <p className="font-semibold text-black mb-6">Delivery Progress</p>
              <HorizontalStepper status={order.status} />
            </div>

            {history.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <p className="font-semibold text-black mb-4">Tracking History</p>
                <div className="space-y-0">
                  {[...history].reverse().map((h, i) => (
                    <div key={h.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={"w-7 h-7 rounded-full flex items-center justify-center shrink-0 " + (i === 0 ? "bg-brand text-white" : "bg-gray-100 text-gray-400")}>
                          {historyIcon(h.status)}
                        </span>
                        {i < history.length - 1 && <span className="w-px flex-1 bg-gray-200 my-1" />}
                      </div>
                      <div className="pb-5">
                        <p className="text-sm font-semibold text-black">{h.status}</p>
                        <p className="text-xs text-gray-400">{timeLabel(h.changed_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <p className="font-semibold text-black mb-4">Order Items</p>
              <div className="space-y-3">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-black font-medium">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                    </div>
                    <p className="font-semibold text-black">
                      KSh {((item.price || 0) * (item.qty || 0)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm mt-4 pt-3 border-t border-gray-100">
                <span className="text-gray-500">{(order.items || []).length} items</span>
                <span className="font-bold text-black">Total: KSh {order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <p className="font-semibold text-black mb-3">Shipping Address</p>
                <p className="text-sm text-black font-medium">{order.customer_name}</p>
                <p className="text-sm text-gray-500">{order.address}</p>
                <p className="text-sm text-gray-500">{order.phone}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                <p className="font-semibold text-black mb-3">Payment Method</p>
                <p className="text-sm text-black font-medium">{order.payment_method || "—"}</p>
                <p className="text-sm text-gray-500">{order.payment_status || ""}</p>
                <p className="text-sm text-gray-500">Total: KSh {order.total.toFixed(2)}</p>
              </div>
            </div>

            {order.status === "Delivered" && (
              <DeliveryRating orderId={order.id} existing={feedback} />
            )}

            <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
              <p className="font-semibold text-black mb-1">Need Help with Your Order?</p>
              <p className="text-xs text-gray-500 mb-4">Our support team is here to help you with any questions</p>
              
                href="/contact"
                className="inline-block px-5 py-2 rounded-md border border-gray-200 text-sm font-medium text-black hover:bg-gray-50"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

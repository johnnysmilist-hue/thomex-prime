"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";

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
  payment_method: string | null;
  payment_status: string | null;
  discount_amount: number | null;
};

const STEPS = ["Pending", "Confirmed", "Shipped", "Delivered"];

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700",
  Confirmed: "bg-blue-50 text-blue-700",
  Shipped: "bg-purple-50 text-purple-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
  Returned: "bg-orange-50 text-orange-700",
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={"inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold " + style}>
      {status}
    </span>
  );
}

function ProgressStepper({ status }: { status: string }) {
  if (status === "Cancelled") {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center text-red-700 font-medium">
        This order was cancelled.
      </div>
    );
  }

  if (status === "Returned") {
    return (
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center text-orange-700 font-medium">
        This order was returned.
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div>
      <div className="flex items-center mb-3">
        {STEPS.map((step, i) => (
          <div key={step} className="flex-1 flex items-center">
            <div
              className={
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 " +
                (i <= activeIndex ? "bg-brand text-white" : "bg-gray-200 text-gray-400")
              }
            >
              {i < activeIndex ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={"flex-1 h-1 mx-1 rounded " + (i < activeIndex ? "bg-brand" : "bg-gray-200")} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-gray-500">
        {STEPS.map((step) => (
          <span key={step} className="flex-1 text-center first:text-left last:text-right">
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);

    const { data, error: dbError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_code", orderCode.trim())
      .eq("phone", phone.trim())
      .maybeSingle();

    if (dbError || !data) {
      setError("We couldn't find an order matching that order code and phone number.");
    } else {
      setOrder(data as Order);
    }
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
                placeholder="e.g. TX-2024-7890"
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
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <p className="font-semibold text-black mb-5">Delivery Progress</p>
              <ProgressStepper status={order.status} />
            </div>

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

            <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
              <p className="font-semibold text-black mb-1">Need Help with Your Order?</p>
              <p className="text-xs text-gray-500 mb-4">Our support team is here to help you with any questions</p>
              <a
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

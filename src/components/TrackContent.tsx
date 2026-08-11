"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  order_code: string;
  customer_name: string;
  status: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  created_at: string;
};

const steps = ["Pending", "Confirmed", "Shipped", "Delivered"];

export default function TrackContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const lookupOrder = async (orderCode: string) => {
    if (!orderCode.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);

    const { data, error: dbError } = await supabase
      .from("orders")
      .select("order_code, customer_name, status, items, total, created_at")
      .eq("order_code", orderCode.trim().toUpperCase())
      .single();

    setLoading(false);

    if (dbError || !data) {
      setOrder(null);
      setError("No order found with that code. Please check and try again.");
      return;
    }

    setOrder(data as Order);
  };

  useEffect(() => {
    if (initialCode) {
      lookupOrder(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrder(code);
  };

  const currentStepIndex = order ? steps.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-xl font-bold mb-2 text-black dark:text-white text-center">Track Your Order</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
        Enter the order code you received at checkout.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="e.g. THX-AB12CD"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand text-white px-6 py-2 rounded-md font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {order && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Order Code</p>
              <p className="font-bold text-black dark:text-white">{order.order_code}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <p className="font-bold text-brand">{order.status}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            {steps.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center relative">
                <div
                  className={
                    i <= currentStepIndex
                      ? "w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold z-10"
                      : "w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-400 flex items-center justify-center text-xs font-bold z-10"
                  }
                >
                  {i + 1}
                </div>
                <p className="text-[10px] mt-2 text-center text-gray-500 dark:text-gray-400">{step}</p>
                {i < steps.length - 1 && (
                  <div
                    className={
                      i < currentStepIndex
                        ? "absolute top-4 left-1/2 w-full h-0.5 bg-brand"
                        : "absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-800"
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{item.name} x{item.qty}</span>
                <span className="text-black dark:text-white">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-bold">
            <span className="text-black dark:text-white">Total</span>
            <span className="text-brand">${order.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {searched && !order && !loading && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No order found.</p>
      )}
    </div>
  );
}

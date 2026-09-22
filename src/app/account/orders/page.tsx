"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

type OrderItem = { id?: string; name: string; qty: number; price: number };

type Order = {
  id: string;
  order_code: string;
  status: string;
  items: OrderItem[];
  total: number;
  delivery_date: string | null;
  created_at: string;
};

const cancelledStatuses = ["Cancelled", "Canceled", "Returned"];

const statusStyle = (status: string) => {
  if (status === "Delivered") return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400";
  if (cancelledStatuses.includes(status)) return "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400";
  return "bg-brand/10 text-brand";
};

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"current" | "history">("current");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_code, status, items, total, delivery_date, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const loadedOrders = (data as Order[]) || [];
      setOrders(loadedOrders);

      const productIds = Array.from(
        new Set(
          loadedOrders
            .map((o) => o.items?.[0]?.id)
            .filter((id): id is string => Boolean(id))
        )
      );

      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from("products")
          .select("id, image_url")
          .in("id", productIds);

        const map: Record<string, string> = {};
        (products || []).forEach((p: { id: string; image_url: string | null }) => {
          if (p.image_url) map[p.id] = p.image_url;
        });
        setThumbnails(map);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const current = orders.filter((o) => o.status !== "Delivered" && !cancelledStatuses.includes(o.status));
  const history = orders.filter((o) => o.status === "Delivered" || cancelledStatuses.includes(o.status));
  const visible = tab === "current" ? current : history;

  if (authLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-gray-400">Loading...</div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sign in to see your orders.</p>
          <a href="/signin" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">Sign In</a>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-black dark:text-white mb-4">My Orders</h1>

        <div className="flex gap-1 border border-gray-200 dark:border-gray-800 rounded-md p-1 mb-6 w-fit bg-white dark:bg-gray-900">
          <button
            onClick={() => setTab("current")}
            className={
              tab === "current"
                ? "bg-brand text-white text-xs font-semibold px-4 py-1.5 rounded"
                : "text-gray-600 dark:text-gray-300 text-xs font-semibold px-4 py-1.5 rounded"
            }
          >
            Current
          </button>
          <button
            onClick={() => setTab("history")}
            className={
              tab === "history"
                ? "bg-brand text-white text-xs font-semibold px-4 py-1.5 rounded"
                : "text-gray-600 dark:text-gray-300 text-xs font-semibold px-4 py-1.5 rounded"
            }
          >
            History
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading orders...</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tab === "current" ? "No active orders right now." : "No past orders yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {visible.map((order) => {
              const firstItem = order.items?.[0];
              const extraCount = (order.items?.length || 1) - 1;
              const thumb = firstItem?.id ? thumbnails[firstItem.id] : undefined;

              return (
                <div key={order.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-brand/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt={firstItem?.name || "Product"} className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-black dark:text-white">Order ID: #{order.order_code}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {firstItem?.name || "Order"}
                            {extraCount > 0 && " +" + extraCount + " more"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-black dark:text-white">KSh {order.total.toFixed(2)}</p>
                          <span className={"inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full " + statusStyle(order.status)}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          Ordered&nbsp;: {formatDate(order.created_at)}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8Z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                          Delivery&nbsp;: {order.delivery_date ? formatDate(order.delivery_date) : "Not yet scheduled"}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <Link href={"/track?code=" + order.order_code} className="text-brand text-xs font-semibold">
                          See details
                        </Link>
                        <Link href={"/account/orders/" + order.id + "/receipt"} className="text-gray-500 dark:text-gray-400 text-xs font-semibold flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          Receipt
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

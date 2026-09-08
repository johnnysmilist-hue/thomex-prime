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
  if (status === "Delivered") return "bg-green-600 text-white";
  if (cancelledStatuses.includes(status)) return "bg-red-500 text-white";
  return "bg-brand text-white";
};

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ongoing" | "cancelled">("ongoing");

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

  const ongoing = orders.filter((o) => !cancelledStatuses.includes(o.status));
  const cancelled = orders.filter((o) => cancelledStatuses.includes(o.status));
  const visible = tab === "ongoing" ? ongoing : cancelled;

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
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-black dark:text-white mb-4">Orders</h1>

        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 mb-6">
          <button
            onClick={() => setTab("ongoing")}
            className={
              tab === "ongoing"
                ? "text-brand border-b-2 border-brand pb-3 text-sm font-semibold"
                : "text-gray-500 dark:text-gray-400 pb-3 text-sm font-semibold"
            }
          >
            ONGOING/DELIVERED
          </button>
          <button
            onClick={() => setTab("cancelled")}
            className={
              tab === "cancelled"
                ? "text-brand border-b-2 border-brand pb-3 text-sm font-semibold"
                : "text-gray-500 dark:text-gray-400 pb-3 text-sm font-semibold"
            }
          >
            CANCELED/RETURNED {cancelled.length > 0 && "(" + cancelled.length + ")"}
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading orders...</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tab === "ongoing" ? "You have no orders yet." : "No canceled or returned orders."}
          </p>
        ) : (
          <div className="space-y-3">
            {visible.map((order) => {
              const firstItem = order.items?.[0];
              const extraCount = (order.items?.length || 1) - 1;
              const thumb = firstItem?.id ? thumbnails[firstItem.id] : undefined;

              return (
                <div key={order.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded shrink-0 overflow-hidden flex items-center justify-center">
                    {thumb ? (
                      <img src={thumb} alt={firstItem?.name || "Product"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-[10px]">Image</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white line-clamp-1">
                      {firstItem?.name || "Order"}
                      {extraCount > 0 && (
                        <span className="text-gray-400 font-normal"> +{extraCount} more item{extraCount > 1 ? "s" : ""}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Order {order.order_code}</p>
                    <span className={"inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded " + statusStyle(order.status)}>
                      {order.status?.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      On {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      {order.delivery_date && (
                        <> • Expected delivery {new Date(order.delivery_date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}</>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
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
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import { supabase } from "@/lib/supabaseClient";

type OrderItem = { id?: string; name: string; qty: number; price: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  status: string;
  items: OrderItem[];
  created_at: string;
};

export default function VendorOrdersPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <VendorGuard>
        {(store) => <VendorOrders storeId={store.id} />}
      </VendorGuard>
      <Footer />
    </main>
  );
}

function VendorOrders({ storeId }: { storeId: string }) {
  const [orders, setOrders] = useState<{ order: Order; myItems: OrderItem[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: products } = await supabase.from("products").select("id").eq("store_id", storeId);
      const productIds = new Set((products || []).map((p) => p.id));

      if (productIds.size === 0) {
        setLoading(false);
        return;
      }

      const { data: allOrders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

      const matched: { order: Order; myItems: OrderItem[] }[] = [];
      (allOrders || []).forEach((order) => {
        const items = order.items as OrderItem[] | null;
        if (!Array.isArray(items)) return;
        const myItems = items.filter((i) => i.id && productIds.has(i.id));
        if (myItems.length > 0) {
          matched.push({ order: order as Order, myItems });
        }
      });

      setOrders(matched);
      setLoading(false);
    };
    load();
  }, [storeId]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold mb-2 text-black dark:text-white">My Orders</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Orders containing at least one of your products.
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map(({ order, myItems }) => (
            <div key={order.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <p className="text-sm font-bold text-black dark:text-white">{order.order_code}</p>
                <span className="text-xs font-semibold text-brand">{order.status}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{order.customer_name} • {order.phone}</p>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {myItems.map((item, i) => (
                  <p key={i}>{item.name} x{item.qty} — KSh {(item.price * item.qty).toFixed(2)}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

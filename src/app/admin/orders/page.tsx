"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { supabase } from "@/lib/supabaseClient";
import { createNotification } from "@/lib/supabaseNotifications";

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: string;
  notes: string | null;
  user_id: string | null;
  created_at: string;
};

const statuses = ["Pending", "Confirmed", "Shipped", "Delivered"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    const order = orders.find((o) => o.id === id);
    if (order?.user_id) {
      await createNotification({
        recipient_type: "customer",
        recipient_id: order.user_id,
        title: "Order " + order.order_code + " updated",
        body: "Your order is now: " + status,
        order_id: order.id,
      });
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1">
            <h1 className="text-xl font-bold mb-8 text-black dark:text-white">Orders</h1>

            {loading ? (
              <p className="text-sm text-gray-400">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">{order.order_code}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.customer_name} • {order.phone} • ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white text-xs rounded-md px-3 py-1.5"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                          className="text-brand text-xs font-semibold"
                        >
                          {expanded === order.id ? "Hide" : "Details"}
                        </button>
                      </div>
                    </div>

                    {expanded === order.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm space-y-2">
                        <p className="text-gray-600 dark:text-gray-300"><strong className="text-black dark:text-white">Address:</strong> {order.address}</p>
                        {order.notes && <p className="text-gray-600 dark:text-gray-300"><strong className="text-black dark:text-white">Notes:</strong> {order.notes}</p>}
                        <div>
                          <p className="font-semibold text-black dark:text-white mb-1">Items:</p>
                          {order.items.map((item, i) => (
                            <p key={i} className="text-gray-600 dark:text-gray-300 text-xs">
                              {item.name} x{item.qty} — ${(item.price * item.qty).toFixed(2)}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

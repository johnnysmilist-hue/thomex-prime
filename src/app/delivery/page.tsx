"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeliveryGuard from "@/components/DeliveryGuard";
import { supabase } from "@/lib/supabaseClient";
import { markPickedUp, markDelivered, DeliveryOfficer } from "@/lib/supabaseDeliveryOfficers";

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
  status: string;
  user_id: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  created_at: string;
};

const statusPill: Record<string, string> = {
  Assigned: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  "Out for Delivery": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
};

export default function DeliveryPortalPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <DeliveryGuard>{(officer) => <DeliveryDashboard officer={officer} />}</DeliveryGuard>
      <Footer />
    </main>
  );
}

function DeliveryDashboard({ officer }: { officer: DeliveryOfficer }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "delivered">("active");
  const [actingId, setActingId] = useState<string | null>(null);

    const isViewingAll = officer.id === "ALL";

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("id, order_code, customer_name, phone, address, status, user_id, picked_up_at, delivered_at, created_at, assigned_officer_id")
      .order("created_at", { ascending: false });

    if (!isViewingAll) {
      query = query.eq("assigned_officer_id", officer.id);
    } else {
      query = query.not("assigned_officer_id", "is", null);
    }

    const { data } = await query;
    setOrders((data as Order[]) || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officer.id]);

  const handlePickedUp = async (order: Order) => {
    setActingId(order.id);
    await markPickedUp(order.id, order.order_code, order.user_id);
    setActingId(null);
    load();
  };

  const handleDelivered = async (order: Order) => {
    if (!confirm("Confirm this order has been delivered to " + order.customer_name + "?")) return;
    setActingId(order.id);
    await markDelivered(order.id, order.order_code, order.user_id);
    setActingId(null);
    load();
  };

  const active = orders.filter((o) => o.status !== "Delivered");
  const delivered = orders.filter((o) => o.status === "Delivered");
  const visible = tab === "active" ? active : delivered;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1 text-black dark:text-white">Delivery Portal</h1>
       <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {isViewingAll
          ? "Viewing all delivery orders across every officer."
          : "Welcome, " + officer.name + ". Record pickup and delivery for your assigned orders."}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
          <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : active.length}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Active Deliveries</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
          <p className="text-lg font-bold text-green-600 dark:text-green-400 leading-tight">{loading ? "..." : delivered.length}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Completed</p>
        </div>
      </div>

      <div className="flex gap-1 border border-gray-200 dark:border-gray-800 rounded-md p-1 mb-4 w-fit">
        <button
          onClick={() => setTab("active")}
          className={tab === "active" ? "bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded" : "text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1.5 rounded"}
        >
          Active
        </button>
        <button
          onClick={() => setTab("delivered")}
          className={tab === "delivered" ? "bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded" : "text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1.5 rounded"}
        >
          Delivered
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading orders...</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tab === "active" ? "No active deliveries assigned to you right now." : "No completed deliveries yet."}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <p className="text-sm font-bold text-black dark:text-white">#{order.order_code}</p>
                <span className={"text-[11px] font-bold uppercase rounded-full px-2.5 py-1 " + (statusPill[order.status] || "bg-gray-100 text-gray-600")}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{order.customer_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{order.phone}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{order.address}</p>

              {order.picked_up_at && (
                <p className="text-[11px] text-gray-400 mb-1">Picked up: {new Date(order.picked_up_at).toLocaleString()}</p>
              )}
              {order.delivered_at && (
                <p className="text-[11px] text-gray-400 mb-3">Delivered: {new Date(order.delivered_at).toLocaleString()}</p>
              )}

              {order.status === "Assigned" && (
                <button
                  onClick={() => handlePickedUp(order)}
                  disabled={actingId === order.id}
                  className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-md disabled:opacity-60"
                >
                  {actingId === order.id ? "Recording..." : "Mark Picked Up From Store"}
                </button>
              )}

              {order.status === "Out for Delivery" && (
                <button
                  onClick={() => handleDelivered(order)}
                  disabled={actingId === order.id}
                  className="w-full bg-green-600 text-white text-sm font-semibold py-2.5 rounded-md disabled:opacity-60"
                >
                  {actingId === order.id ? "Recording..." : "Mark Delivered to Customer"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

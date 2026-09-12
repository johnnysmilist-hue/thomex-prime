"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeliveryGuard from "@/components/DeliveryGuard";
import { supabase } from "@/lib/supabaseClient";
import { markPickedUp, markDelivered, DeliveryOfficer } from "@/lib/supabaseDeliveryOfficers";

type OrderItem = { name?: string; price?: number; qty?: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
  status: string;
  user_id: string | null;
  items: OrderItem[] | null;
  total: number;
  payment_method: string | null;
  payment_status: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  created_at: string;
};

const STAGES = ["Assigned", "Out for Delivery", "Delivered"];

const statusPill: Record<string, string> = {
  Assigned: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  "Out for Delivery": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
};

const paymentLabel = (method: string | null, status: string | null) => {
  if (method === "mpesa") return status === "paid" ? "Paid via M-Pesa" : "M-Pesa (pending)";
  if (method === "cod") return "Cash on delivery";
  return "—";
};

const TABS = ["All", "Assigned", "Out for Delivery", "Delivered"] as const;

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
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const isViewingAll = officer.id === "ALL";

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select(
        "id, order_code, customer_name, phone, address, status, user_id, items, total, payment_method, payment_status, picked_up_at, delivered_at, created_at, assigned_officer_id"
      )
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

  const counts = useMemo(
    () => ({
      All: orders.length,
      Assigned: orders.filter((o) => o.status === "Assigned").length,
      "Out for Delivery": orders.filter((o) => o.status === "Out for Delivery").length,
      Delivered: orders.filter((o) => o.status === "Delivered").length,
    }),
    [orders]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => tab === "All" || o.status === tab)
      .filter(
        (o) =>
          !q ||
          o.order_code.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q)
      );
  }, [orders, tab, search]);

  const selected = orders.find((o) => o.id === selectedId) || null;

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-black dark:text-white">Orders</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        {isViewingAll
          ? "Viewing all delivery orders across every officer."
          : "Welcome, " + officer.name + ". Record pickup and delivery for your assigned orders."}
      </p>

      <div className="grid md:grid-cols-[1fr_380px] gap-5">
        {/* Orders list pane */}
        <div className={selectedId ? "hidden md:block" : "block"}>
          <div className="relative mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders by ID, status, or recipient..."
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-black dark:text-white placeholder:text-gray-400 outline-none focus:border-brand"
            />
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5 text-sm">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "font-semibold " +
                  (tab === t ? "text-black dark:text-white" : "text-gray-400 dark:text-gray-500")
                }
              >
                {t} <span className="text-gray-400 dark:text-gray-500 font-normal">{counts[t]}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-gray-400">Loading orders...</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tab === "All" ? "No deliveries assigned to you right now." : `No orders in "${tab}".`}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {visible.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedId(order.id)}
                  className={
                    "text-left bg-white dark:bg-gray-900 rounded-2xl p-4 border transition-colors " +
                    (selectedId === order.id
                      ? "border-black dark:border-white"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700")
                  }
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-bold text-black dark:text-white">#{order.order_code}</p>
                    <span className={"text-[10px] font-bold uppercase rounded-full px-2 py-0.5 " + (statusPill[order.status] || "bg-gray-100 text-gray-600")}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-0.5">Delivery address</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">{order.address}</p>
                  <p className="text-[11px] text-gray-400">
                    Ordered {new Date(order.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shipment detail pane */}
        <div className={selectedId ? "block" : "hidden md:block"}>
          {!selected ? (
            <div className="hidden md:flex h-full min-h-[300px] items-center justify-center text-sm text-gray-400 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              Select an order to view details
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-black dark:text-white">Shipment #{selected.order_code}</h2>
                <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-black dark:text-white">#{selected.order_code}</p>
                  <button
                    onClick={() => navigator.clipboard?.writeText(selected.order_code)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title="Copy order code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
                <span className={"text-[10px] font-bold uppercase rounded-full px-2.5 py-1 " + (statusPill[selected.status] || "bg-gray-100 text-gray-600")}>
                  {selected.status}
                </span>
              </div>

              <p className="text-[11px] font-semibold text-gray-400 mb-1">DELIVERY ADDRESS</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{selected.address}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1">CUSTOMER</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selected.customer_name}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1">PHONE</p>
                  <a href={`tel:${selected.phone}`} className="text-sm text-brand font-medium">{selected.phone}</a>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[11px] font-semibold text-gray-400 mb-1">PAYMENT</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {paymentLabel(selected.payment_method, selected.payment_status)}
                  {selected.payment_method === "cod" && (
                    <span className="font-bold text-black dark:text-white"> — collect KSh {selected.total.toFixed(2)}</span>
                  )}
                </p>
              </div>

              {/* Progress stepper */}
              <div className="flex items-center mb-5">
                {STAGES.map((stage, i) => {
                  const currentIndex = STAGES.indexOf(selected.status);
                  const done = currentIndex >= i;
                  return (
                    <div key={stage} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div className={"w-2.5 h-2.5 rounded-full " + (done ? "bg-brand" : "bg-gray-200 dark:bg-gray-700")} />
                        <span className={"text-[9px] font-semibold text-center whitespace-nowrap " + (done ? "text-black dark:text-white" : "text-gray-400")}>
                          {stage}
                        </span>
                      </div>
                      {i < STAGES.length - 1 && (
                        <div className={"h-0.5 flex-1 mx-1 -mt-4 " + (currentIndex > i ? "bg-brand" : "bg-gray-200 dark:bg-gray-700")} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Package details */}
              <p className="text-[11px] font-semibold text-gray-400 mb-2">PACKAGE DETAILS</p>
              <div className="border border-gray-100 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800 mb-2">
                {(selected.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-xs px-3 py-2">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.name} {(item.qty || 1) > 1 ? `x${item.qty}` : ""}
                    </span>
                    <span className="font-medium text-black dark:text-white">
                      KSh {((item.price || 0) * (item.qty || 0)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-bold text-black dark:text-white mb-5">
                <span>Total</span>
                <span>KSh {selected.total.toFixed(2)}</span>
              </div>

              {(selected.picked_up_at || selected.delivered_at) && (
                <div className="mb-5 space-y-1">
                  {selected.picked_up_at && (
                    <p className="text-[11px] text-gray-400">Picked up: {new Date(selected.picked_up_at).toLocaleString()}</p>
                  )}
                  {selected.delivered_at && (
                    <p className="text-[11px] text-gray-400">Delivered: {new Date(selected.delivered_at).toLocaleString()}</p>
                  )}
                </div>
              )}

              {selected.status === "Assigned" && (
                <button
                  onClick={() => handlePickedUp(selected)}
                  disabled={actingId === selected.id}
                  className="w-full bg-brand text-white text-sm font-semibold py-2.5 rounded-md disabled:opacity-60"
                >
                  {actingId === selected.id ? "Recording..." : "Mark Picked Up From Store"}
                </button>
              )}

              {selected.status === "Out for Delivery" && (
                <button
                  onClick={() => handleDelivered(selected)}
                  disabled={actingId === selected.id}
                  className="w-full bg-green-600 text-white text-sm font-semibold py-2.5 rounded-md disabled:opacity-60"
                >
                  {actingId === selected.id ? "Recording..." : "Mark Delivered to Customer"}
                </button>
              )}

              {selected.status === "Delivered" && (
                <div className="w-full bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-semibold py-2.5 rounded-md text-center">
                  Delivered ✓
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

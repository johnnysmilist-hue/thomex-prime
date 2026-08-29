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
  payment_method: string | null;
  delivery_date: string | null;
  created_at: string;
};

const statuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Returned"];

const statusPill: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Shipped: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  Returned: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

const statCards = [
  { key: "Total", label: "Total Orders", bg: "bg-blue-50 dark:bg-blue-500/10", fg: "text-blue-600 dark:text-blue-400" },
  { key: "Pending", label: "Pending Orders", bg: "bg-yellow-50 dark:bg-yellow-500/10", fg: "text-yellow-600 dark:text-yellow-400" },
  { key: "Confirmed", label: "Confirmed Orders", bg: "bg-purple-50 dark:bg-purple-500/10", fg: "text-purple-600 dark:text-purple-400" },
  { key: "Shipped", label: "Shipped Orders", bg: "bg-cyan-50 dark:bg-cyan-500/10", fg: "text-cyan-600 dark:text-cyan-400" },
  { key: "Delivered", label: "Delivered Orders", bg: "bg-green-50 dark:bg-green-500/10", fg: "text-green-600 dark:text-green-400" },
  { key: "Cancelled", label: "Cancelled Orders", bg: "bg-red-50 dark:bg-red-500/10", fg: "text-red-600 dark:text-red-400" },
];

const cardIcon = (key: string) => {
  const common = { xmlns: "http://www.w3.org/2000/svg", width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (key === "Total") return <svg {...common}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
  if (key === "Pending") return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
  if (key === "Confirmed") return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
  if (key === "Shipped") return <svg {...common}><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8Z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
  if (key === "Cancelled") return <svg {...common}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
  return <svg {...common}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></svg>;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

  const updateDeliveryDate = async (id: string, date: string) => {
    await supabase.from("orders").update({ delivery_date: date || null }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, delivery_date: date || null } : o)));
  };

  const counts: Record<string, number> = { Total: orders.length };
  statuses.forEach((s) => { counts[s] = orders.filter((o) => o.status === s).length; });

  const visible = orders.filter((o) => {
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      q === "" ||
      o.order_code.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h1 className="text-xl font-bold text-black dark:text-white">Orders — List View</h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {statCards.map((card) => (
                <div key={card.key} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                  <div className={"w-11 h-11 rounded-xl flex items-center justify-center shrink-0 " + card.bg + " " + card.fg}>
                    {cardIcon(card.key)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : counts[card.key] || 0}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 flex-wrap p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="relative flex-1 min-w-[200px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for order ID, customer, order status..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm"
                >
                  <option value="All">All Statuses</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {loading ? (
                <p className="text-sm text-gray-400 p-6">Loading orders...</p>
              ) : visible.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 p-6">No orders match this view.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                        <th className="px-4 py-3 font-semibold">Order ID</th>
                        <th className="px-4 py-3 font-semibold">Customer</th>
                        <th className="px-4 py-3 font-semibold">Product</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Order Date</th>
                        <th className="px-4 py-3 font-semibold">Delivery Date</th>
                        <th className="px-4 py-3 font-semibold">Payment</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((order) => {
                        const firstItem = order.items?.[0];
                        const extra = (order.items?.length || 1) - 1;
                        return (
                          <>
                            <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-3 font-semibold text-brand">#{order.order_code}</td>
                              <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap">{order.customer_name}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[220px] truncate">
                                {firstItem?.name || "—"}{extra > 0 ? " +" + extra + " more" : ""}
                              </td>
                              <td className="px-4 py-3 text-black dark:text-white font-medium whitespace-nowrap">${order.total.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="date"
                                  value={order.delivery_date || ""}
                                  onChange={(e) => updateDeliveryDate(order.id, e.target.value)}
                                  className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-md px-2 py-1 text-xs"
                                />
                              </td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap capitalize">{order.payment_method || "COD"}</td>
                              <td className="px-4 py-3">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateStatus(order.id, e.target.value)}
                                  className={"text-[11px] font-bold uppercase rounded-full px-2.5 py-1 border-0 focus:outline-none " + (statusPill[order.status] || "bg-gray-100 text-gray-600")}
                                >
                                  {statuses.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                                  className="text-gray-400 hover:text-brand text-lg font-bold px-2"
                                  aria-label="Toggle details"
                                >
                                  ⋯
                                </button>
                              </td>
                            </tr>
                            {expanded === order.id && (
                              <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <td colSpan={9} className="px-4 py-4 text-sm">
                                  <p className="text-gray-600 dark:text-gray-300 mb-1"><strong className="text-black dark:text-white">Phone:</strong> {order.phone}</p>
                                  <p className="text-gray-600 dark:text-gray-300 mb-1"><strong className="text-black dark:text-white">Address:</strong> {order.address}</p>
                                  {order.notes && <p className="text-gray-600 dark:text-gray-300 mb-2"><strong className="text-black dark:text-white">Notes:</strong> {order.notes}</p>}
                                  <p className="font-semibold text-black dark:text-white mb-1">Items:</p>
                                  {order.items.map((item, i) => (
                                    <p key={i} className="text-gray-600 dark:text-gray-300 text-xs">
                                      {item.name} x{item.qty} — ${(item.price * item.qty).toFixed(2)}
                                    </p>
                                  ))}
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

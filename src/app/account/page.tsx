"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";
import { fetchStationById, Station } from "@/lib/supabaseStations";

type OrderItem = { name?: string; qty?: number };

type Order = {
  id: string;
  order_code: string;
  items: OrderItem[] | null;
  total: number;
  status: string;
  created_at: string;
  destination_station_id: string | null;
  pickup_code: string | null;
};

const statusPill: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Dispatched: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "In Transit": "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  Shipped: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  Received: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  "Ready for Pickup": "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  Assigned: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  "Out for Delivery": "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "Picked Up": "bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  Returned: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  "Damaged/Exception": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

const pendingSet = ["Pending"];
const processingSet = ["Confirmed", "Dispatched", "In Transit", "Received", "Ready for Pickup", "Assigned"];
const shippedSet = ["Shipped", "Out for Delivery"];
const deliveredSet = ["Delivered", "Picked Up"];

function Skeleton({ className }: { className: string }) {
  return <div className={"animate-pulse bg-gray-200 dark:bg-gray-800 rounded " + className} />;
}

export default function AccountDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickupStation, setPickupStation] = useState<Station | null>(null);
  const [pickupOrder, setPickupOrder] = useState<Order | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("orders")
        .select("id, order_code, items, total, status, created_at, destination_station_id, pickup_code")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const list = (data as Order[]) || [];
      setOrders(list);

      const activePickup = list.find(
        (o) => o.destination_station_id && !deliveredSet.includes(o.status) && o.status !== "Cancelled" && o.status !== "Returned"
      );
      if (activePickup) {
        setPickupOrder(activePickup);
        const { data: station } = await fetchStationById(activePickup.destination_station_id!);
        setPickupStation(station);
      }

      setLoading(false);
    };
    load();

    fetchAllProductsForSite().then((r) => {
      const featured = r.products.filter((p) => p.featured);
      const rest = r.products.filter((p) => !p.featured);
      setRecommended([...featured, ...rest].slice(0, 4));
    });
  }, [user]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-400">Loading...</div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You're not signed in.</p>
          <a href="/signin" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">Sign In</a>
        </div>
        <Footer />
      </main>
    );
  }

  const username = user.user_metadata?.username || user.email?.split("@")[0] || "Customer";

  const counts = {
    Pending: orders.filter((o) => pendingSet.includes(o.status)).length,
    Processing: orders.filter((o) => processingSet.includes(o.status)).length,
    Shipped: orders.filter((o) => shippedSet.includes(o.status)).length,
    Delivered: orders.filter((o) => deliveredSet.includes(o.status)).length,
  };

  const overviewCards = [
    { key: "Pending", label: "Pending", value: counts.Pending, bg: "bg-orange-50 dark:bg-orange-950/40", fg: "text-orange-600 dark:text-orange-400", icon: "clock" },
    { key: "Processing", label: "Processing", value: counts.Processing, bg: "bg-blue-50 dark:bg-blue-950/40", fg: "text-blue-600 dark:text-blue-400", icon: "box" },
    { key: "Shipped", label: "Shipped", value: counts.Shipped, bg: "bg-green-50 dark:bg-green-950/40", fg: "text-green-600 dark:text-green-400", icon: "truck" },
    { key: "Delivered", label: "Delivered", value: counts.Delivered, bg: "bg-purple-50 dark:bg-purple-950/40", fg: "text-purple-600 dark:text-purple-400", icon: "check" },
  ];

  const cardIcon = (name: string) => {
    const c = { xmlns: "http://www.w3.org/2000/svg", width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (name === "clock") return <svg {...c}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    if (name === "box") return <svg {...c}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
    if (name === "truck") return <svg {...c}><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8Z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
    return <svg {...c}><path d="M20 6 9 17l-5-5" /></svg>;
  };

  const recentOrders = orders.slice(0, 2);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        <AccountSidebar />

        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
            <h1 className="text-xl font-bold text-black dark:text-white mb-1">My Account</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back, {username}! 👋</p>
            <p className="text-xs text-gray-400 mt-1">Manage your account, orders and preferences.</p>
          </div>

          <p className="text-sm font-bold text-black dark:text-white mb-3">Order Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {overviewCards.map((c) => (
              <div key={c.key} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                <div className={"w-9 h-9 rounded-lg flex items-center justify-center mb-3 " + c.bg + " " + c.fg}>
                  {cardIcon(c.icon)}
                </div>
                {loading ? <Skeleton className="h-6 w-8 mb-1" /> : <p className="text-xl font-bold text-black dark:text-white">{c.value}</p>}
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">{c.label}</p>
                <Link href={"/account/orders"} className="text-[11px] font-semibold text-brand">View orders →</Link>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-black dark:text-white">Recent Orders</p>
            <Link href="/account/orders" className="text-xs font-semibold text-brand">View All Orders →</Link>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden mb-8">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 p-6 text-center">You haven't placed any orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                      <th className="px-4 py-3 font-semibold">Order</th>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => {
                      const firstItem = o.items?.[0];
                      const extra = (o.items?.length || 1) - 1;
                      return (
                        <tr key={o.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                          <td className="px-4 py-3 font-semibold text-brand whitespace-nowrap">#{o.order_code}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[180px] truncate">
                            {firstItem?.name || "—"}{extra > 0 ? " +" + extra + " more" : ""}
                          </td>
                          <td className="px-4 py-3 text-black dark:text-white font-medium whitespace-nowrap">KSh {o.total.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={"text-[11px] font-bold rounded-full px-2.5 py-1 " + (statusPill[o.status] || "bg-gray-100 text-gray-600")}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={"/track?code=" + o.order_code} className="text-xs font-semibold text-brand hover:underline">
                              Track Order
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pickupOrder && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-8">
              <p className="text-sm font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
                My Pickup &amp; Delivery
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">Pickup Station</p>
                  <p className="text-sm font-semibold text-black dark:text-white">{pickupStation?.name || "—"}</p>
                  {pickupStation?.address && <p className="text-xs text-gray-500 dark:text-gray-400">{pickupStation.address}</p>}
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">Pickup Code</p>
                  <p className="text-sm font-semibold text-black dark:text-white">{pickupOrder.pickup_code || "Not yet generated"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">Package Status</p>
                  <span className={"inline-block text-[11px] font-bold rounded-full px-2.5 py-1 " + (statusPill[pickupOrder.status] || "bg-gray-100 text-gray-600")}>
                    {pickupOrder.status}
                  </span>
                </div>
              </div>
              <Link href={"/track?code=" + pickupOrder.order_code} className="inline-block mt-4 text-xs font-semibold text-brand hover:underline">
                View Pickup Details →
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-black dark:text-white">Recommended for You</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommended.map((p) => (
              <Link key={p.id} href={"/product/" + p.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                <div className="w-full aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 mb-2 overflow-hidden">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <p className="text-xs text-black dark:text-white font-medium truncate">{p.name}</p>
                <p className="text-sm font-bold text-brand mt-1">KSh {p.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

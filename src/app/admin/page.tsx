"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchProducts } from "@/lib/supabaseProducts";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

type DayStat = { label: string; revenue: number };
type ProductStat = { name: string; unitsSold: number; revenue: number };

export default function AdminDashboard() {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dailyStats, setDailyStats] = useState<DayStat[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const { data: products } = await fetchProducts();
      setProductCount(products?.length || 0);

      const { data: orders } = await supabase.from("orders").select("status, items, total, created_at");
      setOrderCount(orders?.length || 0);
      setPendingCount(orders?.filter((o) => o.status === "Pending").length || 0);

      let rev = 0;
      const last7Days: DayStat[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push({ label: d.toLocaleDateString(undefined, { weekday: "short" }), revenue: 0 });
      }

      const productMap: Record<string, ProductStat> = {};

      (orders || []).forEach((order) => {
        rev += order.total || 0;

        const orderDate = new Date(order.created_at);
        const daysAgo = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo >= 0 && daysAgo <= 6) {
          last7Days[6 - daysAgo].revenue += order.total || 0;
        }

        const items = order.items as { name?: string; price?: number; qty?: number }[] | null;
        if (Array.isArray(items)) {
          items.forEach((item) => {
            const key = item.name || "Unknown";
            if (!productMap[key]) productMap[key] = { name: key, unitsSold: 0, revenue: 0 };
            productMap[key].unitsSold += item.qty || 0;
            productMap[key].revenue += (item.price || 0) * (item.qty || 0);
          });
        }
      });

      setTotalRevenue(rev);
      setDailyStats(last7Days);
      setTopProducts(Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
      setLoading(false);
    };
    loadStats();
  }, []);

  const username = user?.user_metadata?.username || "Admin";
  const maxDayRevenue = Math.max(1, ...dailyStats.map((d) => d.revenue));

  const icon = (name: string) => {
    const common = { xmlns: "http://www.w3.org/2000/svg", width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (name === "products") return <svg {...common}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>;
    if (name === "orders") return <svg {...common}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
    if (name === "pending") return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    return <svg {...common}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
              <h1 className="text-xl font-bold text-black dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Howdy, {username}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {icon("products")}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : productCount}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Total Products</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  {icon("orders")}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : orderCount}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Total Orders</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                  {icon("pending")}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : pendingCount}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Pending Orders</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                  {icon("revenue")}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : "KSh " + totalRevenue.toFixed(2)}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Total Revenue</p>
                </div>
              </div>
            </div>

            {!loading && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6">
                <p className="text-sm font-bold text-black dark:text-white mb-4">Revenue — Last 7 Days</p>
                <div className="flex items-end gap-3 h-40">
                  {dailyStats.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full bg-brand rounded-t-md transition-all"
                        style={{ height: (day.revenue / maxDayRevenue) * 100 + "%", minHeight: day.revenue > 0 ? "4px" : "0px" }}
                        title={"KSh " + day.revenue.toFixed(2)}
                      />
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">{day.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && topProducts.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6">
                <p className="text-sm font-bold text-black dark:text-white mb-4">Top Selling Products</p>
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-black dark:text-white truncate flex-1">{p.name}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs mx-3">{p.unitsSold} sold</span>
                      <span className="text-brand font-semibold">KSh {p.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <a href="/admin/products" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-brand transition-colors">
                <h2 className="text-lg font-bold mb-1 text-black dark:text-white">Products</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, import, or remove products.</p>
              </a>
              <a href="/admin/orders" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-brand transition-colors">
                <h2 className="text-lg font-bold mb-1 text-black dark:text-white">Orders</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">View incoming orders and update their status.</p>
              </a>
            </div>
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

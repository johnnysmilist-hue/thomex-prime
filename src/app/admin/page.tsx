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

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
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
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-black dark:text-white">{loading ? "..." : productCount}</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-black dark:text-white">{loading ? "..." : orderCount}</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending Orders</p>
                <p className="text-2xl font-bold text-brand">{loading ? "..." : pendingCount}</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{loading ? "..." : "KSh " + totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            {!loading && (
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-8">
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
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-8">
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
              <a href="/admin/products" className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-brand transition-colors">
                <h2 className="text-lg font-bold mb-1 text-black dark:text-white">Products</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, import, or remove products.</p>
              </a>
              <a href="/admin/orders" className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-brand transition-colors">
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

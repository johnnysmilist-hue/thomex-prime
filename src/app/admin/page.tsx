"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchProducts } from "@/lib/supabaseProducts";
import { supabase } from "@/lib/supabaseClient";

type DayStat = { label: string; revenue: number };
type ProductStat = { name: string; unitsSold: number; revenue: number };

function StatCard({ icon, iconBg, iconColor, value, label }: { icon: React.ReactNode; iconBg: string; iconColor: string; value: string; label: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4">
      <div className={"w-12 h-12 rounded-lg flex items-center justify-center shrink-0 " + iconBg + " " + iconColor}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-black dark:text-white truncate">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
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

  const maxDayRevenue = Math.max(1, ...dailyStats.map((d) => d.revenue));

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /></svg>}
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-600 dark:text-blue-400"
          value={loading ? "..." : String(productCount)}
          label="Total Products"
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>}
          iconBg="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-600 dark:text-purple-400"
          value={loading ? "..." : String(orderCount)}
          label="Total Orders"
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          iconBg="bg-yellow-50 dark:bg-yellow-950/40"
          iconColor="text-yellow-600 dark:text-yellow-400"
          value={loading ? "..." : String(pendingCount)}
          label="Pending Orders"
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
          iconBg="bg-green-50 dark:bg-green-950/40"
          iconColor="text-green-600 dark:text-green-400"
          value={loading ? "..." : "KSh " + totalRevenue.toFixed(2)}
          label="Total Revenue"
        />
      </div>

      {!loading && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 mb-6">
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
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 mb-6">
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
        <a href="/admin/products" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 hover:border-brand transition-colors">
          <h2 className="text-lg font-bold mb-1 text-black dark:text-white">Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, import, or remove products.</p>
        </a>
        <a href="/admin/orders" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 hover:border-brand transition-colors">
          <h2 className="text-lg font-bold mb-1 text-black dark:text-white">Orders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">View incoming orders and update their status.</p>
        </a>
      </div>
    </AdminLayout>
  );
}

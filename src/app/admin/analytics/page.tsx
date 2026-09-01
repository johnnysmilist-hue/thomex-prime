"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import { fetchProducts, DbProduct } from "@/lib/supabaseProducts";

type OrderItem = { name?: string; price?: number; qty?: number };
type Order = {
  id: string;
  total: number;
  status: string;
  items: OrderItem[] | null;
  created_at: string;
};

const STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Returned"];
const statusDotColors: Record<string, string> = {
  Pending: "#eab308",
  Confirmed: "#3b82f6",
  Shipped: "#a855f7",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
  Returned: "#f97316",
};

function useCountUp(target: number, active: boolean, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(target * progress);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, active]);
  return value;
}

function Skeleton({ className }: { className: string }) {
  return <div className={"animate-pulse bg-gray-200 dark:bg-gray-800 rounded " + className} />;
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div className={"opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards] " + className} style={{ animationDelay: delay + "ms" }}>
      {children}
    </div>
  );
}

function StatCard({ icon, iconBg, iconColor, value, prefix = "", decimals = 0, label, loading }: {
  icon: React.ReactNode; iconBg: string; iconColor: string; value: number; prefix?: string; decimals?: number; label: string; loading: boolean;
}) {
  const animated = useCountUp(value, !loading);
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className={"w-12 h-12 rounded-lg flex items-center justify-center shrink-0 " + iconBg + " " + iconColor}>{icon}</div>
      <div className="min-w-0">
        {loading ? <Skeleton className="h-5 w-16 mb-1.5" /> : (
          <p className="text-lg font-bold text-black dark:text-white truncate">{prefix}{animated.toFixed(decimals)}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState(30);

  useEffect(() => {
    const load = async () => {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total, status, items, created_at")
        .order("created_at", { ascending: false });
      setOrders((ordersData as Order[]) || []);

      const { data: productsData } = await fetchProducts();
      setProducts(productsData || []);

      setLoading(false);
    };
    load();
  }, []);

  const rangeOrders = useMemo(() => {
    const cutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000;
    return orders.filter((o) => new Date(o.created_at).getTime() >= cutoff);
  }, [orders, rangeDays]);

  const totalRevenue = rangeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = rangeOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const unitsSold = rangeOrders.reduce((sum, o) => {
    const items = o.items || [];
    return sum + items.reduce((s, i) => s + (i.qty || 0), 0);
  }, 0);

  const dailyRevenue = useMemo(() => {
    const buckets = Math.min(rangeDays, 30);
    const bucketSize = rangeDays / buckets;
    const days: { label: string; revenue: number }[] = [];
    for (let i = buckets - 1; i >= 0; i--) {
      const daysAgoStart = Math.round(i * bucketSize);
      const d = new Date();
      d.setDate(d.getDate() - daysAgoStart);
      days.push({ label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), revenue: 0 });
    }
    rangeOrders.forEach((o) => {
      const daysAgo = Math.floor((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const bucketIndex = buckets - 1 - Math.min(Math.floor(daysAgo / bucketSize), buckets - 1);
      if (days[bucketIndex]) days[bucketIndex].revenue += o.total || 0;
    });
    return days;
  }, [rangeOrders, rangeDays]);

  const maxRevenue = Math.max(1, ...dailyRevenue.map((d) => d.revenue));

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; unitsSold: number; revenue: number }> = {};
    rangeOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.name || "Unknown";
        if (!map[key]) map[key] = { name: key, unitsSold: 0, revenue: 0 };
        map[key].unitsSold += item.qty || 0;
        map[key].revenue += (item.price || 0) * (item.qty || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [rangeOrders]);

  const categoryRevenue = useMemo(() => {
    const productMap = new Map(products.map((p) => [p.name, p.category]));
    const map: Record<string, number> = {};
    rangeOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const baseName = (item.name || "").split(" (")[0];
        const category = productMap.get(baseName) || productMap.get(item.name || "") || "Other";
        map[category] = (map[category] || 0) + (item.price || 0) * (item.qty || 0);
      });
    });
    return Object.entries(map)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [rangeOrders, products]);

  const maxCategoryRevenue = Math.max(1, ...categoryRevenue.map((c) => c.revenue));

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rangeOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [rangeOrders]);

  return (
    <AdminLayout title="Analytics">
      <FadeIn delay={0} className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Track your store's performance and key sales metrics.</p>
        <div className="flex gap-1">
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => setRangeDays(d)}
              className={
                "text-xs px-3 py-1.5 rounded-md font-medium transition-colors " +
                (rangeDays === d
                  ? "bg-brand text-white"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800")
              }
            >
              {d === 365 ? "1y" : d + "d"}
            </button>
          ))}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <FadeIn delay={50}>
          <StatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
            iconBg="bg-green-50 dark:bg-green-950/40" iconColor="text-green-600 dark:text-green-400"
            value={totalRevenue} prefix="KSh " decimals={2} label="Total Revenue" loading={loading}
          />
        </FadeIn>
        <FadeIn delay={100}>
          <StatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>}
            iconBg="bg-purple-50 dark:bg-purple-950/40" iconColor="text-purple-600 dark:text-purple-400"
            value={totalOrders} label="Total Orders" loading={loading}
          />
        </FadeIn>
        <FadeIn delay={150}>
          <StatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
            iconBg="bg-blue-50 dark:bg-blue-950/40" iconColor="text-blue-600 dark:text-blue-400"
            value={avgOrderValue} prefix="KSh " decimals={2} label="Avg Order Value" loading={loading}
          />
        </FadeIn>
        <FadeIn delay={200}>
          <StatCard
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /></svg>}
            iconBg="bg-yellow-50 dark:bg-yellow-950/40" iconColor="text-yellow-600 dark:text-yellow-400"
            value={unitsSold} label="Units Sold" loading={loading}
          />
        </FadeIn>
      </div>

      <FadeIn delay={250} className="mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 transition-shadow hover:shadow-md">
          <p className="text-sm font-bold text-black dark:text-white mb-4">Revenue Over Time</p>
          {loading ? (
            <div className="flex items-end gap-1.5 h-48">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="flex-1 rounded-t-md" />)}
            </div>
          ) : (
            <div className="flex items-end gap-1 h-48">
              {dailyRevenue.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div
                    className="w-full bg-brand rounded-t-sm transition-all duration-700 ease-out group-hover:opacity-80"
                    style={{ height: (d.revenue / maxRevenue) * 100 + "%", minHeight: d.revenue > 0 ? "3px" : "0px" }}
                    title={d.label + ": KSh " + d.revenue.toFixed(2)}
                  />
                  {dailyRevenue.length <= 14 && (
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1.5 rotate-0">{d.label}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <FadeIn delay={300}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 h-full transition-shadow hover:shadow-md">
            <p className="text-sm font-bold text-black dark:text-white mb-4">Sales by Category</p>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
            ) : categoryRevenue.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No sales in this period.</p>
            ) : (
              <div className="space-y-3">
                {categoryRevenue.map((c) => (
                  <div key={c.category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-black dark:text-white font-medium">{c.category}</span>
                      <span className="text-gray-500 dark:text-gray-400">KSh {c.revenue.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-700 ease-out"
                        style={{ width: (c.revenue / maxCategoryRevenue) * 100 + "%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={350}>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 h-full transition-shadow hover:shadow-md">
            <p className="text-sm font-bold text-black dark:text-white mb-4">Order Status</p>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
            ) : (
              <div className="space-y-2.5">
                {STATUSES.filter((s) => statusCounts[s]).map((status) => {
                  const count = statusCounts[status] || 0;
                  const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center gap-3 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: statusDotColors[status] }} />
                      <span className="text-gray-600 dark:text-gray-300 w-16 shrink-0">{status}</span>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: pct + "%", backgroundColor: statusDotColors[status] }}
                        />
                      </div>
                      <span className="font-semibold text-black dark:text-white w-6 text-right shrink-0">{count}</span>
                    </div>
                  );
                })}
                {totalOrders === 0 && <p className="text-sm text-gray-400 text-center py-8">No orders in this period.</p>}
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={400}>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden transition-shadow hover:shadow-md">
          <p className="text-sm font-bold text-black dark:text-white p-5 pb-3">Top Products</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                  <th className="px-5 py-2 font-semibold">Product</th>
                  <th className="px-5 py-2 font-semibold">Units Sold</th>
                  <th className="px-5 py-2 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800/60">
                    <td className="px-5 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-5 py-3"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))}
                {!loading && topProducts.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">No sales in this period.</td></tr>
                )}
                {!loading && topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 text-black dark:text-white font-medium">{p.name}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{p.unitsSold}</td>
                    <td className="px-5 py-3 font-semibold text-brand">KSh {p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </AdminLayout>
  );
}

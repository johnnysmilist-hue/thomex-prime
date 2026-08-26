"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import { supabase } from "@/lib/supabaseClient";

export default function VendorDashboard() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <VendorGuard>
        {(store) => <VendorHome storeId={store.id} storeName={store.name} commissionRate={store.commission_rate} />}
      </VendorGuard>
      <Footer />
    </main>
  );
}

type DayStat = { label: string; revenue: number };
type ProductStat = { name: string; unitsSold: number; revenue: number };

function VendorHome({ storeId, storeName, commissionRate }: { storeId: string; storeName: string; commissionRate: number | null }) {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [dailyStats, setDailyStats] = useState<DayStat[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: products } = await supabase.from("products").select("id").eq("store_id", storeId);
      const productIds = (products || []).map((p) => p.id);
      setProductCount(productIds.length);

      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: orders } = await supabase.from("orders").select("items, total, created_at");

      let count = 0;
      let rev = 0;

      const last7Days: DayStat[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString(undefined, { weekday: "short" });
        last7Days.push({ label, revenue: 0 });
      }

      const productRevenueMap: Record<string, ProductStat> = {};

      (orders || []).forEach((order) => {
        const items = order.items as { id?: string; name?: string; price?: number; qty?: number }[] | null;
        if (!Array.isArray(items)) return;
        const matching = items.filter((i) => i.id && productIds.includes(i.id));
        if (matching.length === 0) return;

        count += 1;
        const orderDate = new Date(order.created_at);
        const daysAgo = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

        matching.forEach((m) => {
          const lineRevenue = (m.price || 0) * (m.qty || 0);
          rev += lineRevenue;

          if (daysAgo >= 0 && daysAgo <= 6) {
            last7Days[6 - daysAgo].revenue += lineRevenue;
          }

          const key = m.name || "Unknown";
          if (!productRevenueMap[key]) {
            productRevenueMap[key] = { name: key, unitsSold: 0, revenue: 0 };
          }
          productRevenueMap[key].unitsSold += m.qty || 0;
          productRevenueMap[key].revenue += lineRevenue;
        });
      });

      setOrderCount(count);
      setRevenue(rev);
      setDailyStats(last7Days);
      setTopProducts(Object.values(productRevenueMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
      setLoading(false);
    };
    load();
  }, [storeId]);

  const maxDayRevenue = Math.max(1, ...dailyStats.map((d) => d.revenue));
  const rate = commissionRate ?? 10;
  const payoutEstimate = revenue * (1 - rate / 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-black dark:text-white">{storeName} — Vendor Dashboard</h1>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-full">
          Commission rate: {rate}%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Products</p>
          <p className="text-2xl font-bold text-black dark:text-white">{loading ? "..." : productCount}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Orders Containing Your Items</p>
          <p className="text-2xl font-bold text-black dark:text-white">{loading ? "..." : orderCount}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gross Revenue</p>
          <p className="text-2xl font-bold text-brand">{loading ? "..." : "KSh " + revenue.toFixed(2)}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Est. Payout (after {rate}%)</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{loading ? "..." : "KSh " + payoutEstimate.toFixed(2)}</p>
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
          <p className="text-sm font-bold text-black dark:text-white mb-4">Top Products</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <a href="/vendor/products" className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-brand transition-colors">
          <h2 className="text-lg font-bold mb-1 text-black dark:text-white">My Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, or remove your products.</p>
        </a>
        <a href="/vendor/orders" className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-brand transition-colors">
          <h2 className="text-lg font-bold mb-1 text-black dark:text-white">My Orders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">See orders containing your products.</p>
        </a>
        <a href="/vendor/messages" className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-brand transition-colors">
          <h2 className="text-lg font-bold mb-1 text-black dark:text-white">Messages</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Chat with the Thomex admin team.</p>
        </a>
      </div>
    </div>
  );
}

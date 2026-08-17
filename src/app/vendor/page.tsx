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
        {(store) => <VendorHome storeId={store.id} storeName={store.name} />}
      </VendorGuard>
      <Footer />
    </main>
  );
}

function VendorHome({ storeId, storeName }: { storeId: string; storeName: string }) {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: products } = await supabase.from("products").select("id").eq("store_id", storeId);
      const productIds = (products || []).map((p) => p.id);
      setProductCount(productIds.length);

      if (productIds.length > 0) {
        const { data: orders } = await supabase.from("orders").select("items, total");
        let count = 0;
        let rev = 0;
        (orders || []).forEach((order) => {
          const items = order.items as { id?: string; price?: number; qty?: number }[] | null;
          if (!Array.isArray(items)) return;
          const matching = items.filter((i) => i.id && productIds.includes(i.id));
          if (matching.length > 0) {
            count += 1;
            matching.forEach((m) => {
              rev += (m.price || 0) * (m.qty || 0);
            });
          }
        });
        setOrderCount(count);
        setRevenue(rev);
      }

      setLoading(false);
    };
    load();
  }, [storeId]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-black dark:text-white">{storeName} — Vendor Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Products</p>
          <p className="text-2xl font-bold text-black dark:text-white">{loading ? "..." : productCount}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Orders Containing Your Items</p>
          <p className="text-2xl font-bold text-black dark:text-white">{loading ? "..." : orderCount}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue</p>
          <p className="text-2xl font-bold text-brand">{loading ? "..." : "KSh " + revenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <a href="/vendor/products" className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-brand transition-colors">
          <h2 className="text-lg font-bold mb-1 text-black dark:text-white">My Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, or remove your products.</p>
        </a>
        <a href="/vendor/orders" className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-brand transition-colors">
          <h2 className="text-lg font-bold mb-1 text-black dark:text-white">My Orders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">See orders containing your products.</p>
        </a>
      </div>
    </div>
  );
}

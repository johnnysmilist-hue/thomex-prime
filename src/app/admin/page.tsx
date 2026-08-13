"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchProducts } from "@/lib/supabaseProducts";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const { data: products } = await fetchProducts();
      setProductCount(products?.length || 0);

      const { data: orders } = await supabase.from("orders").select("status");
      setOrderCount(orders?.length || 0);
      setPendingCount(orders?.filter((o) => o.status === "Pending").length || 0);

      setLoading(false);
    };
    loadStats();
  }, []);

  const username = user?.user_metadata?.username || "Admin";

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
              <h1 className="text-xl font-bold text-black dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Howdy, {username} 👋</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
            </div>

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

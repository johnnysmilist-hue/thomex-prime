"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-xl font-bold mb-8 text-black dark:text-white">Admin Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
              href="/admin/products"
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-brand transition-colors"
            >
              <h2 className="text-lg font-bold mb-1 text-black dark:text-white">Products</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add, edit, or remove products from your store.
              </p>
            </a>

            
              href="/admin/orders"
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-brand transition-colors"
            >
              <h2 className="text-lg font-bold mb-1 text-black dark:text-white">Orders</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View incoming orders and update their status.
              </p>
            </a>
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

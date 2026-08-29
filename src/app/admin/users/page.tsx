"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { supabase } from "@/lib/supabaseClient";

type Customer = {
  id: string;
  email: string;
  username: string;
  orderCount: number;
  totalSpent: number;
};

export default function AdminUsersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: orders } = await supabase.from("orders").select("phone, customer_name, total");

      const map = new Map<string, Customer>();
      (orders || []).forEach((o) => {
        const key = o.phone;
        if (!map.has(key)) {
          map.set(key, { id: key, email: o.phone, username: o.customer_name, orderCount: 0, totalSpent: 0 });
        }
        const entry = map.get(key)!;
        entry.orderCount += 1;
        entry.totalSpent += o.total;
      });

      setCustomers(Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent));
      setLoading(false);
    };
    load();
  }, []);

  const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1">
            <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Customers</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Everyone who has placed an order, ranked by total spend.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : customers.length}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Total Customers</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : "$" + totalRevenue.toFixed(2)}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Total Revenue</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : "$" + avgOrderValue.toFixed(2)}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Avg Order Value</p>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">Loading customers...</p>
            ) : customers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No customers yet — this fills in as orders come through checkout.</p>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                      <th className="px-4 py-2 font-semibold text-black dark:text-white">Name</th>
                      <th className="px-4 py-2 font-semibold text-black dark:text-white">Phone</th>
                      <th className="px-4 py-2 font-semibold text-black dark:text-white">Orders</th>
                      <th className="px-4 py-2 font-semibold text-black dark:text-white">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-2 text-black dark:text-white">{c.username}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{c.email}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{c.orderCount}</td>
                        <td className="px-4 py-2 text-brand font-semibold">${c.totalSpent.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

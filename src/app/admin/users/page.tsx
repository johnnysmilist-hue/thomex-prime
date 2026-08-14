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

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1">
            <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Customers</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Everyone who has placed an order, ranked by total spend.
            </p>

            {loading ? (
              <p className="text-sm text-gray-400">Loading customers...</p>
            ) : customers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No customers yet — this fills in as orders come through checkout.</p>
            ) : (
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 text-left">
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

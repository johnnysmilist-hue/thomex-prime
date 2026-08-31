"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabaseClient";

type Customer = {
  id: string;
  email: string;
  username: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
};

export default function AdminUsersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("phone, customer_name, total, created_at")
        .order("created_at", { ascending: false });

      const map = new Map<string, Customer>();
      (orders || []).forEach((o) => {
        const key = o.phone;
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            email: o.phone,
            username: o.customer_name,
            orderCount: 0,
            totalSpent: 0,
            lastOrderAt: o.created_at,
          });
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

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.username?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const initials = (name: string) => (name || "?").trim().charAt(0).toUpperCase();

  return (
    <AdminLayout title="Customers">
      <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4 mb-6">
        Everyone who has placed an order, ranked by total spend.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-black dark:text-white truncate">{loading ? "..." : customers.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Customers</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-black dark:text-white truncate">{loading ? "..." : "KSh " + totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-black dark:text-white truncate">{loading ? "..." : "KSh " + avgOrderValue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Order Value</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative max-w-xs w-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-black dark:text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Orders</th>
                <th className="px-5 py-3 font-semibold">Total Spent</th>
                <th className="px-5 py-3 font-semibold">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">Loading customers...</td>
                </tr>
              )}
              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    {customers.length === 0 ? "No customers yet — this fills in as orders come through checkout." : "No customers match your search."}
                  </td>
                </tr>
              )}
              {!loading &&
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">
                          {initials(c.username)}
                        </div>
                        <span className="text-black dark:text-white font-medium">{c.username || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{c.email}</td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{c.orderCount}</td>
                    <td className="px-5 py-3 font-semibold text-brand">KSh {c.totalSpent.toFixed(2)}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(c.lastOrderAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

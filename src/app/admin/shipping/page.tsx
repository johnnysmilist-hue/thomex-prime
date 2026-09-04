"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchShippingRates, updateShippingRate, ShippingRate } from "@/lib/supabaseShipping";

export default function AdminShippingPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchShippingRates();
    setRates((data as ShippingRate[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (id: string, fee: number) => {
    setSavingId(id);
    setRates((prev) => prev.map((r) => (r.id === id ? { ...r, fee } : r)));
    await updateShippingRate(id, fee);
    setSavingId(null);
  };

  const filtered = rates.filter((r) => r.county.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Shipping Rates">
      <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4 mb-6">
        Set the delivery fee for each county. Customers see this fee applied automatically at checkout based on their delivery location.
      </p>

      <div className="relative max-w-xs mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search county..."
          className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-black dark:text-white focus:outline-none"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                <th className="px-5 py-3 font-semibold">County</th>
                <th className="px-5 py-3 font-semibold">Shipping Fee (KSh)</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-gray-400">Loading...</td></tr>
              )}
              {!loading && filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 dark:border-gray-800/60">
                  <td className="px-5 py-3 text-black dark:text-white font-medium">{r.county}</td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      min="0"
                      defaultValue={r.fee}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (val !== r.fee) handleUpdate(r.id, val);
                      }}
                      className="w-28 px-2 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:border-brand"
                    />
                    {savingId === r.id && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
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

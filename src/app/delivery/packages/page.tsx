"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useStationOfficer } from "@/context/StationOfficerContext";

type OrderItem = { name?: string };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  items: OrderItem[] | null;
  status: string;
  created_at: string;
};

const tabs = [
  { key: "All", label: "All" },
  { key: "Expected", label: "Expected", statuses: ["Dispatched", "In Transit"] },
  { key: "Received", label: "Received", statuses: ["Received"] },
  { key: "Ready", label: "Ready", statuses: ["Ready for Pickup"] },
  { key: "Picked Up", label: "Picked Up", statuses: ["Picked Up"] },
  { key: "Returned", label: "Returned", statuses: ["Returned"] },
  { key: "Problem", label: "Problem", statuses: ["Damaged/Exception"] },
];

const statusPill: Record<string, string> = {
  Dispatched: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "In Transit": "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  Received: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  "Ready for Pickup": "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  "Picked Up": "bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400",
  Returned: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  "Damaged/Exception": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

export default function PackagesListPage() {
  const officer = useStationOfficer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from("orders")
        .select("id, order_code, customer_name, phone, items, status, created_at")
        .order("created_at", { ascending: false });
      if (officer.id !== "ALL" && officer.station_id) {
        query = query.eq("destination_station_id", officer.station_id);
      }
      const { data } = await query;
      setOrders((data as Order[]) || []);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officer.station_id]);

  const tabCounts: Record<string, number> = { All: orders.length };
  tabs.slice(1).forEach((t) => {
    tabCounts[t.key] = orders.filter((o) => t.statuses?.includes(o.status)).length;
  });

  const activeTab = tabs.find((t) => t.key === tab)!;
  const q = search.trim().toLowerCase();

  const visible = orders.filter((o) => {
    const matchesTab = tab === "All" || activeTab.statuses?.includes(o.status);
    const matchesSearch =
      q === "" ||
      o.order_code.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      (o.items || []).some((i) => (i.name || "").toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-lg font-bold text-black dark:text-white">Packages</h1>
      </div>

      <div className="p-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-1 px-4 pt-4 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  tab === t.key
                    ? "text-xs font-semibold px-3 py-1.5 rounded-md bg-brand text-white"
                    : "text-xs font-semibold px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              >
                {t.label} ({tabCounts[t.key] ?? 0})
              </button>
            ))}
          </div>

          <div className="p-4">
            <div className="relative max-w-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order number, tracking number, customer name, phone or product..."
                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 px-4 pb-6">Loading...</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 px-4 pb-6">No packages match this view.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                    <th className="px-4 py-3 font-semibold">Order Number</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-brand">{o.order_code}</td>
                      <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap">{o.customer_name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[220px] truncate">
                        {(o.items || []).map((i) => i.name).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={"text-[11px] font-bold rounded-full px-2.5 py-1 " + (statusPill[o.status] || "bg-gray-100 text-gray-600")}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={"/delivery/tracking/" + o.id} className="text-xs font-semibold text-brand hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

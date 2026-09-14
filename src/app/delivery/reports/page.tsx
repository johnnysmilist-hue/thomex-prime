"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useStationOfficer } from "@/context/StationOfficerContext";

type OrderItem = { name?: string; qty?: number };
type OrderRow = { id: string; items: OrderItem[] | null; status: string; package_condition: string | null };
type EventRow = { order_id: string; label: string; created_at: string };

function Skeleton({ className }: { className: string }) {
  return <div className={"animate-pulse bg-gray-200 dark:bg-gray-800 rounded " + className} />;
}

export default function StationReportsPage() {
  const officer = useStationOfficer();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      let orderQuery = supabase.from("orders").select("id, items, status, package_condition");
      if (officer.id !== "ALL" && officer.station_id) {
        orderQuery = orderQuery.eq("destination_station_id", officer.station_id);
      }
      const { data: orderData } = await orderQuery;
      setOrders((orderData as OrderRow[]) || []);

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      let eventQuery = supabase.from("package_events").select("order_id, label, created_at").gte("created_at", weekAgo);
      if (officer.id !== "ALL" && officer.station_id) {
        eventQuery = eventQuery.eq("station_id", officer.station_id);
      }
      const { data: eventData } = await eventQuery;
      setEvents((eventData as EventRow[]) || []);

      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officer.station_id]);

  const todayStr = new Date().toDateString();
  const isToday = (iso: string) => new Date(iso).toDateString() === todayStr;
  const matches = (label: string, needle: string) => label.toLowerCase().includes(needle.toLowerCase());

  const todayReceived = events.filter((e) => isToday(e.created_at) && matches(e.label, "received")).length;
  const todayPickedUp = events.filter((e) => isToday(e.created_at) && matches(e.label, "picked up")).length;
  const todayReturns = events.filter((e) => isToday(e.created_at) && matches(e.label, "return processed")).length;
  const pendingNow = orders.filter((o) => o.status === "Ready for Pickup").length;
  const damagedNow = orders.filter((o) => o.package_condition && o.package_condition !== "Good condition").length;

  const summaryCards = [
    { label: "Packages Received", value: todayReceived, bg: "bg-blue-50 dark:bg-blue-950/40", fg: "text-blue-600 dark:text-blue-400" },
    { label: "Picked Up", value: todayPickedUp, bg: "bg-green-50 dark:bg-green-950/40", fg: "text-green-600 dark:text-green-400" },
    { label: "Pending", value: pendingNow, bg: "bg-yellow-50 dark:bg-yellow-950/40", fg: "text-yellow-600 dark:text-yellow-400" },
    { label: "Returns", value: todayReturns, bg: "bg-orange-50 dark:bg-orange-950/40", fg: "text-orange-600 dark:text-orange-400" },
    { label: "Damaged", value: damagedNow, bg: "bg-red-50 dark:bg-red-950/40", fg: "text-red-600 dark:text-red-400" },
  ];

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const weekly = days.map((d) => {
    const dayStr = d.toDateString();
    const dayEvents = events.filter((e) => new Date(e.created_at).toDateString() === dayStr);
    return {
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      received: dayEvents.filter((e) => matches(e.label, "received")).length,
      pickedUp: dayEvents.filter((e) => matches(e.label, "picked up")).length,
      returned: dayEvents.filter((e) => matches(e.label, "return processed")).length,
    };
  });

  const orderItemsMap: Record<string, OrderItem[]> = {};
  orders.forEach((o) => (orderItemsMap[o.id] = o.items || []));

  const productCounts: Record<string, number> = {};
  events
    .filter((e) => matches(e.label, "received"))
    .forEach((e) => {
      (orderItemsMap[e.order_id] || []).forEach((item) => {
        if (!item.name) return;
        productCounts[item.name] = (productCounts[item.name] || 0) + (item.qty || 1);
      });
    });
  const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-black dark:text-white">Station Reports</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
      </div>

      <div className="p-6 max-w-5xl">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Today&apos;s Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {summaryCards.map((c) => (
            <div key={c.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              {loading ? <Skeleton className="h-6 w-10 mb-2" /> : <p className={"text-xl font-bold " + c.fg}>{c.value}</p>}
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <p className="text-sm font-bold text-black dark:text-white mb-4">Weekly Overview</p>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                    <th className="py-2 font-semibold">Day</th>
                    <th className="py-2 font-semibold text-right">Received</th>
                    <th className="py-2 font-semibold text-right">Picked Up</th>
                    <th className="py-2 font-semibold text-right">Returned</th>
                  </tr>
                </thead>
                <tbody>
                  {weekly.map((w) => (
                    <tr key={w.label} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <td className="py-2 text-black dark:text-white font-medium">{w.label}</td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-300">{w.received}</td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-300">{w.pickedUp}</td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-300">{w.returned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <p className="text-sm font-bold text-black dark:text-white mb-4">Top Products (This Week)</p>
            {loading ? (
              <Skeleton className="h-40 w-full" />
            ) : topProducts.length === 0 ? (
              <p className="text-xs text-gray-400">No packages received this week yet.</p>
            ) : (
              <ol className="space-y-2.5 text-sm">
                {topProducts.map(([name, count], i) => (
                  <li key={name} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
                      <span className="text-gray-400 mr-1.5">{i + 1}.</span>
                      {name}
                    </span>
                    <span className="text-black dark:text-white font-semibold">{count}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

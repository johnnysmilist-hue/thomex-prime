"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useStationOfficer } from "@/context/StationOfficerContext";

type OrderRow = { id: string; status: string; destination_station_id: string | null };

const statCards = [
  { key: "Dispatched", label: "Expected Today", bg: "bg-purple-50 dark:bg-purple-950/40", fg: "text-purple-600 dark:text-purple-400" },
  { key: "In Transit", label: "In Transit", bg: "bg-blue-50 dark:bg-blue-950/40", fg: "text-blue-600 dark:text-blue-400" },
  { key: "Received", label: "Received", bg: "bg-green-50 dark:bg-green-950/40", fg: "text-green-600 dark:text-green-400" },
  { key: "Ready for Pickup", label: "Ready for Pickup", bg: "bg-yellow-50 dark:bg-yellow-950/40", fg: "text-yellow-600 dark:text-yellow-400" },
  { key: "Picked Up", label: "Picked Up", bg: "bg-cyan-50 dark:bg-cyan-950/40", fg: "text-cyan-600 dark:text-cyan-400" },
  { key: "Returned", label: "Returned", bg: "bg-red-50 dark:bg-red-950/40", fg: "text-red-600 dark:text-red-400" },
];

const cardIcon = (key: string) => {
  const c = { xmlns: "http://www.w3.org/2000/svg", width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (key === "Dispatched") return <svg {...c}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
  if (key === "In Transit") return <svg {...c}><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8Z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
  if (key === "Received") return <svg {...c}><path d="M20 6 9 17l-5-5" /></svg>;
  if (key === "Ready for Pickup") return <svg {...c}><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></svg>;
  if (key === "Picked Up") return <svg {...c}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
  return <svg {...c}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 5v5h5" /></svg>;
};

const quickActions = [
  { href: "/delivery/receive", label: "Receive Package", icon: "receive" },
  { href: "/delivery/verify", label: "Verify Pickup", icon: "verify" },
  { href: "/delivery/packages", label: "View Packages", icon: "packages" },
  { href: "/delivery/returns", label: "Process Return", icon: "return" },
  { href: "/delivery/reports", label: "Reports", icon: "reports" },
];

const actionIcon = (icon: string) => {
  const c = { xmlns: "http://www.w3.org/2000/svg", width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (icon === "receive") return <svg {...c}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
  if (icon === "verify") return <svg {...c}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
  if (icon === "packages") return <svg {...c}><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
  if (icon === "return") return <svg {...c}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 5v5h5" /></svg>;
  return <svg {...c}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
};

function Skeleton({ className }: { className: string }) {
  return <div className={"animate-pulse bg-gray-200 dark:bg-gray-800 rounded " + className} />;
}

export default function StationDashboardPage() {
  const officer = useStationOfficer();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const isAll = officer.id === "ALL";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from("orders").select("id, status, destination_station_id");
      if (!isAll && officer.station_id) {
        query = query.eq("destination_station_id", officer.station_id);
      }
      const { data } = await query;
      setOrders((data as OrderRow[]) || []);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officer.station_id]);

  const counts: Record<string, number> = {};
  statCards.forEach((c) => {
    counts[c.key] = orders.filter((o) => o.status === c.key).length;
  });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const now = new Date();

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-black dark:text-white">Station Officer Portal</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="px-6 py-6">
        <h1 className="text-xl font-bold text-black dark:text-white mb-1">
          {getGreeting()}, {officer.name} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {!isAll && officer.station_id
            ? "Here's what's happening at your station today."
            : "Viewing package activity across all stations."}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.key} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <div className={"w-9 h-9 rounded-lg flex items-center justify-center mb-3 " + card.bg + " " + card.fg}>
                {cardIcon(card.key)}
              </div>
              {loading ? <Skeleton className="h-6 w-10 mb-1" /> : <p className="text-xl font-bold text-black dark:text-white">{counts[card.key] || 0}</p>}
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col items-center gap-2 text-center hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                {actionIcon(action.icon)}
              </div>
              <p className="text-xs font-semibold text-black dark:text-white">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

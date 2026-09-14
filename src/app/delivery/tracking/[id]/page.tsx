"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { fetchStationById, Station } from "@/lib/supabaseStations";

type OrderItem = { name?: string; qty?: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  items: OrderItem[] | null;
  status: string;
  destination_station_id: string | null;
  package_condition: string | null;
  total: number;
};

type PackageEvent = {
  id: string;
  label: string;
  station_id: string | null;
  officer_id: string | null;
  created_at: string;
};

const statusPill: Record<string, string> = {
  Dispatched: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "In Transit": "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  Received: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  "Ready for Pickup": "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  "Picked Up": "bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400",
  Returned: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  "Damaged/Exception": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

export default function PackageTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [events, setEvents] = useState<PackageEvent[]>([]);
  const [officerNames, setOfficerNames] = useState<Record<string, string>>({});
  const [stationNames, setStationNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: orderData } = await supabase
        .from("orders")
        .select("id, order_code, customer_name, items, status, destination_station_id, package_condition, total")
        .eq("id", params.id)
        .maybeSingle();

      if (!orderData) {
        setLoading(false);
        return;
      }
      setOrder(orderData as Order);

      if (orderData.destination_station_id) {
        const { data: stationData } = await fetchStationById(orderData.destination_station_id);
        setStation(stationData);
      }

      const { data: eventData } = await supabase
        .from("package_events")
        .select("id, label, station_id, officer_id, created_at")
        .eq("order_id", params.id)
        .order("created_at", { ascending: true });
      const eventList = (eventData as PackageEvent[]) || [];
      setEvents(eventList);

      const officerIds = [...new Set(eventList.map((e) => e.officer_id).filter(Boolean))] as string[];
      if (officerIds.length > 0) {
        const { data: officers } = await supabase.from("delivery_officers").select("id, name").in("id", officerIds);
        const map: Record<string, string> = {};
        (officers || []).forEach((o: { id: string; name: string }) => (map[o.id] = o.name));
        setOfficerNames(map);
      }

      const stationIds = [...new Set(eventList.map((e) => e.station_id).filter(Boolean))] as string[];
      if (stationIds.length > 0) {
        const { data: stations } = await supabase.from("stations").select("id, name").in("id", stationIds);
        const map: Record<string, string> = {};
        (stations || []).forEach((s: { id: string; name: string }) => (map[s.id] = s.name));
        setStationNames(map);
      }

      setLoading(false);
    };
    load();
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-500">Package not found.</p>
        <button onClick={() => router.push("/delivery/packages")} className="text-sm text-brand font-semibold">Back to Packages</button>
      </div>
    );
  }

  const totalQty = (order.items || []).reduce((sum, i) => sum + (i.qty || 0), 0);

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/delivery/packages")} className="text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-black dark:text-white">Package Tracking</h1>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 max-w-5xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[11px] text-gray-400">Tracking ID</p>
              <p className="text-lg font-bold text-black dark:text-white">{order.order_code}</p>
            </div>
            <span className={"text-[11px] font-bold rounded-full px-2.5 py-1 " + (statusPill[order.status] || "bg-gray-100 text-gray-600")}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Order Number: <span className="text-brand font-medium">{order.order_code}</span>
          </p>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Package Movement History</p>

          {events.length === 0 ? (
            <p className="text-sm text-gray-400">No movement recorded for this package yet.</p>
          ) : (
            <div className="space-y-0">
              {events.map((e, i) => (
                <div key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={"w-2.5 h-2.5 rounded-full mt-1.5 " + (i === events.length - 1 ? "bg-brand" : "bg-gray-300 dark:bg-gray-600")} />
                    {i !== events.length - 1 && <span className="w-px flex-1 bg-gray-200 dark:bg-gray-700" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-xs text-gray-400">
                      {new Date(e.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · {new Date(e.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-sm text-black dark:text-white font-medium">{e.label}</p>
                    <p className="text-[11px] text-gray-400">
                      {e.station_id && stationNames[e.station_id] ? stationNames[e.station_id] : ""}
                      {e.officer_id && officerNames[e.officer_id] ? (e.station_id ? " · " : "") + officerNames[e.officer_id] : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 h-fit">
          <p className="text-sm font-bold text-black dark:text-white mb-4">Package Details</p>
          <div className="w-full h-28 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Customer</span><span className="text-black dark:text-white font-medium">{order.customer_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Product</span><span className="text-black dark:text-white font-medium truncate max-w-[140px] text-right">{(order.items || []).map((i) => i.name).join(", ") || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Quantity</span><span className="text-black dark:text-white font-medium">{totalQty || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Amount</span><span className="text-black dark:text-white font-medium">KSh {order.total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Station</span><span className="text-black dark:text-white font-medium">{station?.name || "—"}</span></div>
            {order.package_condition && (
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Condition</span><span className="text-black dark:text-white font-medium">{order.package_condition}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

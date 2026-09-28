"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { fetchStations, Station } from "@/lib/supabaseStations";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";

type OrderItem = { name: string; qty: number; price: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  items: OrderItem[];
  total: number;
  created_at: string;
  user_id: string | null;
  assigned_officer_id: string | null;
  destination_station_id: string | null;
  fulfillment_method: string | null;
  pickup_code: string | null;
};

type HistoryRow = { status: string; created_at: string };
type EventRow = { id: string; label: string; station_id: string | null; created_at: string };

const statusPill: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Dispatched: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "In Transit": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Shipped: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  Received: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  "Ready for Pickup": "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  Assigned: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  "Out for Delivery": "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "Picked Up": "bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  Returned: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  "Damaged/Exception": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

const statusText: Record<string, string> = {
  Pending: "Your order was placed and is awaiting confirmation.",
  Confirmed: "Your order has been confirmed and is being prepared.",
  Dispatched: "Your order has left the warehouse.",
  "In Transit": "Your package is in transit.",
  Shipped: "Your order has been shipped.",
  Received: "Your package arrived at the station and is being processed.",
  "Ready for Pickup": "Your package is ready for you to collect.",
  Assigned: "A delivery officer has been assigned to your order.",
  "Out for Delivery": "Your package is out for delivery.",
  "Picked Up": "The package was collected.",
  Delivered: "Your package has been delivered.",
  Cancelled: "This order was cancelled.",
  Returned: "This order was processed as a return.",
  "Damaged/Exception": "There is an issue with this package and our team is looking into it.",
};

const inTransitStatuses = ["Dispatched", "In Transit", "Shipped", "Received", "Ready for Pickup", "Assigned", "Out for Delivery"];
const doneStatuses = ["Delivered", "Picked Up"];
const problemStatuses = ["Cancelled", "Returned", "Damaged/Exception"];

const stageOf = (status: string) => {
  if (doneStatuses.includes(status)) return 2;
  if (inTransitStatuses.includes(status)) return 1;
  if (status === "Pending" || status === "Confirmed") return 0;
  return -1;
};

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const maskPhone = (phone: string | null) => {
  if (!phone) return "—";
  if (phone.length <= 3) return phone;
  return "•".repeat(phone.length - 3) + phone.slice(-3);
};

const maskName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] || "—";
  return parts[0] + " " + parts[1].charAt(0) + ".";
};

function DetailRow({ label, value, valueClass = "" }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className={"text-sm font-semibold text-black dark:text-white text-right " + valueClass}>{value}</span>
    </div>
  );
}

export default function TrackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { format } = useCurrency();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [rider, setRider] = useState<{ name: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const lookupOrder = async (orderCode: string) => {
    if (!orderCode.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);
    setHistory([]);
    setEvents([]);
    setRider(null);

    const { data, error: dbError } = await supabase
      .from("orders")
      .select("id, order_code, customer_name, phone, address, notes, status, items, total, created_at, user_id, assigned_officer_id")
      .eq("order_code", orderCode.trim().toUpperCase())
      .single();

    if (dbError || !data) {
      setLoading(false);
      setOrder(null);
      setError("No order found with that code. Please check and try again.");
      return;
    }

    // Station fields are fetched separately so this page keeps working even
    // if the station columns aren't in the database yet.
    const extra = await supabase
      .from("orders")
      .select("destination_station_id, fulfillment_method, pickup_code")
      .eq("id", data.id)
      .maybeSingle();

    const merged: Order = {
      ...data,
      destination_station_id: extra.data?.destination_station_id ?? null,
      fulfillment_method: extra.data?.fulfillment_method ?? null,
      pickup_code: extra.data?.pickup_code ?? null,
    };

    const [historyRes, eventsRes, stationsRes] = await Promise.all([
      supabase.from("order_status_history").select("status, created_at").eq("order_id", data.id).order("created_at", { ascending: true }),
      supabase.from("package_events").select("id, label, station_id, created_at").eq("order_id", data.id).order("created_at", { ascending: true }),
      fetchStations(),
    ]);

    setHistory((historyRes.data as HistoryRow[]) || []);
    setEvents((eventsRes.data as EventRow[]) || []);
    setStations(stationsRes.data || []);

    if (data.assigned_officer_id) {
      const r = await supabase.from("delivery_officers").select("name, phone").eq("id", data.assigned_officer_id).maybeSingle();
      if (r.data) setRider({ name: r.data.name, phone: r.data.phone });
    }

    setOrder(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (initialCode) lookupOrder(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrder(code);
  };

  const handleCopy = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.order_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — nothing to do
    }
  };

  const stationName = (id: string | null) => stations.find((s) => s.id === id)?.name || "";

  let content: React.ReactNode = null;

  if (order) {
    const isOwner = !!user && !!order.user_id && user.id === order.user_id;
    const isPickup = order.fulfillment_method === "pickup" || !!order.destination_station_id;
    const station = stations.find((s) => s.id === order.destination_station_id) || null;
    const currentStage = stageOf(order.status);
    const isProblem = problemStatuses.includes(order.status);
    const stageLabels = ["Received", "In Transit", isPickup ? "Picked Up" : "Delivered"];

    const stageTime = (stage: number): string | null => {
      if (stage === 0) return order.created_at;
      const wanted = stage === 1 ? inTransitStatuses : doneStatuses;
      const h = history.find((x) => wanted.includes(x.status));
      if (h) return h.created_at;
      const ev = events.find((e) => (stage === 2 ? /picked up by customer/i.test(e.label) : /received/i.test(e.label)));
      return ev ? ev.created_at : null;
    };

    const timeline = [
      { key: "placed", time: order.created_at, text: "Your order was placed." },
      ...history.map((h, i) => ({ key: "h" + i, time: h.created_at, text: statusText[h.status] || "Status updated: " + h.status })),
      ...events.map((e) => ({
        key: e.id,
        time: e.created_at,
        text: e.label + (e.station_id && stationName(e.station_id) ? " · " + stationName(e.station_id) : ""),
      })),
    ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    const showRider = !!rider && (order.status === "Assigned" || order.status === "Out for Delivery");
    const firstItem = order.items?.[0];
    const extraItems = (order.items?.length || 1) - 1;

    content = (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} aria-label="Back" className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-black dark:text-white shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <p className="flex-1 text-center text-base font-bold text-black dark:text-white pr-9">Details</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-gray-900 flex items-center justify-center shrink-0 text-brand">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Tracking ID:</p>
            <p className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
              <span className="truncate">{order.order_code}</span>
              <button onClick={handleCopy} aria-label="Copy tracking ID" className="text-gray-400 hover:text-brand shrink-0">
                {copied ? (
                  <span className="text-[11px] font-semibold text-green-600">Copied</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </p>
          </div>
          <span className={"text-xs font-semibold rounded-full px-3 py-1.5 shrink-0 " + (statusPill[order.status] || "bg-gray-100 text-gray-600")}>
            {order.status}
          </span>
        </div>

        {isProblem ? (
          <div className={"rounded-2xl px-4 py-3 text-sm font-semibold " + (statusPill[order.status] || "bg-gray-100 text-gray-600")}>
            {statusText[order.status]}
          </div>
        ) : (
          <div className="pt-1">
            <div className="relative flex justify-between">
              <div className="absolute top-3 left-3 right-3 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div
                className="absolute top-3 left-3 h-1 rounded-full bg-black dark:bg-white transition-all duration-500"
                style={{ width: "calc((100% - 1.5rem) * " + Math.max(currentStage, 0) / 2 + ")" }}
              />
              {stageLabels.map((label, i) => {
                const done = i <= currentStage;
                const time = done ? stageTime(i) : null;
                const align = i === 0 ? "items-start text-left" : i === 2 ? "items-end text-right" : "items-center text-center";
                return (
                  <div key={label} className={"relative flex flex-col " + align}>
                    <span className={"w-6 h-6 rounded-full flex items-center justify-center " + (done ? "bg-black dark:bg-white text-white dark:text-black" : "bg-gray-300 dark:bg-gray-700")}>
                      {done && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </span>
                    <p className="text-sm font-semibold text-black dark:text-white mt-2">{label}</p>
                    {time && <p className="text-[11px] text-gray-400">{fmtTime(time)}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="w-full bg-black dark:bg-brand text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
          </svg>
          Track Shipping
        </button>

        <div className="rounded-3xl bg-blue-50/70 dark:bg-gray-900 p-3">
          <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 px-2 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8Z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            {isPickup ? "Pickup Details" : "Delivery Details"}
          </p>
          <div className="bg-white dark:bg-gray-950 rounded-2xl px-4 py-2 divide-y divide-gray-100 dark:divide-gray-800">
            <DetailRow label="Receiver" value={isOwner ? order.customer_name : maskName(order.customer_name)} />
            {isPickup ? (
              <DetailRow label="Station" value={station ? station.name + (station.address ? ", " + station.address : "") : "—"} />
            ) : (
              <DetailRow label="Address" value={isOwner ? order.address || "—" : "Hidden for privacy"} />
            )}
            <DetailRow label="Contact" value={isOwner ? order.phone || "—" : maskPhone(order.phone)} />
            <DetailRow label="Item" value={firstItem ? firstItem.name + (extraItems > 0 ? " +" + extraItems + " more" : "") : "—"} />
            <DetailRow
              label="Note"
              value={
                order.notes ? (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {order.notes}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            {isOwner && isPickup && order.status === "Ready for Pickup" && order.pickup_code && (
              <DetailRow label="Pickup Code" value={order.pickup_code} valueClass="text-brand tracking-widest" />
            )}
          </div>
          {!isOwner && !isProblem && (
            <p className="text-[11px] text-gray-400 px-2 pt-2">
              Some details are hidden. Sign in to the account that placed this order to see them.
            </p>
          )}
        </div>

        {showRider && rider && (
          <div className="rounded-3xl bg-blue-50/70 dark:bg-gray-900 p-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-950 flex items-center justify-center text-base font-bold text-brand shrink-0">
              {rider.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black dark:text-white truncate">{rider.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Contact Rider</p>
            </div>
            <a href={"sms:" + rider.phone} aria-label="Message rider" className="w-11 h-11 rounded-full bg-white dark:bg-gray-950 flex items-center justify-center text-black dark:text-white shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
            <a href={"tel:" + rider.phone.replace(/\s+/g, "")} aria-label="Call rider" className="w-11 h-11 rounded-full bg-black dark:bg-brand flex items-center justify-center text-white shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
          </div>
        )}

        <div ref={timelineRef} className="rounded-3xl bg-gray-50 dark:bg-gray-900 px-5 pt-3 pb-5 scroll-mt-4">
          <div className="w-16 h-1 rounded-full bg-gray-800 dark:bg-gray-600 mx-auto mb-5" />
          <div>
            {timeline.map((t, i) => (
              <div key={t.key} className="flex gap-3">
                <div className="w-16 shrink-0 text-right">
                  <p className="text-sm font-bold text-black dark:text-white">{fmtTime(t.time)}</p>
                  <p className="text-[11px] text-gray-400">{fmtDate(t.time)}</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  {i !== timeline.length - 1 && <span className="flex-1 w-px border-l border-dashed border-gray-300 dark:border-gray-700 my-1" />}
                </div>
                <p className="flex-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed pb-6">{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-sm font-bold text-black dark:text-white mb-3">Order Summary</p>
          <div className="space-y-2 mb-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{item.name} x{item.qty}</span>
                <span className="text-black dark:text-white">{format(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold">
            <span className="text-black dark:text-white">Total</span>
            <span className="text-brand">{format(order.total)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-8">
      {!order && (
        <>
          <h1 className="text-xl font-bold mb-2 text-black dark:text-white text-center">Track Your Order</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Enter the order code you received at checkout.
          </p>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="e.g. THX-AB12CD"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black dark:bg-brand text-white px-6 py-2.5 rounded-full text-sm font-semibold disabled:opacity-60"
        >
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {content}

      {searched && !order && !loading && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No order found.</p>
      )}
    </div>
  );
}

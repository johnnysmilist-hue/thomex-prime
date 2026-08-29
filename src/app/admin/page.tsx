"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchProducts, DbProduct } from "@/lib/supabaseProducts";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

type DayStat = { label: string; revenue: number };
type ProductStat = { name: string; unitsSold: number; revenue: number };
type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  status: string;
  total: number;
  items: unknown;
  created_at: string;
};

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const LOW_STOCK_THRESHOLD = 5;

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  Processing: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  Shipped: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  Delivered: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  Cancelled: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const statusDotColors: Record<string, string> = {
  Pending: "#eab308",
  Processing: "#3b82f6",
  Shipped: "#a855f7",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  return (
    <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold " + style}>
      {status}
    </span>
  );
}

function StatCard({ icon, iconBg, iconColor, value, label }: { icon: React.ReactNode; iconBg: string; iconColor: string; value: string; label: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4">
      <div className={"w-12 h-12 rounded-lg flex items-center justify-center shrink-0 " + iconBg + " " + iconColor}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-black dark:text-white truncate">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
   return (
    
    <a  href={href}
      className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:border-brand transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">{icon}</div>
      <span className="text-sm font-semibold text-black dark:text-white">{label}</span>
    </a>
  );
}

function StatusDonut({ counts, total }: { counts: Record<string, number>; total: number }) {
  if (total === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No orders yet.</p>;
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offsetAccum = 0;

  const segments = STATUSES.map((status) => {
    const count = counts[status] || 0;
    const fraction = count / total;
    const dash = fraction * circumference;
    const seg = { status, count, dash, offset: offsetAccum };
    offsetAccum += dash;
    return seg;
  }).filter((s) => s.count > 0);

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
        <g transform="translate(80,80) rotate(-90)">
          <circle r={radius} fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="18" />
          {segments.map((seg) => (
            <circle
              key={seg.status}
              r={radius}
              fill="none"
              stroke={statusDotColors[seg.status]}
              strokeWidth="18"
              strokeDasharray={seg.dash + " " + circumference}
              strokeDashoffset={-seg.offset}
            />
          ))}
        </g>
        <text x="80" y="76" textAnchor="middle" className="fill-black dark:fill-white text-2xl font-bold" style={{ fontSize: "26px" }}>
          {total}
        </text>
        <text x="80" y="96" textAnchor="middle" className="fill-gray-400" style={{ fontSize: "11px" }}>
          orders
        </text>
      </svg>
      <div className="space-y-1.5">
        {STATUSES.map((status) => (
          <div key={status} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: statusDotColors[status] }} />
            <span className="text-gray-600 dark:text-gray-300 w-20">{status}</span>
            <span className="font-semibold text-black dark:text-white">{counts[status] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const firstName = (user?.user_metadata?.username || user?.email?.split("@")[0] || "Admin").split(" ")[0];

  const [allProducts, setAllProducts] = useState<DbProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dailyStats, setDailyStats] = useState<DayStat[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState(7);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadStats = async () => {
      const { data: products } = await fetchProducts();
      setAllProducts(products || []);

      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, order_code, customer_name, status, total, items, created_at")
        .order("created_at", { ascending: false });

      const allOrders = (ordersData as Order[]) || [];
      setOrders(allOrders);
      setPendingCount(allOrders.filter((o) => o.status === "Pending").length);

      let rev = 0;
      const productMap: Record<string, ProductStat> = {};
      allOrders.forEach((order) => {
        rev += order.total || 0;
        const items = order.items as { name?: string; price?: number; qty?: number }[] | null;
        if (Array.isArray(items)) {
          items.forEach((item) => {
            const key = item.name || "Unknown";
            if (!productMap[key]) productMap[key] = { name: key, unitsSold: 0, revenue: 0 };
            productMap[key].unitsSold += item.qty || 0;
            productMap[key].revenue += (item.price || 0) * (item.qty || 0);
          });
        }
      });

      setTotalRevenue(rev);
      setTopProducts(Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
      setLoading(false);
    };
    loadStats();
  }, []);

  useEffect(() => {
    const days: DayStat[] = [];
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label =
        rangeDays <= 7
          ? d.toLocaleDateString(undefined, { weekday: "short" })
          : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      days.push({ label, revenue: 0 });
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at);
      const daysAgo = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < rangeDays) {
        days[rangeDays - 1 - daysAgo].revenue += order.total || 0;
      }
    });

    setDailyStats(days);
  }, [orders, rangeDays]);

  const maxDayRevenue = Math.max(1, ...dailyStats.map((d) => d.revenue));

  const lowStockProducts = useMemo(
    () => allProducts.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).sort((a, b) => a.stock - b.stock),
    [allProducts]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => statusFilter === "All" || o.status === statusFilter)
      .filter((o) => {
        const q = search.toLowerCase();
        return !q || o.order_code?.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [orders, search, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black dark:text-white">
          {getGreeting()}, {firstName}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Stay on top of your store, monitor sales, and track orders.</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <QuickAction
          href="/admin/products/new"
          label="Add Product"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
        />
        <QuickAction
          href="/admin/orders"
          label="View Orders"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>}
        />
        <QuickAction
          href="/admin/messages"
          label="Messages"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>}
        />
        <QuickAction
          href="/admin/categories"
          label="Categories"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>}
        />
      </div>

      {/* Hero revenue card */}
      <div className="bg-brand rounded-xl p-6 mb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wide">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-white">{loading ? "..." : "KSh " + totalRevenue.toFixed(2)}</p>
          <p className="text-white/70 text-xs mt-1">Across {orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /></svg>}
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-600 dark:text-blue-400"
          value={loading ? "..." : String(allProducts.length)}
          label="Total Products"
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>}
          iconBg="bg-purple-50 dark:bg-purple-950/40"
          iconColor="text-purple-600 dark:text-purple-400"
          value={loading ? "..." : String(orders.length)}
          label="Total Orders"
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          iconBg="bg-yellow-50 dark:bg-yellow-950/40"
          iconColor="text-yellow-600 dark:text-yellow-400"
          value={loading ? "..." : String(pendingCount)}
          label="Pending Orders"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart with range picker */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-black dark:text-white">Revenue</p>
            <div className="flex gap-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setRangeDays(d)}
                  className={
                    "text-xs px-2.5 py-1 rounded-md font-medium " +
                    (rangeDays === d
                      ? "bg-brand text-white"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")
                  }
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {!loading && (
            <div className="flex items-end gap-1.5 h-40">
              {dailyStats.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-brand rounded-t-md transition-all"
                    style={{ height: (day.revenue / maxDayRevenue) * 100 + "%", minHeight: day.revenue > 0 ? "4px" : "0px" }}
                    title={"KSh " + day.revenue.toFixed(2)}
                  />
                  {rangeDays <= 14 && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">{day.label}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order status donut */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
          <p className="text-sm font-bold text-black dark:text-white mb-4">Order Status</p>
          {!loading && <StatusDonut counts={statusCounts} total={orders.length} />}
        </div>
      </div>

      {/* Low stock alerts */}
      {!loading && lowStockProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-900/50 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-sm font-bold text-black dark:text-white">Low Stock Alerts</p>
          </div>
          <div className="space-y-2">
            {lowStockProducts.slice(0, 6).map((p) => (
              
                key={p.id}
                href={"/admin/products/" + p.id + "/edit"}
                className="flex items-center justify-between text-sm px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span className="text-black dark:text-white truncate flex-1">{p.name}</span>
                <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + (p.stock === 0 ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" : "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400")}>
                  {p.stock === 0 ? "Out of stock" : p.stock + " left"}
                </span>
              </a>
            ))}
          </div>
          {lowStockProducts.length > 6 && (
            <p className="text-xs text-gray-400 mt-2">+{lowStockProducts.length - 6} more low on stock</p>
          )}
        </div>
      )}

      {/* Recent orders table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between gap-3 p-5 pb-3 flex-wrap">
          <p className="text-sm font-bold text-black dark:text-white">Recent Orders</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..."
                className="pl-8 pr-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-black dark:text-white focus:outline-none w-40"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-black dark:text-white focus:outline-none"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <a href="/admin/orders" className="text-xs font-semibold text-brand whitespace-nowrap">View all</a>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
                <th className="px-5 py-2 font-semibold w-8"></th>
                <th className="px-2 py-2 font-semibold">Order ID</th>
                <th className="px-2 py-2 font-semibold">Customer</th>
                <th className="px-2 py-2 font-semibold">Total</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-2 py-2 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">Loading...</td>
                </tr>
              )}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">No orders found.</td>
                </tr>
              )}
              {!loading &&
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="accent-brand"
                      />
                    </td>
                    <td className="px-2 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{order.order_code}</td>
                    <td className="px-2 py-3 text-black dark:text-white">{order.customer_name || "—"}</td>
                    <td className="px-2 py-3 font-semibold text-black dark:text-white">KSh {(order.total || 0).toFixed(2)}</td>
                    <td className="px-2 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-2 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && topProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
          <p className="text-sm font-bold text-black dark:text-white mb-4">Top Selling Products</p>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-black dark:text-white truncate flex-1">{p.name}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs mx-3">{p.unitsSold} sold</span>
                <span className="text-brand font-semibold">KSh {p.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

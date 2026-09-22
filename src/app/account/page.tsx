"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";
import { fetchStationById, Station } from "@/lib/supabaseStations";

type OrderItem = { name?: string; qty?: number };

type Order = {
  id: string;
  order_code: string;
  items: OrderItem[] | null;
  total: number;
  status: string;
  created_at: string;
  destination_station_id: string | null;
  pickup_code: string | null;
};

const statusPill: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Dispatched: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "In Transit": "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
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

const pendingSet = ["Pending"];
const processingSet = ["Confirmed", "Dispatched", "In Transit", "Received", "Ready for Pickup", "Assigned"];
const shippedSet = ["Shipped", "Out for Delivery"];
const deliveredSet = ["Delivered", "Picked Up"];
const returnedSet = ["Returned"];

function WaveIcon({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 12.5V8a2 2 0 0 0-4 0v2.5" /><path d="M14 10V6a2 2 0 0 0-4 0v6.5" />
      <path d="M10 8.5V6a2 2 0 0 0-4 0v9c0 3.5 2.5 6 6 6h1a6 6 0 0 0 6-6V9a2 2 0 0 0-4 0v2" />
    </svg>
  );
}

const mobileQuickActions = [
  {
    href: "/account/wishlist",
    label: "Wishlist",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>,
  },
  {
    href: "/account/addresses",
    label: "My Addresses",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
  },
  {
    href: "/account/payment-methods",
    label: "Payment Methods",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
  },
  {
    href: "/account/vouchers",
    label: "Coupons / Vouchers",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="2" /><path d="M12 7v10" /></svg>,
  },
  {
    href: "/account/reviews",
    label: "My Reviews",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
];

const mobileSupportLinks = [
  {
    href: "/account/settings",
    label: "Personal Information",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
  {
    href: "/account/settings",
    label: "Security & Password",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  },
  {
    href: "/account/notifications",
    label: "Notifications",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>,
  },
  {
    href: "/account/help",
    label: "Help & Support",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  },
  {
    href: "/account/privacy-policy",
    label: "Privacy Policy",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>,
  },
  {
    href: "/account/terms",
    label: "Terms & Conditions",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  },
];

function Skeleton({ className }: { className: string }) {
  return <div className={"animate-pulse bg-gray-200 dark:bg-gray-800 rounded " + className} />;
}

export default function AccountDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickupStation, setPickupStation] = useState<Station | null>(null);
  const [pickupOrder, setPickupOrder] = useState<Order | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("orders")
        .select("id, order_code, items, total, status, created_at, destination_station_id, pickup_code")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const list = (data as Order[]) || [];
      setOrders(list);

      const activePickup = list.find(
        (o) => o.destination_station_id && !deliveredSet.includes(o.status) && o.status !== "Cancelled" && o.status !== "Returned"
      );
      if (activePickup) {
        setPickupOrder(activePickup);
        const { data: station } = await fetchStationById(activePickup.destination_station_id!);
        setPickupStation(station);
      }

      setLoading(false);
    };
    load();

    fetchAllProductsForSite().then((r) => {
      const featured = r.products.filter((p) => p.featured);
      const rest = r.products.filter((p) => !p.featured);
      setRecommended([...featured, ...rest].slice(0, 4));
    });
  }, [user]);

  const handleInvite = async () => {
    const shareData = {
      title: "Thomex",
      text: "Check out Thomex for electronics and home tech — great prices, fast delivery.",
      url: typeof window !== "undefined" ? window.location.origin : "https://thomex-prime-store.vercel.app",
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled the share sheet — nothing to do
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      alert("Link copied — share it with your friends!");
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-400">Loading...</div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You're not signed in.</p>
          <a href="/signin" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">Sign In</a>
        </div>
        <Footer />
      </main>
    );
  }

  const username = user.user_metadata?.username || user.email?.split("@")[0] || "Customer";
  const phone = (user.user_metadata as { phone?: string } | null)?.phone || user.phone || null;

  const counts = {
    Pending: orders.filter((o) => pendingSet.includes(o.status)).length,
    Processing: orders.filter((o) => processingSet.includes(o.status)).length,
    Shipped: orders.filter((o) => shippedSet.includes(o.status)).length,
    Delivered: orders.filter((o) => deliveredSet.includes(o.status)).length,
    Returns: orders.filter((o) => returnedSet.includes(o.status)).length,
  };

  const overviewCards = [
    { key: "Pending", label: "Pending", value: counts.Pending, bg: "bg-orange-50 dark:bg-orange-950/40", fg: "text-orange-600 dark:text-orange-400", icon: "clock" },
    { key: "Processing", label: "Processing", value: counts.Processing, bg: "bg-blue-50 dark:bg-blue-950/40", fg: "text-blue-600 dark:text-blue-400", icon: "box" },
    { key: "Shipped", label: "Shipped", value: counts.Shipped, bg: "bg-green-50 dark:bg-green-950/40", fg: "text-green-600 dark:text-green-400", icon: "truck" },
    { key: "Delivered", label: "Delivered", value: counts.Delivered, bg: "bg-purple-50 dark:bg-purple-950/40", fg: "text-purple-600 dark:text-purple-400", icon: "check" },
  ];

  const cardIcon = (name: string) => {
    const c = { xmlns: "http://www.w3.org/2000/svg", width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (name === "clock") return <svg {...c}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    if (name === "box") return <svg {...c}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
    if (name === "truck") return <svg {...c}><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8Z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
    if (name === "return") return <svg {...c}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 5v5h5" /></svg>;
    return <svg {...c}><path d="M20 6 9 17l-5-5" /></svg>;
  };

  const recentOrders = orders.slice(0, 2);
  const isDark = mounted && theme === "dark";

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* ---------- Mobile ---------- */}
      <div className="md:hidden max-w-md mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-black dark:text-white mb-4">My Account</h1>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xl shrink-0">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
              Hello, {username} <WaveIcon className="text-yellow-500" />
            </p>
            {phone && <p className="text-xs text-gray-500 dark:text-gray-400">{phone}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            <Link
              href="/account/settings"
              className="inline-block mt-2 text-[11px] font-semibold text-brand bg-brand/10 px-3 py-1.5 rounded-full"
            >
              ✎ Edit Profile
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-black dark:text-white">My Orders</p>
          <Link href="/account/orders" className="text-xs font-semibold text-brand">View All</Link>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 grid grid-cols-5 gap-2 mb-6">
          {[
            { label: "Pending", value: counts.Pending, icon: "clock", color: "text-orange-500" },
            { label: "Processing", value: counts.Processing, icon: "box", color: "text-blue-500" },
            { label: "Shipped", value: counts.Shipped, icon: "truck", color: "text-green-500" },
            { label: "Delivered", value: counts.Delivered, icon: "check", color: "text-purple-500" },
            { label: "Returns", value: counts.Returns, icon: "return", color: "text-red-500" },
          ].map((item) => (
            <Link key={item.label} href="/account/orders" className="flex flex-col items-center gap-1 text-center">
              <span className={item.color}>{cardIcon(item.icon)}</span>
              <span className="text-sm font-bold text-black dark:text-white">{loading ? "…" : item.value}</span>
              <span className="text-[9px] text-gray-400 leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>

        <p className="text-sm font-bold text-black dark:text-white mb-2">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {mobileQuickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5 flex items-center gap-2.5"
            >
              <span className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">{action.icon}</span>
              <span className="text-xs font-semibold text-black dark:text-white leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>

        <p className="text-sm font-bold text-black dark:text-white mb-2">Account &amp; Support</p>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden mb-6">
          {mobileSupportLinks.slice(0, 3).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-gray-800 text-sm text-black dark:text-white"
            >
              <span className="text-gray-500 dark:text-gray-400">{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}

          {/* Language — display only, no language-switching system exists yet */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-gray-800 text-sm text-black dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
            </svg>
            <span className="flex-1">Language</span>
            <span className="text-xs text-gray-400">English (US)</span>
          </div>

          {/* Dark Mode — real toggle, wired to next-themes */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-gray-800 text-sm text-black dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
            </svg>
            <span className="flex-1">Dark Mode</span>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle dark mode"
              className={"w-10 h-6 rounded-full flex items-center px-0.5 transition-colors " + (isDark ? "bg-brand justify-end" : "bg-gray-200 justify-start")}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow" />
            </button>
          </div>

          {mobileSupportLinks.slice(3).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0 text-sm text-black dark:text-white"
            >
              <span className="text-gray-500 dark:text-gray-400">{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}

          {/* Invite Friends — real share action via Web Share API, no fake referral tracking */}
          <button
            onClick={handleInvite}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-black dark:text-white text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /><line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
            </svg>
            <span className="flex-1">Invite Friends</span>
          </button>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-500 py-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>

      {/* ---------- Desktop ---------- */}
      <div className="hidden md:flex max-w-6xl mx-auto px-4 py-8 flex-col md:flex-row gap-6">
        <AccountSidebar />

        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-6">
            <h1 className="text-xl font-bold text-black dark:text-white mb-1">My Account</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              Welcome back, {username}! <WaveIcon className="text-yellow-500" />
            </p>
            <p className="text-xs text-gray-400 mt-1">Manage your account, orders and preferences.</p>
          </div>

          <p className="text-sm font-bold text-black dark:text-white mb-3">Order Overview</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {overviewCards.map((c) => (
              <div key={c.key} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                <div className={"w-9 h-9 rounded-lg flex items-center justify-center mb-3 " + c.bg + " " + c.fg}>
                  {cardIcon(c.icon)}
                </div>
                {loading ? <Skeleton className="h-6 w-8 mb-1" /> : <p className="text-xl font-bold text-black dark:text-white">{c.value}</p>}
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">{c.label}</p>
                <Link href={"/account/orders"} className="text-[11px] font-semibold text-brand">View orders →</Link>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-black dark:text-white">Recent Orders</p>
            <Link href="/account/orders" className="text-xs font-semibold text-brand">View All Orders →</Link>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden mb-8">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 p-6 text-center">You haven't placed any orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                      <th className="px-4 py-3 font-semibold">Order</th>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => {
                      const firstItem = o.items?.[0];
                      const extra = (o.items?.length || 1) - 1;
                      return (
                        <tr key={o.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                          <td className="px-4 py-3 font-semibold text-brand whitespace-nowrap">#{o.order_code}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-[180px] truncate">
                            {firstItem?.name || "—"}{extra > 0 ? " +" + extra + " more" : ""}
                          </td>
                          <td className="px-4 py-3 text-black dark:text-white font-medium whitespace-nowrap">KSh {o.total.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={"text-[11px] font-bold rounded-full px-2.5 py-1 " + (statusPill[o.status] || "bg-gray-100 text-gray-600")}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={"/track?code=" + o.order_code} className="text-xs font-semibold text-brand hover:underline">
                              Track Order
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pickupOrder && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-8">
              <p className="text-sm font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
                My Pickup &amp; Delivery
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">Pickup Station</p>
                  <p className="text-sm font-semibold text-black dark:text-white">{pickupStation?.name || "—"}</p>
                  {pickupStation?.address && <p className="text-xs text-gray-500 dark:text-gray-400">{pickupStation.address}</p>}
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">Pickup Code</p>
                  <p className="text-sm font-semibold text-black dark:text-white">{pickupOrder.pickup_code || "Not yet generated"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">Package Status</p>
                  <span className={"inline-block text-[11px] font-bold rounded-full px-2.5 py-1 " + (statusPill[pickupOrder.status] || "bg-gray-100 text-gray-600")}>
                    {pickupOrder.status}
                  </span>
                </div>
              </div>
              <Link href={"/track?code=" + pickupOrder.order_code} className="inline-block mt-4 text-xs font-semibold text-brand hover:underline">
                View Pickup Details →
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-black dark:text-white">Recommended for You</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommended.map((p) => (
              <Link key={p.id} href={"/product/" + p.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                <div className="w-full aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 mb-2 overflow-hidden">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <p className="text-xs text-black dark:text-white font-medium truncate">{p.name}</p>
                <p className="text-sm font-bold text-brand mt-1">KSh {p.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type NavLink = { href: string; label: string; icon: React.ReactNode };

const icon = (name: string) => {
  const c = { xmlns: "http://www.w3.org/2000/svg", width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "profile") return <svg {...c}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  if (name === "orders") return <svg {...c}><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
  if (name === "wishlist") return <svg {...c}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>;
  if (name === "address") return <svg {...c}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
  if (name === "payment") return <svg {...c}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
  if (name === "reviews") return <svg {...c}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
  if (name === "vouchers") return <svg {...c}><rect x="2" y="7" width="20" height="10" rx="2" /><path d="M12 7v10" /><circle cx="7" cy="12" r="1" /><circle cx="17" cy="12" r="1" /></svg>;
  if (name === "notifications") return <svg {...c}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
  if (name === "settings") return <svg {...c}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>;
  if (name === "help") return <svg {...c}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
  if (name === "privacy") return <svg {...c}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;
  if (name === "terms") return <svg {...c}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
  if (name === "logout") return <svg {...c}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
  return null;
};

const links: NavLink[] = [
  { href: "/account", label: "Profile", icon: icon("profile") },
  { href: "/account/orders", label: "My Orders", icon: icon("orders") },
  { href: "/account/wishlist", label: "Wishlist", icon: icon("wishlist") },
  { href: "/account/addresses", label: "Addresses", icon: icon("address") },
  { href: "/account/payment-methods", label: "Payment Methods", icon: icon("payment") },
  { href: "/account/reviews", label: "My Reviews", icon: icon("reviews") },
  { href: "/account/vouchers", label: "Vouchers", icon: icon("vouchers") },
  { href: "/account/notifications", label: "Notifications", icon: icon("notifications") },
  { href: "/account/settings", label: "Settings", icon: icon("settings") },
  { href: "/account/help", label: "Help & Support", icon: icon("help") },
  { href: "/account/privacy-policy", label: "Privacy Policy", icon: icon("privacy") },
  { href: "/account/terms", label: "Terms & Conditions", icon: icon("terms") },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "Customer";

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 print:hidden">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold shrink-0">
          {username.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-black dark:text-white truncate">{username}</p>
          <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>

      <nav className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-2 space-y-0.5">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={
                active
                  ? "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg bg-brand text-white font-semibold"
                  : "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              }
            >
              {l.icon}
              {l.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          {icon("logout")}
          Logout
        </button>
      </nav>
    </aside>
  );
}

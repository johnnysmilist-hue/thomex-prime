"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminGuard from "./AdminGuard";
import CommandPalette from "./CommandPalette";
import { fetchNotifications, ADMIN_RECIPIENT_ID } from "@/lib/supabaseNotifications";
import { supabase } from "@/lib/supabaseClient";

type NavLink = {
  href: string;
  label: string;
  icon: ReactNode;
};

type NavGroup = {
  label: string;
  links: NavLink[];
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    links: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
        ),
      },
      {
        href: "/admin/analytics",
        label: "Analytics",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Commerce",
    links: [
      {
        href: "/admin/products",
        label: "Products",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        ),
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        href: "/admin/orders",
        label: "Orders",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        ),
      },
      {
        href: "/admin/stores",
        label: "Stores",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7h20l-1.6 8.2a2 2 0 0 1-2 1.8H5.6a2 2 0 0 1-2-1.8L2 7Z" />
            <path d="M2 7 4 3h16l2 4" />
          </svg>
        ),
      },
      {
        href: "/admin/shipping",
        label: "Shipping Rates",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4l3 3v5h-7V8Z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Content",
    links: [
      {
        href: "/admin/banners",
        label: "Banners",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 12h.01" />
            <path d="M10 12h8" />
          </svg>
        ),
      },
      {
        href: "/admin/media",
        label: "Media Library",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "System",
    links: [
      {
        href: "/admin/users",
        label: "Customers",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        href: "/admin/messages",
        label: "Messages",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        ),
      },
      {
        href: "/admin/notifications",
        label: "Notifications",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        ),
      },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        ),
      },
    ],
  },
];

function SidebarNav({ pathname, unreadCount, onLinkClick }: { pathname: string; unreadCount: number; onLinkClick?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider px-3 pb-2">{group.label}</p>
          <div className="space-y-0.5">
            {group.links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onLinkClick}
                  className={
                    active
                      ? "flex items-center gap-3 px-3 py-2 text-sm rounded-md bg-brand text-white font-medium"
                      : "flex items-center gap-3 px-3 py-2 text-sm rounded-md text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                  }
                >
                  {link.icon}
                  <span className="flex-1">{link.label}</span>
                  {link.href === "/admin/notifications" && unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-brand text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const username = user?.user_metadata?.username || user?.email || "Admin";
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUnread = async () => {
      const { data } = await fetchNotifications("admin", ADMIN_RECIPIENT_ID);
      setUnreadCount((data || []).filter((n) => !n.read).length);
    };
    loadUnread();

    const channel = supabase
      .channel("admin_layout_notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: "recipient_type=eq.admin" },
        () => loadUnread()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-[#0b0b0d] text-gray-400 min-h-screen sticky top-0">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-white font-bold text-sm shrink-0">T</div>
          <p className="text-white font-bold tracking-tight">Thomex Admin</p>
        </div>

        <SidebarNav pathname={pathname} unreadCount={unreadCount} />

        <div className="px-3 py-4 border-t border-white/5">
          <a href="/" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-gray-500 hover:bg-white/5 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            View Store
          </a>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex flex-col w-72 max-w-[80vw] bg-[#0b0b0d] text-gray-400 h-full overflow-y-auto">
            <div className="flex items-center justify-between gap-2.5 px-5 py-5 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-white font-bold text-sm shrink-0">T</div>
                <p className="text-white font-bold tracking-tight">Thomex Admin</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-white/5 hover:text-white"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <SidebarNav pathname={pathname} unreadCount={unreadCount} onLinkClick={() => setMobileMenuOpen(false)} />

            <div className="px-3 py-4 border-t border-white/5">
              <a href="/" className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-gray-500 hover:bg-white/5 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                View Store
              </a>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-9 h-9 shrink-0 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex-1 max-w-sm hidden sm:block">
            <button
              onClick={() => setPaletteOpen(true)}
              className="w-full flex items-center gap-2 pl-3 pr-2 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="flex-1 text-left">Search...</span>
              <span className="text-[10px] font-semibold border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-gray-400 shrink-0">⌘K</span>
            </button>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <a href="/" className="text-xs text-gray-500 dark:text-gray-400 hover:text-brand hidden sm:inline">View Store</a>
            
             <a href="/admin/notifications"
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-gray-900" />
              )}
            </a>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-800">
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-xs font-semibold text-black dark:text-white truncate max-w-[120px]">{username}</p>
                <p className="text-[10px] text-gray-400">Admin</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6">
          <h1 className="text-xl font-bold text-black dark:text-white mb-6">{title}</h1>
          <AdminGuard>{children}</AdminGuard>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

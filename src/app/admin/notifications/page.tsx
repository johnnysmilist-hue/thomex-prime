"use client";

import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  ADMIN_RECIPIENT_ID,
  Notification,
} from "@/lib/supabaseNotifications";
import { supabase } from "@/lib/supabaseClient";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div className={"opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards] " + className} style={{ animationDelay: delay + "ms" }}>
      {children}
    </div>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={"animate-pulse bg-gray-200 dark:bg-gray-800 rounded " + className} />;
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + " min ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  return days + "d ago";
}

const notifIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const load = async () => {
    setLoading(true);
    const { data } = await fetchNotifications("admin", ADMIN_RECIPIENT_ID);
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("admin_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: "recipient_type=eq.admin" },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead("admin", ADMIN_RECIPIENT_ID);
  };

  return (
    <AdminLayout title="Notifications">
      <FadeIn delay={0} className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Stay up to date with your latest store alerts.</p>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark all as read
          </button>
        )}
      </FadeIn>

      <FadeIn delay={50}>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100 dark:border-gray-800 flex-wrap">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-black dark:text-white">All Notifications</p>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand">{unreadCount} unread</span>
              )}
            </div>
            <div className="flex gap-1">
              {(["all", "unread", "read"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={
                    "text-xs px-3 py-1.5 rounded-md font-medium capitalize transition-colors " +
                    (filter === f
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}

            {!loading && filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-10">
                {filter === "all" ? "No notifications yet." : "Nothing here."}
              </p>
            )}

            {!loading &&
              filtered.map((n, i) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={
                    "w-full text-left flex items-start gap-3 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 opacity-0 animate-[fadeInUp_0.4s_ease-out_forwards] " +
                    (!n.read ? "bg-brand/[0.03]" : "")
                  }
                  style={{ animationDelay: Math.min(i * 30, 300) + "ms" }}
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                    {notifIcon()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-black dark:text-white">{n.title}</p>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.body}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </FadeIn>
    </AdminLayout>
  );
}

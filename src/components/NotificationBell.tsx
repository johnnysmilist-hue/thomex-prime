"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchStoreByOwner } from "@/lib/supabaseStores";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  Notification,
} from "@/lib/supabaseNotifications";

export default function NotificationBell() {
  const { user } = useAuth();
  const [recipientType, setRecipientType] = useState<"customer" | "vendor" | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) {
      setRecipientType(null);
      setRecipientId(null);
      setNotifications([]);
      return;
    }

    // Vendors (with an approved store) get vendor notifications; everyone else gets customer ones.
    fetchStoreByOwner(user.id).then((r) => {
      if (r.data && r.data.status === "Approved") {
        setRecipientType("vendor");
        setRecipientId(r.data.id);
      } else {
        setRecipientType("customer");
        setRecipientId(user.id);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!recipientType || !recipientId) return;

    const load = () => {
      fetchNotifications(recipientType, recipientId).then((r) => setNotifications(r.data || []));
    };

    load();
    pollRef.current = setInterval(load, 30000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [recipientType, recipientId]);

  if (!user || !recipientType || !recipientId) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleClickNotification = async (n: Notification) => {
    if (!n.read) {
      await markNotificationRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    if (n.order_id) {
      window.location.href = recipientType === "vendor" ? "/vendor/orders" : "/account/orders";
    } else if (recipientType === "vendor") {
      window.location.href = "/vendor/messages";
    }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead(recipientType, recipientId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    return Math.floor(hrs / 24) + "d ago";
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} aria-label="Notifications" className="relative">
         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          <circle cx="12" cy="8" r="1.4" fill="currentColor" stroke="none" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
              <p className="text-sm font-bold text-black dark:text-white">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={handleMarkAll} className="text-xs font-semibold text-brand">Mark all read</button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-6 text-center">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={
                    "w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 " +
                    (!n.read ? "bg-brand/5" : "")
                  }
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-1.5 h-1.5 bg-brand rounded-full mt-1.5 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-black dark:text-white">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

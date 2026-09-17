"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { markNotificationRead } from "@/lib/supabaseNotifications";
import { ADMIN_EMAIL } from "@/lib/admin";
import { getPushPermissionState, subscribeToPush } from "@/lib/pushNotifications";

type ToastItem = {
  id: string;
  title: string;
  body: string;
  url: string | null;
};

export default function NotificationToast() {
  const { user } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState<ToastItem | null>(null);
  const [showEnablePrompt, setShowEnablePrompt] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recipientType = user?.email === ADMIN_EMAIL ? "admin" : "customer";
  const recipientId = user?.email === ADMIN_EMAIL ? "admin" : user?.id;

  useEffect(() => {
    if (!user || !recipientId) return;

    const channel = supabase
      .channel("notification_toast_" + recipientId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: "recipient_id=eq." + recipientId },
        (payload) => {
          const row = payload.new as { id: string; title: string; body: string; url: string | null; recipient_type: string };
          if (row.recipient_type !== recipientType) return;

          if (hideTimer.current) clearTimeout(hideTimer.current);
          setToast({ id: row.id, title: row.title, body: row.body, url: row.url });
          hideTimer.current = setTimeout(() => setToast(null), 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, recipientId, recipientType]);

  useEffect(() => {
    if (!user) return;
    getPushPermissionState().then((state) => {
      if (state === "default") setShowEnablePrompt(true);
    });
  }, [user]);

  const handleToastClick = async () => {
    if (!toast) return;
    await markNotificationRead(toast.id);
    if (toast.url) router.push(toast.url);
    setToast(null);
  };

  const handleEnablePush = async () => {
    setShowEnablePrompt(false);
    if (!recipientId) return;
    await subscribeToPush(recipientType, recipientId);
  };

  return (
    <>
      {toast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-sm animate-[toastDown_0.3s_ease-out_forwards]">
          <button
            onClick={handleToastClick}
            className="w-full text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl px-4 py-3 flex items-start gap-3 hover:shadow-xl transition-shadow"
          >
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-black dark:text-white truncate">{toast.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{toast.body}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hideTimer.current) clearTimeout(hideTimer.current);
                setToast(null);
              }}
              className="ml-auto text-gray-300 hover:text-gray-500 shrink-0"
              aria-label="Dismiss"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </button>
        </div>
      )}

      {showEnablePrompt && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-sm bg-black dark:bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white shrink-0">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <p className="text-xs text-white flex-1">Get notified about your orders, even when you're not on the site.</p>
          <button onClick={handleEnablePush} className="text-xs font-bold text-brand shrink-0">Enable</button>
          <button onClick={() => setShowEnablePrompt(false)} className="text-xs text-gray-400 shrink-0">Later</button>
        </div>
      )}
    </>
  );
}

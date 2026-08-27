"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchAllStores, Store } from "@/lib/supabaseStores";
import {
  fetchVendorMessages,
  sendVendorMessage,
  markMessagesRead,
  fetchUnreadCountsByStore,
  VendorMessage,
} from "@/lib/supabaseMessages";
import { createNotification } from "@/lib/supabaseNotifications";

export default function AdminMessagesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Messages</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Text any vendor directly from here.</p>
            <Suspense fallback={<p className="text-sm text-gray-400">Loading...</p>}>
              <MessagesInbox />
            </Suspense>
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

function MessagesInbox() {
  const searchParams = useSearchParams();
  const preselectedStore = searchParams.get("store");

  const [stores, setStores] = useState<Store[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(preselectedStore);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState<VendorMessage[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadStores = async () => {
    const { data } = await fetchAllStores();
    setStores(data || []);
    const counts = await fetchUnreadCountsByStore();
    setUnreadCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    loadStores();
  }, []);

  const loadThread = async (storeId: string) => {
    const { data } = await fetchVendorMessages(storeId);
    setMessages(data || []);
    await markMessagesRead(storeId, "admin");
    setUnreadCounts((prev) => ({ ...prev, [storeId]: 0 }));
  };

  useEffect(() => {
    if (selectedId) loadThread(selectedId);
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !body.trim()) return;
    setSending(true);
    const text = body.trim();
    const { data } = await sendVendorMessage(selectedId, "admin", text);
    if (data) {
      setMessages((prev) => [...prev, data]);
      await createNotification({
        recipient_type: "vendor",
        recipient_id: selectedId,
        title: "New message from Thomex Admin",
        body: text.length > 80 ? text.slice(0, 80) + "..." : text,
      });
    }
    setBody("");
    setSending(false);
  };

  const visibleStores = stores.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const selectedStore = stores.find((s) => s.id === selectedId);

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col md:flex-row h-[70vh] overflow-hidden">
      <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-gray-400 p-4">Loading vendors...</p>
          ) : visibleStores.length === 0 ? (
            <p className="text-xs text-gray-400 p-4">No vendors found.</p>
          ) : (
            visibleStores.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={
                  "w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between gap-2 " +
                  (selectedId === s.id ? "bg-gray-50 dark:bg-gray-900" : "")
                }
              >
                <span className="text-sm text-black dark:text-white truncate">{s.name}</span>
                {unreadCounts[s.id] > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    {unreadCounts[s.id]}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {!selectedStore ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Select a vendor to start messaging.
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-bold text-black dark:text-white">{selectedStore.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{selectedStore.contact_email}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">No messages yet — say hello below.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={"flex " + (m.sender === "admin" ? "justify-end" : "justify-start")}>
                    <div
                      className={
                        "max-w-[75%] rounded-lg px-3 py-2 text-sm " +
                        (m.sender === "admin"
                          ? "bg-brand text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white")
                      }
                    >
                      {m.sender === "vendor" && <p className="text-[10px] font-bold opacity-70 mb-0.5">{selectedStore.name}</p>}
                      <p>{m.body}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-gray-100 dark:border-gray-800 p-3 flex gap-2">
              <input
                type="text"
                placeholder={"Message " + selectedStore.name + "..."}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand"
              />
              <button type="submit" disabled={sending || !body.trim()} className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import VendorSidebar from "@/components/VendorSidebar";
import { fetchVendorMessages, sendVendorMessage, markMessagesRead, VendorMessage } from "@/lib/supabaseMessages";

export default function VendorMessagesPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <VendorGuard>{(store) => <VendorThread storeId={store.id} />}</VendorGuard>
      <Footer />
    </main>
  );
}

function VendorThread({ storeId }: { storeId: string }) {
  const [messages, setMessages] = useState<VendorMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await fetchVendorMessages(storeId);
    setMessages(data || []);
    setLoading(false);
    await markMessagesRead(storeId, "vendor");
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [storeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const { data } = await sendVendorMessage(storeId, "vendor", body.trim());
    if (data) setMessages((prev) => [...prev, data]);
    setBody("");
    setSending(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
      <VendorSidebar />

      <div className="flex-1 min-w-0 max-w-2xl">
        <h1 className="text-xl font-bold mb-1 text-black dark:text-white">Messages with Thomex Admin</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Ask questions about payouts, policies, or your account.</p>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col h-[60vh]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-sm text-gray-400">Loading conversation...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
              No messages yet — say hello to the Thomex team below.
            </p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={"flex " + (m.sender === "vendor" ? "justify-end" : "justify-start")}>
                <div
                  className={
                    "max-w-[75%] rounded-lg px-3 py-2 text-sm " +
                    (m.sender === "vendor"
                      ? "bg-brand text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white")
                  }
                >
                  {m.sender === "admin" && <p className="text-[10px] font-bold opacity-70 mb-0.5">Thomex Admin</p>}
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
              placeholder="Type a message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
            <button type="submit" disabled={sending || !body.trim()} className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

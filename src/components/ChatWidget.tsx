"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useChatWidget } from "@/context/ChatContext";
import { fetchSettings } from "@/lib/supabaseSettings";

type Message = {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_name: string | null;
  message: string;
  created_at: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ChatWidget() {
  const { user } = useAuth();
  const { open, setOpen, unread, setUnread } = useChatWidget();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hotline, setHotline] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const username =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "Customer";

  useEffect(() => {
    fetchSettings().then((r) => setHotline(r.data?.hotline || null));
  }, []);

  useEffect(() => {
    if (!open || !user || conversationId) return;

    const init = async () => {
      setLoading(true);
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        setConversationId(existing.id);
        await supabase
          .from("conversations")
          .update({ unread_by_customer: false })
          .eq("id", existing.id);
      } else {
        const { data: created } = await supabase
          .from("conversations")
          .insert({
            customer_id: user.id,
            customer_name: username,
            status: "open",
          })
          .select()
          .single();
        if (created) setConversationId(created.id);
      }
      setLoading(false);
    };

    init();
  }, [open, user, conversationId, username]);

  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) || []);
    };
    loadMessages();

    const channel = supabase
      .channel("chat_messages_" + conversationId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: "conversation_id=eq." + conversationId },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          if ((payload.new as Message).sender_type === "admin" && !open) {
            setUnread(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, open, setUnread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;
    const text = input.trim();
    setInput("");

    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      sender_type: "customer",
      sender_name: username,
      message: text,
    });

    await supabase
      .from("conversations")
      .update({
        last_message: text,
        last_message_at: new Date().toISOString(),
        unread_by_admin: true,
      })
      .eq("id", conversationId);
  };

  const handleOpen = () => {
    setOpen(true);
    setUnread(false);
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        aria-label="Open chat"
        className="hidden md:flex fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand text-white shadow-xl items-center justify-center print:hidden hover:scale-105 transition-transform"
      >
        {unread && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
        )}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
    );
  }

  let lastDayLabel = "";

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-5 md:right-5 z-50 print:hidden">
      <div className="w-full h-full md:w-96 md:h-[30rem] bg-white dark:bg-gray-950 md:border md:border-gray-200 dark:md:border-gray-800 md:rounded-2xl md:shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-3 py-3 flex items-center gap-2 shrink-0">
          <button onClick={() => setOpen(false)} aria-label="Back" className="text-black dark:text-white p-1 -ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <p className="flex-1 text-sm font-bold text-black dark:text-white text-center">Customer Service</p>
          {hotline ? (
            <a href={"tel:" + hotline.replace(/\s+/g, "")} aria-label="Call support" className="text-black dark:text-white p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
          ) : (
            <span className="w-6" />
          )}
        </div>

        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-gray-500">Sign in to chat with our support team.</p>
            <a href="/signin" className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-md">
              Sign In
            </a>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 bg-white dark:bg-gray-950">
              {loading && <p className="text-xs text-gray-400 text-center">Loading...</p>}
              {!loading && messages.length === 0 && (
                <p className="text-xs text-gray-400 text-center mt-4">
                  Send a message to start the conversation.
                </p>
              )}
              {messages.map((m) => {
                const dayLabel = formatDayLabel(m.created_at);
                const showDayDivider = dayLabel !== lastDayLabel;
                lastDayLabel = dayLabel;
                const isCustomer = m.sender_type === "customer";

                return (
                  <div key={m.id}>
                    {showDayDivider && (
                      <p className="text-center text-[11px] text-gray-400 my-3">{dayLabel}</p>
                    )}
                    <div className={"flex mb-3 " + (isCustomer ? "justify-end" : "justify-start")}>
                      <div className={"max-w-[75%] flex flex-col " + (isCustomer ? "items-end" : "items-start")}>
                        <div
                          className={
                            "px-3.5 py-2.5 rounded-2xl text-sm leading-snug " +
                            (isCustomer
                              ? "bg-black dark:bg-brand text-white rounded-br-sm"
                              : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-bl-sm")
                          }
                        >
                          {m.message}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTime(m.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-gray-100 dark:border-gray-800 p-3 flex items-center gap-2 shrink-0 bg-white dark:bg-gray-950">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message..."
                className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white focus:outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-brand-light transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

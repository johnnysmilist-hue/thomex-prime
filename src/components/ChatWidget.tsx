"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

type Message = {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_name: string | null;
  message: string;
  created_at: string;
};

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const username =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "Customer";

  // Find or create this customer's conversation when they open the widget
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

  // Load messages + subscribe to new ones once we have a conversation
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
  }, [conversationId, open]);

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

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-80 sm:w-96 h-[28rem] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl flex flex-col mb-3 overflow-hidden">
          <div className="bg-black dark:bg-gray-950 text-white px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Chat with Thomex Support</p>
            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
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
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {loading && <p className="text-xs text-gray-400 text-center">Loading...</p>}
                {!loading && messages.length === 0 && (
                  <p className="text-xs text-gray-400 text-center mt-4">
                    Send a message to start the conversation.
                  </p>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={"flex " + (m.sender_type === "customer" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={
                        "max-w-[75%] px-3 py-2 rounded-lg text-sm " +
                        (m.sender_type === "customer"
                          ? "bg-brand text-white rounded-br-none"
                          : "bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-bl-none")
                      }
                    >
                      {m.message}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="border-t border-gray-100 dark:border-gray-800 p-2 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center shrink-0"
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
      )}

      {/* Toggle button when closed */}
      {!open && (
        <button
          onClick={handleOpen}
          className="relative w-14 h-14 bg-brand hover:bg-brand/90 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          {unread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              !
            </span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}

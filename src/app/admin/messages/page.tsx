"use client";

import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

type Conversation = {
  id: string;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  status: string;
  assigned_admin: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_by_admin: boolean;
  created_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_name: string | null;
  message: string;
  created_at: string;
};

export default function AdminMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const adminName = user?.user_metadata?.username || user?.email || "Admin";
  const active = conversations.find((c) => c.id === activeId) || null;

  // Load conversation list + subscribe to changes
  useEffect(() => {
    const loadConversations = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .order("last_message_at", { ascending: false });
      setConversations((data as Conversation[]) || []);
      setLoadingList(false);
    };
    loadConversations();

    const channel = supabase
      .channel("admin_conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => loadConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load thread + subscribe to new messages when a conversation is selected
  useEffect(() => {
    if (!activeId) return;

    const loadMessages = async () => {
      setLoadingThread(true);
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) || []);
      setLoadingThread(false);
    };
    loadMessages();

    supabase.from("conversations").update({ unread_by_admin: false }).eq("id", activeId).then();

    const channel = supabase
      .channel("admin_thread_" + activeId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: "conversation_id=eq." + activeId },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeId) return;
    const text = input.trim();
    setInput("");

    await supabase.from("chat_messages").insert({
      conversation_id: activeId,
      sender_type: "admin",
      sender_name: adminName,
      message: text,
    });

    await supabase
      .from("conversations")
      .update({
        last_message: text,
        last_message_at: new Date().toISOString(),
        unread_by_customer: true,
        assigned_admin: active?.assigned_admin || adminName,
      })
      .eq("id", activeId);
  };

  const handleMarkDone = async () => {
    if (!activeId) return;
    await supabase.from("conversations").update({ status: "closed" }).eq("id", activeId);
  };

  const handleAssignToMe = async () => {
    if (!activeId) return;
    await supabase.from("conversations").update({ assigned_admin: adminName }).eq("id", activeId);
  };

  const unassignedCount = conversations.filter((c) => !c.assigned_admin && c.status === "open").length;
  const mineCount = conversations.filter((c) => c.assigned_admin === adminName && c.status === "open").length;

  return (
    <AdminLayout title="Messages">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden flex h-[calc(100vh-180px)] min-h-[500px]">
        {/* Conversation list */}
        <div className="w-72 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs">
            <div>
              <p className="font-bold text-black dark:text-white text-base">{unassignedCount}</p>
              <p className="text-gray-400">Unassigned</p>
            </div>
            <div>
              <p className="font-bold text-black dark:text-white text-base">{mineCount}</p>
              <p className="text-gray-400">Mine</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList && <p className="text-xs text-gray-400 text-center py-6">Loading...</p>}
            {!loadingList && conversations.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No conversations yet.</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={
                  "w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800/60 flex items-start gap-3 " +
                  (activeId === c.id ? "bg-gray-50 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50")
                }
              >
                <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">
                  {(c.customer_name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-black dark:text-white truncate">
                      {c.customer_name || "Customer"}
                    </p>
                    {c.unread_by_admin && <span className="w-2 h-2 rounded-full bg-brand shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.last_message || "No messages yet"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Select a conversation to view messages.
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-black dark:text-white">{active.customer_name || "Customer"}</p>
                  {active.assigned_admin && (
                    <span className="text-xs text-gray-400">Assigned {active.assigned_admin}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {active.assigned_admin !== adminName && (
                    <button onClick={handleAssignToMe} className="text-xs px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-black dark:text-white">
                      Assign to me
                    </button>
                  )}
                  {active.status !== "closed" && (
                    <button onClick={handleMarkDone} className="text-xs px-3 py-1.5 rounded-md bg-green-600 text-white flex items-center gap-1">
                      Mark as done
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {loadingThread && <p className="text-xs text-gray-400 text-center">Loading...</p>}
                {messages.map((m) => (
                  <div key={m.id} className={"flex " + (m.sender_type === "admin" ? "justify-end" : "justify-start")}>
                    <div
                      className={
                        "max-w-[70%] px-3 py-2 rounded-lg text-sm " +
                        (m.sender_type === "admin"
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

              <form onSubmit={handleSend} className="border-t border-gray-100 dark:border-gray-800 p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white focus:outline-none"
                />
                <button type="submit" className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Customer info panel */}
        {active && (
          <div className="w-64 border-l border-gray-100 dark:border-gray-800 p-4 shrink-0 hidden lg:block overflow-y-auto">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-lg mx-auto mb-2">
                {(active.customer_name || "?").charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-semibold text-black dark:text-white">{active.customer_name || "Customer"}</p>
              <p className="text-xs text-gray-400">{active.customer_phone || ""}</p>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Conversation</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Started {new Date(active.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Status: <span className="capitalize">{active.status}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type NavItem = { label: string; href: string; group: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", group: "Pages" },
  { label: "Products", href: "/admin/products", group: "Pages" },
  { label: "Categories", href: "/admin/categories", group: "Pages" },
  { label: "Orders", href: "/admin/orders", group: "Pages" },
  { label: "Stores", href: "/admin/stores", group: "Pages" },
  { label: "Banners", href: "/admin/banners", group: "Pages" },
  { label: "Media Library", href: "/admin/media", group: "Pages" },
  { label: "Customers", href: "/admin/users", group: "Pages" },
  { label: "Messages", href: "/admin/messages", group: "Pages" },
  { label: "Settings", href: "/admin/settings", group: "Pages" },
  { label: "Add New Product", href: "/admin/products/new", group: "Actions" },
];

type OrderResult = { id: string; order_code: string; customer_name: string | null };

export default function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [orderResults, setOrderResults] = useState<OrderResult[]>([]);
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const close = useCallback(() => {
    onOpenChange(false);
    setQuery("");
    setOrderResults([]);
  }, [onOpenChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange, close]);

  useEffect(() => {
    if (!query.trim()) {
      setOrderResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("orders")
        .select("id, order_code, customer_name")
        .or("order_code.ilike.%" + query + "%,customer_name.ilike.%" + query + "%")
        .limit(5);
      setOrderResults((data as OrderResult[]) || []);
      setSearching(false);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const filteredNav = NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const goTo = (href: string) => {
    router.push(href);
    close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
      <div className="fixed inset-0 bg-black/50" onClick={close} />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, orders, customers..."
            className="flex-1 bg-transparent text-sm text-black dark:text-white focus:outline-none"
          />
          <kbd className="text-[10px] font-semibold border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-gray-400 shrink-0">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {filteredNav.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase px-4 py-1.5">Pages & Actions</p>
              {filteredNav.map((item) => (
                <button
                  key={item.href}
                  onClick={() => goTo(item.href)}
                  className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {query.trim() && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase px-4 py-1.5">
                Orders {searching && "(searching...)"}
              </p>
              {orderResults.length === 0 && !searching && (
                <p className="text-xs text-gray-400 px-4 py-2">No matching orders.</p>
              )}
              {orderResults.map((order) => (
                <button
                  key={order.id}
                  onClick={() => goTo("/admin/orders")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between"
                >
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{order.order_code}</span>
                  <span className="text-black dark:text-white">{order.customer_name || "—"}</span>
                </button>
              ))}
            </div>
          )}

          {filteredNav.length === 0 && !query.trim() && (
            <p className="text-xs text-gray-400 px-4 py-6 text-center">Type to search pages or orders...</p>
          )}
        </div>
      </div>
    </div>
  );
}

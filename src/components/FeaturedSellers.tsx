"use client";

import { useState, useEffect } from "react";
import { fetchAllStores, Store } from "@/lib/supabaseStores";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function FeaturedSellers() {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    fetchAllStores().then((r) => {
      const featured = (r.data || []).filter((s) => s.featured && s.status === "Approved");
      setStores(featured);
    });
  }, []);

  if (stores.length === 0) return null;

  return (
    <section className="border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h3 className="text-sm font-bold text-black dark:text-white mb-5">Featured Sellers</h3>
        <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {stores.map((store) => (
            <a
              key={store.id}
              href={"/shop?store=" + store.id}
              className="shrink-0 w-40 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center text-gray-400 text-xs">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                ) : (
                  store.name.charAt(0)
                )}
              </div>
              <p className="text-xs font-semibold text-black dark:text-white text-center flex items-center gap-1">
                {store.name}
                <VerifiedBadge />
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

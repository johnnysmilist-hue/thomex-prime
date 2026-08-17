"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import VerifiedBadge from "./VerifiedBadge";
import { fetchStoreById, Store } from "@/lib/supabaseStores";

export default function SoldBy({ storeId }: { storeId?: string }) {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    if (!storeId) return;
    fetchStoreById(storeId).then((r) => setStore(r.data));
  }, [storeId]);

  if (!storeId) {
    return (
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Sold by <span className="font-semibold text-black dark:text-white">Thomex Official</span>
      </p>
    );
  }

  if (!store) return null;

  return (
    <Link href={"/store/" + store.id} className="text-xs text-gray-500 dark:text-gray-400 mb-4 inline-flex items-center gap-1 hover:text-brand">
      Sold by <span className="font-semibold text-black dark:text-white">{store.name}</span> <VerifiedBadge size={12} />
    </Link>
  );
}

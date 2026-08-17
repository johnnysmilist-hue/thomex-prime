"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchStoreByOwner, Store } from "@/lib/supabaseStores";

export default function VendorGuard({ children }: { children: (store: Store) => ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    fetchStoreByOwner(user.id).then((r) => {
      setStore(r.data);
      setChecking(false);
    });
  }, [user]);

  if (authLoading || checking) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-400">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-bold mb-2 text-black dark:text-white">Vendor Access Required</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sign in with your store account to continue.</p>
        <Link href="/signin" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">Sign In</Link>
      </div>
    );
  }

  if (!store || store.status !== "Approved") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-bold mb-2 text-black dark:text-white">No Approved Store</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {store ? "Your store application is " + store.status.toLowerCase() + "." : "You haven't applied to sell on Thomex yet."}
        </p>
        <Link href="/sell" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
          {store ? "View Application" : "Apply to Sell"}
        </Link>
      </div>
    );
  }

  return <>{children(store)}</>;
}

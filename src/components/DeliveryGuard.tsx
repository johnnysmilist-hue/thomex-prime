"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchOfficerByUserId, DeliveryOfficer } from "@/lib/supabaseDeliveryOfficers";

export default function DeliveryGuard({ children }: { children: (officer: DeliveryOfficer) => ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [officer, setOfficer] = useState<DeliveryOfficer | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    fetchOfficerByUserId(user.id).then((r) => {
      setOfficer(r.data);
      setChecking(false);
    });
  }, [user]);

  if (authLoading || checking) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-400">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-bold mb-2 text-black dark:text-white">Delivery Officer Access</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sign in with your delivery officer account to continue.</p>
        <Link href="/signin" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">Sign In</Link>
      </div>
    );
  }

  if (!officer || !officer.active) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-bold mb-2 text-black dark:text-white">Not a Delivery Officer</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {officer ? "Your delivery officer account is currently inactive. Contact the store admin." : "This account isn't set up as a delivery officer. Contact the store admin."}
        </p>
      </div>
    );
  }

  return <>{children(officer)}</>;
}

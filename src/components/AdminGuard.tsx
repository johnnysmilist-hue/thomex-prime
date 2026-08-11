"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_EMAIL } from "@/lib/admin";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-400">Loading...</div>;
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-bold mb-2 text-black dark:text-white">Access Restricted</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This area is only available to Thomex admins.
        </p>
        <Link href="/signin" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
          Sign In
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

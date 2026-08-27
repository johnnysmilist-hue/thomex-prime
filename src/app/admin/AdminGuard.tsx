"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const isAdmin = user.user_metadata?.role === "admin";
    if (!isAdmin) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Checking access...
      </div>
    );
  }

  const isAdmin = user?.user_metadata?.role === "admin";
  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}

"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchAllStores, updateStoreStatus, Store } from "@/lib/supabaseStores";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchAllStores();
    setStores(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await updateStoreStatus(id, status);
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const statusColor = (status: string) => {
    if (status === "Approved") return "text-green-600 dark:text-green-400";
    if (status === "Rejected") return "text-red-500";
    return "text-yellow-600 dark:text-yellow-400";
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1">
            <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Vendor Stores</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Approve or reject store applications. Approved stores can manage their own products from their vendor dashboard.
            </p>

            {loading ? (
              <p className="text-sm text-gray-400">Loading stores...</p>
            ) : stores.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No store applications yet.</p>
            ) : (
              <div className="space-y-3">
                {stores.map((store) => (
                  <div key={store.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-sm font-bold text-black dark:text-white">{store.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {store.contact_email} • {store.contact_phone}
                        </p>
                        <p className={"text-xs font-semibold mt-1 " + statusColor(store.status)}>{store.status}</p>
                      </div>
                      <div className="flex gap-2">
                        {store.status !== "Approved" && (
                          <button onClick={() => handleStatusChange(store.id, "Approved")} className="bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-md">
                            Approve
                          </button>
                        )}
                        {store.status !== "Rejected" && (
                          <button onClick={() => handleStatusChange(store.id, "Rejected")} className="border border-red-500 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-md">
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                    {store.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-3">{store.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

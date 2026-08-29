"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchAllStores, updateStoreStatus, Store } from "@/lib/supabaseStores";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchAllStores();
    setStores(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await updateStoreStatus(id, status);
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const statusBadge = (status: string) => {
    if (status === "Approved") return "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400";
    if (status === "Rejected") return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400";
    return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";
  };

  return (
    <AdminLayout title="Vendor Stores">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Review documents, then approve or reject store applications.</p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading stores...</p>
      ) : stores.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No store applications yet.</p>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => (
            <div key={store.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-bold text-black dark:text-white flex items-center gap-1">
                    {store.name}
                    {store.status === "Approved" && <VerifiedBadge />}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{store.contact_email} • {store.contact_phone}</p>
                  <span className={"inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold " + statusBadge(store.status)}>
                    {store.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {store.status !== "Approved" && (
                    <button onClick={() => handleStatusChange(store.id, "Approved")} className="bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-md">Approve</button>
                  )}
                  {store.status !== "Rejected" && (
                    <button onClick={() => handleStatusChange(store.id, "Rejected")} className="border border-red-500 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-md">Reject</button>
                  )}
                </div>
              </div>

              {store.description && <p className="text-xs text-gray-600 dark:text-gray-300 mt-3">{store.description}</p>}

              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                {store.id_document_url ? (
                  <a href={store.id_document_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand underline">View ID Document</a>
                ) : (
                  <span className="text-xs text-gray-400">No ID document</span>
                )}
                {store.business_document_url ? (
                  <a href={store.business_document_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand underline">View Business Document</a>
                ) : (
                  <span className="text-xs text-gray-400">No business document</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

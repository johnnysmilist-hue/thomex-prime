"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchAllStores, updateStoreStatus, Store } from "@/lib/supabaseStores";
import VerifiedBadge from "@/components/VerifiedBadge";

const tabs = ["All", "Pending", "Approved", "Suspended", "Rejected"];

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

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

  const statusColor = (status: string) => {
    if (status === "Approved") return "text-green-600 dark:text-green-400";
    if (status === "Rejected") return "text-red-500";
    if (status === "Suspended") return "text-orange-500";
    return "text-yellow-600 dark:text-yellow-400";
  };

  const visible = stores.filter((s) => {
    const matchesTab = tab === "All" || s.status === tab;
    const matchesSearch =
      search.trim() === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_email || "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Vendor Stores</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Review documents, approve, suspend, or feature vendors. Click a vendor to see their sales stats, set commission, and leave private notes.
            </p>

            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div className="flex gap-1 border border-gray-200 dark:border-gray-800 rounded-md p-1">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={
                      tab === t
                        ? "bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded"
                        : "text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1.5 rounded"
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm w-full sm:w-64"
              />
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">Loading stores...</p>
            ) : visible.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No vendors match this view.</p>
            ) : (
              <div className="space-y-3">
                {visible.map((store) => (
                  <div key={store.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <a href={"/admin/stores/" + store.id} className="min-w-0">
                        <p className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5 hover:text-brand">
                          {store.name}
                          {store.status === "Approved" && <VerifiedBadge />}
                          {store.featured && <span className="text-yellow-500 text-xs">★</span>}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{store.contact_email} • {store.contact_phone}</p>
                        <p className={"text-xs font-semibold mt-1 " + statusColor(store.status)}>{store.status}</p>
                      </a>
                      <div className="flex gap-2 shrink-0">
                        <a href={"/admin/stores/" + store.id} className="border border-gray-300 dark:border-gray-700 text-black dark:text-white text-xs font-semibold px-3 py-1.5 rounded-md">
                          View Details
                        </a>
                        {store.status !== "Approved" && (
                          <button onClick={() => handleStatusChange(store.id, "Approved")} className="bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-md">Approve</button>
                        )}
                        {store.status !== "Rejected" && (
                          <button onClick={() => handleStatusChange(store.id, "Rejected")} className="border border-red-500 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-md">Reject</button>
                        )}
                      </div>
                    </div>
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

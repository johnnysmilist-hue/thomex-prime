"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchAllStores, updateStoreStatus, updateStoreDetails, deleteStore, Store } from "@/lib/supabaseStores";
import { fetchUnreadCountsByStore } from "@/lib/supabaseMessages";
import VerifiedBadge from "@/components/VerifiedBadge";

const tabs = ["All", "Pending", "Approved", "Suspended", "Rejected"];

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchAllStores();
    setStores(data || []);
    const counts = await fetchUnreadCountsByStore();
    setUnreadCounts(counts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await updateStoreStatus(id, status);
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleEditClick = (store: Store) => {
    setEditingId(editingId === store.id ? null : store.id);
    setEditName(store.name);
    setEditEmail(store.contact_email || "");
    setEditPhone(store.contact_phone || "");
    setEditDescription(store.description || "");
  };

  const handleSaveEdit = async (id: string) => {
    setSavingEdit(true);
    await updateStoreDetails(id, {
      name: editName,
      contact_email: editEmail,
      contact_phone: editPhone,
      description: editDescription,
    });
    setStores((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, name: editName, contact_email: editEmail, contact_phone: editPhone, description: editDescription } : s
      )
    );
    setSavingEdit(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm("Delete " + name + "? This permanently removes their vendor account and cannot be undone.")) return;
    await deleteStore(id);
    setStores((prev) => prev.filter((s) => s.id !== id));
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
                          {unreadCounts[store.id] > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {unreadCounts[store.id]} new
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{store.contact_email} • {store.contact_phone}</p>
                        <p className={"text-xs font-semibold mt-1 " + statusColor(store.status)}>{store.status}</p>
                      </a>
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        <a href={"/admin/stores/" + store.id} className="border border-gray-300 dark:border-gray-700 text-black dark:text-white text-xs font-semibold px-3 py-1.5 rounded-md">
                          View
                        </a>
                        <button onClick={() => handleEditClick(store)} className="border border-gray-300 dark:border-gray-700 text-black dark:text-white text-xs font-semibold px-3 py-1.5 rounded-md">
                          Edit
                        </button>
                        <a href={"/admin/messages?store=" + store.id} className="border border-brand text-brand text-xs font-semibold px-3 py-1.5 rounded-md">
                          Text
                        </a>
                        {store.status !== "Approved" && (
                          <button onClick={() => handleStatusChange(store.id, "Approved")} className="bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-md">Approve</button>
                        )}
                        {store.status !== "Rejected" && (
                          <button onClick={() => handleStatusChange(store.id, "Rejected")} className="border border-red-500 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-md">Reject</button>
                        )}
                        <button onClick={() => handleDelete(store.id, store.name)} className="border border-red-500 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-md">
                          Delete
                        </button>
                      </div>
                    </div>

                    {editingId === store.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Store Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-1.5 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Contact Email</label>
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-1.5 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Contact Phone</label>
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-1.5 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</label>
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-1.5 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(store.id)}
                            disabled={savingEdit}
                            className="bg-brand text-white text-xs font-semibold px-4 py-1.5 rounded-md disabled:opacity-60"
                          >
                            {savingEdit ? "Saving..." : "Save Changes"}
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            Cancel
                          </button>
                        </div>
                      </div>
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

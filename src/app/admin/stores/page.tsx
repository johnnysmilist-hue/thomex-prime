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

  const counts = {
    Total: stores.length,
    Pending: stores.filter((s) => s.status === "Pending").length,
    Approved: stores.filter((s) => s.status === "Approved").length,
    Suspended: stores.filter((s) => s.status === "Suspended").length,
    Rejected: stores.filter((s) => s.status === "Rejected").length,
  };

  const statCards = [
    { key: "Total", label: "Total Vendors", bg: "bg-blue-50 dark:bg-blue-500/10", fg: "text-blue-600 dark:text-blue-400" },
    { key: "Pending", label: "Pending Review", bg: "bg-yellow-50 dark:bg-yellow-500/10", fg: "text-yellow-600 dark:text-yellow-400" },
    { key: "Approved", label: "Approved", bg: "bg-green-50 dark:bg-green-500/10", fg: "text-green-600 dark:text-green-400" },
    { key: "Suspended", label: "Suspended", bg: "bg-orange-50 dark:bg-orange-500/10", fg: "text-orange-600 dark:text-orange-400" },
    { key: "Rejected", label: "Rejected", bg: "bg-red-50 dark:bg-red-500/10", fg: "text-red-600 dark:text-red-400" },
  ];

  const cardIcon = (key: string) => {
    const common = { xmlns: "http://www.w3.org/2000/svg", width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (key === "Total") return <svg {...common}><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></svg>;
    if (key === "Pending") return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    if (key === "Approved") return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
    if (key === "Suspended") return <svg {...common}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
    return <svg {...common}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Vendor Stores</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Review documents, approve, suspend, or feature vendors. Click a vendor to see their sales stats, set commission, and leave private notes.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {statCards.map((card) => (
                <div key={card.key} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                  <div className={"w-11 h-11 rounded-xl flex items-center justify-center shrink-0 " + card.bg + " " + card.fg}>
                    {cardIcon(card.key)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : counts[card.key as keyof typeof counts]}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 mb-6">
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
                className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm w-full sm:w-64"
              />
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">Loading stores...</p>
            ) : visible.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No vendors match this view.</p>
            ) : (
              <div className="space-y-3">
                {visible.map((store) => (
                  <div key={store.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
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

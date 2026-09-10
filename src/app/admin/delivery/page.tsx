"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchOfficers, toggleOfficerActive, deleteOfficer, DeliveryOfficer } from "@/lib/supabaseDeliveryOfficers";

export default function AdminDeliveryPage() {
  const [officers, setOfficers] = useState<DeliveryOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await fetchOfficers();
    setOfficers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/create-delivery-officer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong.");
        setSaving(false);
        return;
      }

      setSuccess(name + " can now sign in at /signin with the email and password you set, and use /delivery.");
      resetForm();
      setShowForm(false);
      load();
    } catch {
      setError("Could not reach the server. Please try again.");
    }
    setSaving(false);
  };

  const handleToggle = async (officer: DeliveryOfficer) => {
    await toggleOfficerActive(officer.id, !officer.active);
    setOfficers((prev) => prev.map((o) => (o.id === officer.id ? { ...o, active: !o.active } : o)));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm("Remove " + name + " as a delivery officer? Their login stays active, they just lose delivery access.")) return;
    await deleteOfficer(id);
    setOfficers((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <AdminLayout title="Delivery Officers">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Add delivery officers so you can assign orders to them from the Orders page, and they can record pickup
        from the store and delivery to the customer from their own portal at <code>/delivery</code>.
      </p>

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(!showForm)} className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold">
          {showForm ? "Cancel" : "+ Add Delivery Officer"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6 space-y-4">
          <p className="text-sm font-bold text-black dark:text-white">New Delivery Officer</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Phone</label>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Login Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Temporary Password</label>
              <input required type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
            {saving ? "Creating..." : "Create Officer Account"}
          </button>
        </form>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 text-sm rounded-lg px-4 py-3 mb-6">
          {success}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : officers.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No delivery officers yet — add your first one above.</p>
      ) : (
        <div className="space-y-2">
          {officers.map((o) => (
            <div key={o.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3">
              <div>
                <p className="text-sm font-bold text-black dark:text-white">{o.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{o.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={"text-[10px] font-bold px-2 py-1 rounded-full " + (o.active ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>
                  {o.active ? "ACTIVE" : "DISABLED"}
                </span>
                <button onClick={() => handleToggle(o)} className="text-xs font-semibold text-brand">
                  {o.active ? "Disable" : "Enable"}
                </button>
                <button onClick={() => handleDelete(o.id, o.name)} className="text-xs font-semibold text-red-500">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

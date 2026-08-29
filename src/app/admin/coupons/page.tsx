"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchCoupons, addCoupon, updateCoupon, toggleCoupon, deleteCoupon, Coupon } from "@/lib/supabaseCoupons";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchCoupons();
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setMinOrder("");
    setMaxUses("");
    setExpiresAt("");
    setEditingId(null);
  };

  const handleEditClick = (c: Coupon) => {
    setEditingId(c.id);
    setCode(c.code);
    setDiscountType(c.discount_type);
    setDiscountValue(String(c.discount_value));
    setMinOrder(c.min_order !== null ? String(c.min_order) : "");
    setMaxUses(c.max_uses !== null ? String(c.max_uses) : "");
    setExpiresAt(c.expires_at ? c.expires_at.slice(0, 10) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim() || !discountValue) {
      setError("Code and discount value are required.");
      return;
    }

    setSaving(true);

    const payload = {
      code,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_order: minOrder ? parseFloat(minOrder) : null,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    const { error: err } = editingId ? await updateCoupon(editingId, payload) : await addCoupon(payload);
    setSaving(false);

    if (err) {
      setError(err.message.includes("duplicate") ? "That coupon code already exists." : "Something went wrong.");
      return;
    }

    resetForm();
    load();
  };

  const handleToggle = async (c: Coupon) => {
    await toggleCoupon(c.id, !c.active);
    setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await deleteCoupon(id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const isExpired = (c: Coupon) => Boolean(c.expires_at && new Date(c.expires_at) < new Date());

  const stats = {
    Total: coupons.length,
    Active: coupons.filter((c) => c.active && !isExpired(c)).length,
    Disabled: coupons.filter((c) => !c.active).length,
    Expired: coupons.filter((c) => isExpired(c)).length,
    Redemptions: coupons.reduce((sum, c) => sum + c.uses_count, 0),
  };

  const statCards = [
    { key: "Total", label: "Total Coupons", bg: "bg-blue-50 dark:bg-blue-500/10", fg: "text-blue-600 dark:text-blue-400" },
    { key: "Active", label: "Active", bg: "bg-green-50 dark:bg-green-500/10", fg: "text-green-600 dark:text-green-400" },
    { key: "Disabled", label: "Disabled", bg: "bg-gray-100 dark:bg-gray-500/10", fg: "text-gray-500 dark:text-gray-400" },
    { key: "Expired", label: "Expired", bg: "bg-orange-50 dark:bg-orange-500/10", fg: "text-orange-600 dark:text-orange-400" },
    { key: "Redemptions", label: "Total Redemptions", bg: "bg-purple-50 dark:bg-purple-500/10", fg: "text-purple-600 dark:text-purple-400" },
  ];

  const cardIcon = (key: string) => {
    const common = { xmlns: "http://www.w3.org/2000/svg", width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (key === "Total") return <svg {...common}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></svg>;
    if (key === "Active") return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
    if (key === "Disabled") return <svg {...common}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>;
    if (key === "Expired") return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    return <svg {...common}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.61" /><polyline points="21 3 21 9 15 9" /></svg>;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold mb-6 text-black dark:text-white">Coupons</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {statCards.map((card) => (
                <div key={card.key} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                  <div className={"w-11 h-11 rounded-xl flex items-center justify-center shrink-0 " + card.bg + " " + card.fg}>
                    {cardIcon(card.key)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : stats[card.key as keyof typeof stats]}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-black dark:text-white">{editingId ? "Edit Coupon" : "New Coupon"}</p>
                {editingId && (
                  <button type="button" onClick={resetForm} className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Cancel edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SAVE20"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed amount ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {discountType === "percent" ? "Percent off" : "Amount off ($)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={discountType === "percent" ? "20" : "10.00"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Min order ($, optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Max uses (optional)</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Expires on (optional)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full sm:w-48 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={saving}
                className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Coupon"}
              </button>
            </form>

            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : coupons.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No coupons yet — create your first one above.</p>
            ) : (
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-black dark:text-white">
                        {c.code}{" "}
                        <span className="font-normal text-gray-500 dark:text-gray-400">
                          — {c.discount_type === "percent" ? c.discount_value + "% off" : "$" + c.discount_value.toFixed(2) + " off"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {c.min_order ? "Min order $" + c.min_order.toFixed(2) + " • " : ""}
                        Used {c.uses_count}{c.max_uses ? " / " + c.max_uses : ""} times
                        {c.expires_at ? " • Expires " + new Date(c.expires_at).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={"text-[10px] font-bold px-2 py-1 rounded " + (c.active ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>
                        {c.active ? "ACTIVE" : "DISABLED"}
                      </span>
                      <button onClick={() => handleToggle(c)} className="text-xs font-semibold text-brand">
                        {c.active ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => handleEditClick(c)} className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs font-semibold text-red-500">
                        Delete
                      </button>
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

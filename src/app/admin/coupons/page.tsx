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

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold mb-8 text-black dark:text-white">Coupons</h1>

            <form onSubmit={handleCreate} className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-8 space-y-4">
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
                  <div key={c.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3">
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

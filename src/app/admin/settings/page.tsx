"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchSettings, updateSettings, StoreSettings } from "@/lib/supabaseSettings";

function toLocalDatetimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [flashSaleEndInput, setFlashSaleEndInput] = useState("");

  useEffect(() => {
    fetchSettings().then((r) => {
      setSettings(r.data);
      setFlashSaleEndInput(toLocalDatetimeInput(r.data?.flash_sale_end || null));
      setLoading(false);
    });
  }, []);

  const updateField = (field: keyof StoreSettings, value: string | number) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await updateSettings(settings.id, {
      store_name: settings.store_name,
      support_email: settings.support_email,
      whatsapp_number: settings.whatsapp_number,
      hotline: settings.hotline,
      address: settings.address,
      currency: settings.currency,
      free_shipping_threshold: settings.free_shipping_threshold,
      flash_sale_end: flashSaleEndInput ? new Date(flashSaleEndInput).toISOString() : null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1 max-w-xl">
            <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Store Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              These details are used across your site — contact info, checkout, and more.
            </p>

            {loading || !settings ? (
              <p className="text-sm text-gray-400">Loading settings...</p>
            ) : (
              <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Store Name</label>
                  <input value={settings.store_name} onChange={(e) => updateField("store_name", e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Support Email</label>
                  <input value={settings.support_email || ""} onChange={(e) => updateField("support_email", e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">WhatsApp Order Number</label>
                  <input value={settings.whatsapp_number || ""} onChange={(e) => updateField("whatsapp_number", e.target.value)} placeholder="254781102057" className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Hotline (displayed to customers)</label>
                  <input value={settings.hotline || ""} onChange={(e) => updateField("hotline", e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Business Address</label>
                  <textarea value={settings.address || ""} onChange={(e) => updateField("address", e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Currency</label>
                    <select value={settings.currency} onChange={(e) => updateField("currency", e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm">
                      <option value="USD">USD ($)</option>
                      <option value="KES">KES (KSh)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Free Shipping Over</label>
                    <input type="number" value={settings.free_shipping_threshold} onChange={(e) => updateField("free_shipping_threshold", parseFloat(e.target.value))} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Flash Sale Ends</label>
                  <input
                    type="datetime-local"
                    value={flashSaleEndInput}
                    onChange={(e) => setFlashSaleEndInput(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Controls the countdown shown on the homepage Flash Sale section.</p>
                </div>

                <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
                </button>
              </form>
            )}
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

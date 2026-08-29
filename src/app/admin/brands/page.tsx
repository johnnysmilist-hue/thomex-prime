"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchBrands, addBrand, deleteBrand, uploadBrandLogo, Brand } from "@/lib/supabaseBrands";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchBrands();
    setBrands(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setName("");
    setLogoFile(null);
    setLogoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !logoFile) {
      setError("Brand name and logo image are required.");
      return;
    }

    setSaving(true);
    const { url, error: uploadErr } = await uploadBrandLogo(logoFile);

    if (uploadErr || !url) {
      setSaving(false);
      setError("Logo upload failed. Please try again.");
      return;
    }

    const { error: dbErr } = await addBrand(name, url);
    setSaving(false);

    if (dbErr) {
      setError(dbErr.message.includes("duplicate") ? "That brand already exists." : dbErr.message);
      return;
    }

    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    await deleteBrand(id);
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-black dark:text-white">Brands</h1>
              <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">
                {loading ? "..." : brands.length}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              These show up in the &quot;Shop By Top Brands&quot; strip on your homepage. Clicking a logo takes shoppers to
              the shop page filtered to that brand — make sure the name here matches the Brand field you use on your
              products exactly (e.g. &quot;Apple&quot;, not &quot;apple&quot; or &quot;Apple Inc&quot;).
            </p>

            <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6 space-y-4">
              <p className="text-sm font-bold text-black dark:text-white">Add Brand</p>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apple"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full sm:w-80 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Logo Image</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-600 dark:text-gray-300" />
                {logoPreview && (
                  <div className="mt-3 w-32 h-16 border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <img src={logoPreview} alt="Preview" className="max-h-10 max-w-full object-contain" />
                  </div>
                )}
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
                {saving ? "Uploading..." : "Add Brand"}
              </button>
            </form>

            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : brands.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No brands yet — add your first one above.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {brands.map((b) => (
                  <div key={b.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center gap-3">
                    <div className="h-10 flex items-center">
                      <img src={b.logo_url} alt={b.name} className="max-h-10 max-w-full object-contain" />
                    </div>
                    <p className="text-sm font-medium text-black dark:text-white">{b.name}</p>
                    <button onClick={() => handleDelete(b.id)} className="text-xs font-semibold text-red-500">
                      Delete
                    </button>
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

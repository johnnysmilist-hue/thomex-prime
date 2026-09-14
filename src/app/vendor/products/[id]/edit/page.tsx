"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import VendorSidebar from "@/components/VendorSidebar";
import ProductImageGallery from "@/components/ProductImageGallery";
import { updateProduct, deleteProduct } from "@/lib/supabaseProducts";
import { fetchCategories, SiteCategory } from "@/lib/supabaseCategories";
import { fetchBrands, Brand } from "@/lib/supabaseBrands";
import { supabase } from "@/lib/supabaseClient";

type DbProductRow = {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  category: string;
  brand: string | null;
  description: string | null;
  image_url: string | null;
  status: string;
  stock: number;
  store_id: string | null;
  sku: string | null;
};

export default function EditVendorProductPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <VendorGuard>{(store) => <EditProductForm storeId={store.id} />}</VendorGuard>
      <Footer />
    </main>
  );
}

function EditProductForm({ storeId }: { storeId: string }) {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("Draft");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchCategories().then((r) => setCategories(r.data || []));
    fetchBrands().then((r) => setBrands(r.data || []));

    const load = async () => {
      const { data } = await supabase.from("products").select("*").eq("id", productId).single();

      if (!data || (data as DbProductRow).store_id !== storeId) {
        setNotAllowed(true);
        setLoading(false);
        return;
      }

      const p = data as DbProductRow;
      setName(p.name);
      setBrand(p.brand || "");
      setCategory(p.category);
      setPrice(String(p.price));
      setOldPrice(p.old_price !== null ? String(p.old_price) : "");
      setSku(p.sku || "");
      setStock(String(p.stock));
      setStatus(p.status || "Draft");
      setDescription(p.description || "");
      setImageUrl(p.image_url || "");
      setLoading(false);
    };
    load();
  }, [productId, storeId]);

  const handleSave = async (newStatus?: "Draft" | "Published") => {
    setError("");
    if (!name.trim() || !price || !category) {
      setError("Name, category, and price are required.");
      return;
    }

    setSaving(true);
    const { error: dbErr } = await updateProduct(productId, {
      name: name.trim(),
      price: parseFloat(price),
      old_price: oldPrice ? parseFloat(oldPrice) : null,
      category,
      brand: brand || null,
      description: description || null,
      image_url: imageUrl || null,
      status: newStatus || status,
      stock: stock ? parseInt(stock) : 0,
      sku: sku || null,
    } as any);
    setSaving(false);

    if (dbErr) {
      setError("Something went wrong saving changes.");
      return;
    }

    if (newStatus) setStatus(newStatus);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product permanently? This can't be undone.")) return;
    setDeleting(true);
    await deleteProduct(productId);
    router.push("/vendor/products");
  };

  const inputClass = "w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
        <VendorSidebar />
        <div className="flex-1 text-sm text-gray-400">Loading product...</div>
      </div>
    );
  }

  if (notAllowed) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
        <VendorSidebar />
        <div className="flex-1 text-center py-16">
          <p className="text-sm text-gray-500 mb-4">This product doesn't exist or doesn't belong to your store.</p>
          <a href="/vendor/products" className="text-sm text-brand font-semibold">Back to My Products</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
      <VendorSidebar />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-black dark:text-white">Edit Product</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Status:{" "}
              <span className={status === "Published" ? "text-green-600 font-semibold" : "text-gray-500 font-semibold"}>
                {status}
              </span>
            </p>
          </div>
          <a href="/vendor/products" className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand">← Back to My Products</a>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ProductImageGallery productId={productId} mainImageUrl={imageUrl} onMainImageChange={setImageUrl} />

              <div className="mt-6">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Product Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Brand Name</label>
                  <select value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass}>
                    <option value="">Select brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Regular Price</label>
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Sale Price (optional)</label>
                  <input type="number" step="0.01" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">SKU</label>
                <input value={sku} onChange={(e) => setSku(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Quantity in Stock</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={inputClass} />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}
              {saved && <p className="text-xs text-green-600 dark:text-green-400">Saved!</p>}

              <div className="flex gap-3 pt-2">
                {status !== "Published" ? (
                  <button
                    onClick={() => handleSave("Published")}
                    disabled={saving}
                    className="flex-1 bg-brand text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
                  >
                    {saving ? "Publishing..." : "Publish Product"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="flex-1 bg-brand text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="border border-red-300 text-red-500 px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
                >
                  {deleting ? "..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

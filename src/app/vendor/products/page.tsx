"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import VendorSidebar from "@/components/VendorSidebar";
import { supabase } from "@/lib/supabaseClient";
import { addProduct, deleteProduct, uploadProductImage, DbProduct } from "@/lib/supabaseProducts";
import { fetchCategories, fetchAllSubcategories, SiteCategory, SiteSubcategory } from "@/lib/supabaseCategories";

export default function VendorProductsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <VendorGuard>
        {(store) => <VendorProducts storeId={store.id} />}
      </VendorGuard>
      <Footer />
    </main>
  );
}

function VendorProducts({ storeId }: { storeId: string }) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [siteCategories, setSiteCategories] = useState<SiteCategory[]>([]);
  const [siteSubcategories, setSiteSubcategories] = useState<SiteSubcategory[]>([]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("0");
  const [imageUrl, setImageUrl] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").eq("store_id", storeId).order("created_at", { ascending: false });
    setProducts((data as DbProduct[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
    fetchCategories().then((r) => {
      const cats = r.data || [];
      setSiteCategories(cats);
      setCategory((prev) => prev || cats[0]?.name || "");
    });
    fetchAllSubcategories().then((r) => setSiteSubcategories(r.data || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const selectedCategoryObj = siteCategories.find((c) => c.name === category);
  const availableSubcategories = siteSubcategories.filter((s) => s.category_id === selectedCategoryObj?.id);

  const handleCategoryChange = (name: string) => {
    setCategory(name);
    setSubcategory("");
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory(siteCategories[0]?.name || "");
    setSubcategory("");
    setDescription("");
    setStock("0");
    setImageUrl("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { url, error: uploadError } = await uploadProductImage(file);
    setUploading(false);
    if (uploadError || !url) {
      setError("Image upload failed.");
      return;
    }
    setImageUrl(url);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const { error: addError } = await addProduct({
      name,
      price: parseFloat(price),
      old_price: null,
      rating: 0,
      review_count: 0,
      discount_percent: null,
      category,
      subcategory: subcategory || null,
      brand: null,
      color: null,
      description,
      image_url: imageUrl || null,
      status: "Published",
      stock: parseInt(stock) || 0,
      featured: false,
      is_flash_sale: false,
      store_id: storeId,
    } as any);

    setSaving(false);

    if (addError) {
      setError("Could not save product. Please try again.");
      return;
    }

    resetForm();
    setShowForm(false);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
    loadProducts();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
      <VendorSidebar />

      <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-black dark:text-white">My Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold">
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
          <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : products.length}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Total Products</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400 leading-tight">
            {loading ? "..." : products.filter((p) => p.stock > 0 && p.stock <= 5).length}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Low Stock</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
          <p className="text-lg font-bold text-red-600 dark:text-red-400 leading-tight">
            {loading ? "..." : products.filter((p) => p.stock <= 0).length}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Out of Stock</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6 space-y-3">
          <input required placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" step="0.01" placeholder="Price (KSh)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
          </div>
          <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm">
            {siteCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={availableSubcategories.length === 0}
            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          >
            <option value="">{availableSubcategories.length === 0 ? "No subcategories" : "None"}</option>
            {availableSubcategories.map((sub) => (
              <option key={sub.id} value={sub.name}>{sub.name}</option>
            ))}
          </select>
          <textarea placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm resize-none" />
          <div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-black dark:text-white" />
            {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
            {imageUrl && <img src={imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md mt-2 border border-gray-100 dark:border-gray-800" />}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={saving || uploading} className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
            {saving ? "Saving..." : "Save Product"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">You haven't added any products yet.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded shrink-0 overflow-hidden">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white truncate">{p.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{p.category} • KSh {p.price.toFixed(2)} • Stock: {p.stock}</p>
              </div>
              <a href={"/vendor/products/" + p.id + "/edit"} className="text-brand text-xs font-semibold shrink-0">Edit</a>
              <button onClick={() => handleDelete(p.id)} className="text-red-500 text-xs font-semibold shrink-0">Delete</button>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import { supabase } from "@/lib/supabaseClient";
import { addProduct, deleteProduct, uploadProductImage, DbProduct } from "@/lib/supabaseProducts";
import { categories } from "@/lib/categories";

export default function VendorProductsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
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
  const [category, setCategory] = useState(categories[0]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory(categories[0]);
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-black dark:text-white">My Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold">
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-8 space-y-3">
          <input required placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" step="0.01" placeholder="Price (KSh)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
            <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm">
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <textarea placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm resize-none" />
          <div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-black dark:text-white" />
            {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
            {imageUrl && <img src={imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md mt-2 border border-gray-200 dark:border-gray-800" />}
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
            <div key={p.id} className="flex items-center gap-4 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded shrink-0 overflow-hidden">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white truncate">{p.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{p.category} • KSh {p.price.toFixed(2)} • Stock: {p.stock}</p>
              </div>
              <button onClick={() => handleDelete(p.id)} className="text-red-500 text-xs font-semibold shrink-0">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

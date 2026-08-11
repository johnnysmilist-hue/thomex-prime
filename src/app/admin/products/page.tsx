"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import { fetchProducts, addProduct, deleteProduct, DbProduct } from "@/lib/supabaseProducts";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await fetchProducts();
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setName("");
    setPrice("");
    setOldPrice("");
    setCategory("");
    setDescription("");
    setImageUrl("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const { error: addError } = await addProduct({
      name,
      price: parseFloat(price),
      old_price: oldPrice ? parseFloat(oldPrice) : null,
      rating: 0,
      review_count: 0,
      discount_percent: oldPrice ? Math.round(((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) * 100) : null,
      category,
      description,
      image_url: imageUrl || null,
    });

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
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-black dark:text-white">Manage Products</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold"
            >
              {showForm ? "Cancel" : "+ Add Product"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAdd} className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-8 space-y-3">
              <input required placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                <input type="number" step="0.01" placeholder="Old price (optional)" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
              </div>
              <input required placeholder="Category (e.g. Laptops)" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
              <textarea placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm resize-none" />
              <input placeholder="Image URL (optional for now)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
                {saving ? "Saving..." : "Save Product"}
              </button>
            </form>
          )}

          {loading ? (
            <p className="text-sm text-gray-400">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No products yet. Add your first one above.</p>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-4 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.category} • ${p.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 text-xs font-semibold shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

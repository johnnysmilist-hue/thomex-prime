"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import VendorSidebar from "@/components/VendorSidebar";
import ProductImageGallery from "@/components/ProductImageGallery";
import { addProduct } from "@/lib/supabaseProducts";
import { fetchCategories, SiteCategory } from "@/lib/supabaseCategories";
import { fetchBrands, Brand } from "@/lib/supabaseBrands";

export default function NewVendorProductPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <VendorGuard>{(store) => <NewProductForm storeId={store.id} />}</VendorGuard>
      <Footer />
    </main>
  );
}

function NewProductForm({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories().then((r) => setCategories(r.data || []));
    fetchBrands().then((r) => setBrands(r.data || []));
  }, []);

  const handleSave = async (status: "Draft" | "Published") => {
    setError("");
    if (!name.trim() || !price || !category) {
      setError("Name, category, and price are required.");
      return;
    }

    setSaving(true);
    const { data, error: dbErr } = await addProduct({
      name: name.trim(),
      price: parseFloat(price),
      old_price: oldPrice ? parseFloat(oldPrice) : null,
      rating: 0,
      review_count: 0,
      discount_percent: null,
      category,
      subcategory: null,
      brand: brand || null,
      color: null,
      description: description || null,
      image_url: imageUrl || null,
      status,
      stock: stock ? parseInt(stock) : 0,
      featured: false,
      is_flash_sale: false,
      store_id: storeId,
      sku: sku || null,
    } as any);
    setSaving(false);

    if (dbErr || !data) {
      setError("Something went wrong creating the product.");
      return;
    }

    router.push("/vendor/products/" + data.id + "/edit");
  };

  const inputClass = "w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
      <VendorSidebar />

      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold mb-1 text-black dark:text-white">Add New Product</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Fill in the basics — you can add more photos once it's saved.</p>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ProductImageGallery productId={null} mainImageUrl={imageUrl} onMainImageChange={setImageUrl} />

              <div className="mt-6">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe your product..."
                  className={inputClass + " resize-none"}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Product Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smart Watch Pro" className={inputClass} />
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
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$0.00" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Sale Price (optional)</label>
                  <input type="number" step="0.01" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="$0.00" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">SKU</label>
                <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. SW-PRO-BLK" className={inputClass} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Quantity in Stock</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" className={inputClass} />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSave("Draft")}
                  disabled={saving}
                  className="flex-1 border border-gray-300 dark:border-gray-700 text-black dark:text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save to Drafts"}
                </button>
                <button
                  onClick={() => handleSave("Published")}
                  disabled={saving}
                  className="flex-1 bg-brand text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
                >
                  {saving ? "Publishing..." : "Publish Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

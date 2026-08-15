"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { supabase } from "@/lib/supabaseClient";
import { updateProduct, uploadProductImage, DbProduct } from "@/lib/supabaseProducts";
import { fetchAttributes, addAttribute, deleteAttribute, Attribute } from "@/lib/supabaseAttributes";
import { categories } from "@/lib/categories";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("0");
  const [featured, setFeatured] = useState(false);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [status, setStatus] = useState("Published");
  const [imageUrl, setImageUrl] = useState("");

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attrName, setAttrName] = useState("");
  const [attrValue, setAttrValue] = useState("");
  const [attrPriceMod, setAttrPriceMod] = useState("0");
  const [attrStock, setAttrStock] = useState("0");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("products").select("*").eq("id", params.id).single();
      if (data) {
        const p = data as DbProduct;
        setName(p.name);
        setPrice(String(p.price));
        setOldPrice(p.old_price ? String(p.old_price) : "");
        setCategory(p.category);
        setBrand(p.brand || "");
        setColor(p.color || "");
        setDescription(p.description || "");
        setStock(String(p.stock));
        setFeatured(p.featured);
        setIsFlashSale(p.is_flash_sale || false);
        setStatus(p.status);
        setImageUrl(p.image_url || "");
      }
      const { data: attrs } = await fetchAttributes(params.id);
      setAttributes(attrs || []);
      setLoading(false);
    };
    load();
  }, [params.id]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: saveError } = await updateProduct(params.id, {
      name,
      price: parseFloat(price),
      old_price: oldPrice ? parseFloat(oldPrice) : null,
      discount_percent: oldPrice ? Math.round(((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) * 100) : null,
      category,
      brand: brand || null,
      color: color || null,
      description,
      image_url: imageUrl || null,
      status,
      stock: parseInt(stock) || 0,
      featured,
      is_flash_sale: isFlashSale,
    });

    setSaving(false);

    if (saveError) {
      setError("Could not save changes. Please try again.");
      return;
    }

    router.push("/admin/products");
  };

  const handleAddAttribute = async () => {
    if (!attrName.trim() || !attrValue.trim()) return;
    const { data } = await addAttribute({
      product_id: params.id,
      name: attrName,
      value: attrValue,
      price_modifier: parseFloat(attrPriceMod) || 0,
      stock: parseInt(attrStock) || 0,
    });
    if (data) {
      setAttributes((prev) => [...prev, data]);
      setAttrName("");
      setAttrValue("");
      setAttrPriceMod("0");
      setAttrStock("0");
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    await deleteAttribute(id);
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <AdminGuard>
          <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-400">Loading...</div>
        </AdminGuard>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1 max-w-2xl">
            <h1 className="text-xl font-bold mb-6 text-black dark:text-white">Edit Product</h1>

            <form onSubmit={handleSave} className="space-y-4 mb-10">
              <input required placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />

              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                <input type="number" step="0.01" placeholder="Old price" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm">
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                <input placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
              </div>

              <textarea placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm resize-none" />

              <div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-black dark:text-white mb-2" />
                {uploading && <p className="text-xs text-gray-400">Uploading...</p>}
                {imageUrl && <img src={imageUrl} alt="Product" className="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-800" />}
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm">
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-black dark:text-white pb-2">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-brand" />
                  Featured
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm text-black dark:text-white">
                <input type="checkbox" checked={isFlashSale} onChange={(e) => setIsFlashSale(e.target.checked)} className="accent-brand" />
                Include in Flash Sale
              </label>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
              <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Attributes / Variants</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Add options like Color: Black, Size: Large, Storage: 256GB — each with its own price adjustment and stock.
              </p>

              {attributes.length > 0 && (
                <div className="space-y-2 mb-5">
                  {attributes.map((attr) => (
                    <div key={attr.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-800 rounded-md px-4 py-2 text-sm">
                      <span className="text-black dark:text-white">
                        {attr.name}: {attr.value}
                        {attr.price_modifier !== 0 && (attr.price_modifier > 0 ? ` (+${attr.price_modifier})` : ` (-${Math.abs(attr.price_modifier)})`)}
                        {" • Stock: " + attr.stock}
                      </span>
                      <button onClick={() => handleDeleteAttribute(attr.id)} className="text-red-500 text-xs font-semibold">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-2">
                <input placeholder="Attribute name (e.g. Color)" value={attrName} onChange={(e) => setAttrName(e.target.value)} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm" />
                <input placeholder="Value (e.g. Black)" value={attrValue} onChange={(e) => setAttrValue(e.target.value)} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <input type="number" step="0.01" placeholder="Price adjustment" value={attrPriceMod} onChange={(e) => setAttrPriceMod(e.target.value)} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm" />
                <input type="number" placeholder="Stock" value={attrStock} onChange={(e) => setAttrStock(e.target.value)} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm" />
              </div>
              <button onClick={handleAddAttribute} className="border border-brand text-brand px-4 py-2 rounded-md text-sm font-semibold">
                + Add Attribute
              </button>
            </div>
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

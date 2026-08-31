"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import { supabase } from "@/lib/supabaseClient";
import { updateProduct, uploadProductImage, DbProduct } from "@/lib/supabaseProducts";
import { fetchAttributes, addAttribute, deleteAttribute, Attribute } from "@/lib/supabaseAttributes";
import { fetchCategories, fetchAllSubcategories, SiteCategory, SiteSubcategory } from "@/lib/supabaseCategories";

export default function VendorEditProductPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <VendorGuard>
        {(store) => <EditForm productId={params.id} storeId={store.id} />}
      </VendorGuard>
      <Footer />
    </main>
  );
}

function EditForm({ productId, storeId }: { productId: string; storeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notOwner, setNotOwner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [siteCategories, setSiteCategories] = useState<SiteCategory[]>([]);
  const [siteSubcategories, setSiteSubcategories] = useState<SiteSubcategory[]>([]);
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("0");
  const [imageUrl, setImageUrl] = useState("");

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attrName, setAttrName] = useState("");
  const [attrValue, setAttrValue] = useState("");
  const [attrPriceMod, setAttrPriceMod] = useState("0");
  const [attrStock, setAttrStock] = useState("0");
  const [attrImageUrl, setAttrImageUrl] = useState("");
  const [attrUploading, setAttrUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      fetchCategories().then((r) => setSiteCategories(r.data || []));
      fetchAllSubcategories().then((r) => setSiteSubcategories(r.data || []));

      const { data } = await supabase.from("products").select("*").eq("id", productId).single();
      if (!data || (data as DbProduct).store_id !== storeId) {
        setNotOwner(true);
        setLoading(false);
        return;
      }
      const p = data as DbProduct;
      setName(p.name);
      setPrice(String(p.price));
      setOldPrice(p.old_price ? String(p.old_price) : "");
      setCategory(p.category);
      setSubcategory(p.subcategory || "");
      setDescription(p.description || "");
      setStock(String(p.stock));
      setImageUrl(p.image_url || "");

      const { data: attrs } = await fetchAttributes(productId);
      setAttributes(attrs || []);
      setLoading(false);
    };
    load();
  }, [productId, storeId]);

  const selectedCategoryObj = siteCategories.find((c) => c.name === category);
  const availableSubcategories = siteSubcategories.filter((s) => s.category_id === selectedCategoryObj?.id);

  const handleCategoryChange = (name: string) => {
    setCategory(name);
    setSubcategory("");
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

  const handleAttrImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttrUploading(true);
    const { url } = await uploadProductImage(file);
    setAttrUploading(false);
    if (url) setAttrImageUrl(url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: saveError } = await updateProduct(productId, {
      name,
      price: parseFloat(price),
      old_price: oldPrice ? parseFloat(oldPrice) : null,
      discount_percent: oldPrice ? Math.round(((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice)) * 100) : null,
      category,
      subcategory: subcategory || null,
      description,
      image_url: imageUrl || null,
      stock: parseInt(stock) || 0,
    });

    setSaving(false);

    if (saveError) {
      setError("Could not save changes. Please try again.");
      return;
    }

    router.push("/vendor/products");
  };

  const handleAddAttribute = async () => {
    if (!attrName.trim() || !attrValue.trim()) return;
    const { data } = await addAttribute({
      product_id: productId,
      name: attrName,
      value: attrValue,
      price_modifier: parseFloat(attrPriceMod) || 0,
      stock: parseInt(attrStock) || 0,
      image_url: attrImageUrl || null,
    });
    if (data) {
      setAttributes((prev) => [...prev, data]);
      setAttrName("");
      setAttrValue("");
      setAttrPriceMod("0");
      setAttrStock("0");
      setAttrImageUrl("");
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    await deleteAttribute(id);
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-sm text-gray-400">Loading...</div>;
  }

  if (notOwner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-sm text-red-500">You don't have permission to edit this product.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold mb-6 text-black dark:text-white">Edit Product</h1>

      <form onSubmit={handleSave} className="space-y-4 mb-10">
        <input required placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />

        <div className="grid grid-cols-2 gap-3">
          <input required type="number" step="0.01" placeholder="Price (KSh)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
          <input type="number" step="0.01" placeholder="Old price" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm">
            {siteCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={availableSubcategories.length === 0}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm disabled:opacity-50"
          >
            <option value="">{availableSubcategories.length === 0 ? "No subcategories" : "None"}</option>
            {availableSubcategories.map((sub) => (
              <option key={sub.id} value={sub.name}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div>
          <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
        </div>

        <textarea placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm resize-none" />

        <div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-black dark:text-white mb-2" />
          {uploading && <p className="text-xs text-gray-400">Uploading...</p>}
          {imageUrl && <img src={imageUrl} alt="Product" className="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-800" />}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button type="submit" disabled={saving} className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
        <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Attributes / Variants</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Add options like Color: Blue with its own photo — customers will see this image when they pick that option.
        </p>

        {attributes.length > 0 && (
          <div className="space-y-2 mb-5">
            {attributes.map((attr) => (
              <div key={attr.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-800 rounded-md px-4 py-2 text-sm gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {attr.image_url && <img src={attr.image_url} alt={attr.value} className="w-8 h-8 rounded object-cover shrink-0" />}
                  <span className="text-black dark:text-white truncate">
                    {attr.name}: {attr.value}
                    {attr.price_modifier !== 0 && (attr.price_modifier > 0 ? ` (+${attr.price_modifier})` : ` (-${Math.abs(attr.price_modifier)})`)}
                    {" • Stock: " + attr.stock}
                  </span>
                </div>
                <button onClick={() => handleDeleteAttribute(attr.id)} className="text-red-500 text-xs font-semibold shrink-0">Remove</button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-2">
          <input placeholder="Attribute name (e.g. Color)" value={attrName} onChange={(e) => setAttrName(e.target.value)} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm" />
          <input placeholder="Value (e.g. Blue)" value={attrValue} onChange={(e) => setAttrValue(e.target.value)} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input type="number" step="0.01" placeholder="Price adjustment" value={attrPriceMod} onChange={(e) => setAttrPriceMod(e.target.value)} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm" />
          <input type="number" placeholder="Stock" value={attrStock} onChange={(e) => setAttrStock(e.target.value)} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Image for this option (optional)</label>
          <input type="file" accept="image/*" onChange={handleAttrImageChange} className="text-sm text-black dark:text-white" />
          {attrUploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
          {attrImageUrl && <img src={attrImageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-md mt-2 border border-gray-200 dark:border-gray-800" />}
        </div>
        <button onClick={handleAddAttribute} className="border border-brand text-brand px-4 py-2 rounded-md text-sm font-semibold">
          + Add Attribute
        </button>
      </div>
    </div>
  );
}

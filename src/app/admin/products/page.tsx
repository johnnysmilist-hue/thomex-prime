"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchProducts, addProduct, deleteProduct, uploadProductImage, bulkAddProducts, DbProduct } from "@/lib/supabaseProducts";
import { fetchCategories, fetchAllSubcategories, SiteCategory, SiteSubcategory } from "@/lib/supabaseCategories";

type CsvRow = {
  name: string;
  price: string;
  old_price?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  color?: string;
  description?: string;
  image_url?: string;
  stock?: string;
  featured?: string;
  status?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [siteCategories, setSiteCategories] = useState<SiteCategory[]>([]);
  const [siteSubcategories, setSiteSubcategories] = useState<SiteSubcategory[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("0");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("Published");

  const [imageMode, setImageMode] = useState<"upload" | "link">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvError, setCsvError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await fetchProducts();
    setProducts(data || []);
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
  }, []);

  const selectedCategoryObj = siteCategories.find((c) => c.name === category);
  const availableSubcategories = siteSubcategories.filter((s) => s.category_id === selectedCategoryObj?.id);

  const handleCategoryChange = (name: string) => {
    setCategory(name);
    setSubcategory("");
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setOldPrice("");
    setCategory(siteCategories[0]?.name || "");
    setSubcategory("");
    setBrand("");
    setColor("");
    setDescription("");
    setStock("0");
    setFeatured(false);
    setStatus("Published");
    setImageUrl("");
    setImagePreview("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const { url, error: uploadError } = await uploadProductImage(file);

    setUploading(false);

    if (uploadError || !url) {
      setError("Image upload failed. Please try again.");
      return;
    }

    setImageUrl(url);
    setImagePreview(url);
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
      subcategory: subcategory || null,
      brand: brand || null,
      color: color || null,
      description,
      image_url: imageUrl || null,
      status,
      stock: parseInt(stock) || 0,
      featured,
      is_flash_sale: false,
      store_id: null,
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

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError("");
    setImportResult("");

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.filter((r) => r.name && r.price && r.category);
        if (rows.length === 0) {
          setCsvError("No valid rows found. Make sure your CSV has name, price, and category columns.");
          setCsvRows([]);
          return;
        }
        setCsvRows(rows);
      },
      error: () => {
        setCsvError("Could not read that file. Make sure it's a valid CSV.");
      },
    });
  };

  const handleImport = async () => {
    setImporting(true);
    setCsvError("");

    const toInsert = csvRows.map((row) => {
      const priceNum = parseFloat(row.price);
      const oldPriceNum = row.old_price ? parseFloat(row.old_price) : null;
    return {
        name: row.name,
        price: priceNum,
        old_price: oldPriceNum,
        rating: 0,
        review_count: 0,
        discount_percent: oldPriceNum ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : null,
        category: row.category,
        subcategory: row.subcategory || null,
        brand: row.brand || null,
        color: row.color || null,
        description: row.description || "",
        image_url: row.image_url || null,
        status: row.status === "Draft" ? "Draft" : "Published",
        stock: row.stock ? parseInt(row.stock) || 0 : 0,
        featured: row.featured === "true" || row.featured === "TRUE" || row.featured === "1",
        is_flash_sale: false,
        store_id: null,
      };
    });

    const { error: importError } = await bulkAddProducts(toInsert);

    setImporting(false);

    if (importError) {
      setCsvError("Import failed. Please check your CSV formatting and try again.");
      return;
    }

    setImportResult(csvRows.length + " products imported successfully!");
    setCsvRows([]);
    loadProducts();
  };

  const stats = {
    Total: products.length,
    Published: products.filter((p) => p.status === "Published").length,
    Draft: products.filter((p) => p.status === "Draft").length,
    LowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    OutOfStock: products.filter((p) => p.stock <= 0).length,
  };

  const statCards = [
    { key: "Total", label: "Total Products", bg: "bg-blue-50 dark:bg-blue-500/10", fg: "text-blue-600 dark:text-blue-400" },
    { key: "Published", label: "Published", bg: "bg-green-50 dark:bg-green-500/10", fg: "text-green-600 dark:text-green-400" },
    { key: "Draft", label: "Draft", bg: "bg-gray-100 dark:bg-gray-500/10", fg: "text-gray-500 dark:text-gray-400" },
    { key: "LowStock", label: "Low Stock", bg: "bg-orange-50 dark:bg-orange-500/10", fg: "text-orange-600 dark:text-orange-400" },
    { key: "OutOfStock", label: "Out of Stock", bg: "bg-red-50 dark:bg-red-500/10", fg: "text-red-600 dark:text-red-400" },
  ];

  const cardIcon = (key: string) => {
    const common = { xmlns: "http://www.w3.org/2000/svg", width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (key === "Total") return <svg {...common}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>;
    if (key === "Published") return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
    if (key === "Draft") return <svg {...common}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>;
    if (key === "LowStock") return <svg {...common}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    return <svg {...common}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>;
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />
          <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h1 className="text-xl font-bold text-black dark:text-white">Manage Products</h1>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowCsvImport(!showCsvImport); setShowForm(false); }}
                className="border border-brand text-brand px-4 py-2 rounded-md text-sm font-semibold"
              >
                {showCsvImport ? "Cancel" : "Import CSV"}
              </button>
              <button
                onClick={() => { setShowForm(!showForm); setShowCsvImport(false); }}
                className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold"
              >
                {showForm ? "Cancel" : "+ Add Product"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {statCards.map((card) => (
              <div key={card.key} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className={"w-11 h-11 rounded-xl flex items-center justify-center shrink-0 " + card.bg + " " + card.fg}>
                  {cardIcon(card.key)}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-black dark:text-white leading-tight">{loading ? "..." : stats[card.key as keyof typeof stats]}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {showCsvImport && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6">
              <p className="text-sm font-semibold text-black dark:text-white mb-2">Bulk Import from CSV</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Your CSV needs these columns: <strong>name, price, category</strong> (required), and optionally
                subcategory, old_price, brand, color, description, image_url, stock, featured (true/false), status (Published/Draft).
              </p>
              <input type="file" accept=".csv" onChange={handleCsvFile} className="text-sm text-black dark:text-white mb-4" />

              {csvError && <p className="text-xs text-red-500 mb-3">{csvError}</p>}
              {importResult && <p className="text-xs text-green-600 dark:text-green-400 mb-3">{importResult}</p>}

              {csvRows.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Preview — {csvRows.length} product{csvRows.length !== 1 ? "s" : ""} ready to import:
                  </p>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-md mb-4">
                    {csvRows.map((row, i) => (
                      <div key={i} className="px-3 py-2 text-xs text-black dark:text-white border-b border-gray-100 dark:border-gray-800 last:border-0">
                        {row.name} — KSh {row.price} — {row.category}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
                  >
                    {importing ? "Importing..." : "Import " + csvRows.length + " Products"}
                  </button>
                </div>
              )}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleAdd} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 mb-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Product Name</label>
                <input required placeholder="e.g. Sony WH-1000XM5" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Price (KSh)</label>
                  <input required type="number" step="0.01" placeholder="29900" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Old Price (optional)</label>
                  <input type="number" step="0.01" placeholder="34900" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Category</label>
                  <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm">
                    {siteCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subcategory</label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    disabled={availableSubcategories.length === 0}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm disabled:opacity-50"
                  >
                    <option value="">
                      {availableSubcategories.length === 0 ? "No subcategories" : "None"}
                    </option>
                    {availableSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Stock Quantity</label>
                <input type="number" placeholder="10" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Brand</label>
                  <input placeholder="e.g. Sony, Apple" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Color</label>
                  <input placeholder="e.g. Black" value={color} onChange={(e) => setColor(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea placeholder="Short product description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Product Image</label>
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={() => setImageMode("upload")} className={imageMode === "upload" ? "px-3 py-1.5 rounded-md text-xs font-semibold bg-brand text-white" : "px-3 py-1.5 rounded-md text-xs font-semibold border border-gray-300 dark:border-gray-700 text-black dark:text-white"}>
                    Upload Image
                  </button>
                  <button type="button" onClick={() => setImageMode("link")} className={imageMode === "link" ? "px-3 py-1.5 rounded-md text-xs font-semibold bg-brand text-white" : "px-3 py-1.5 rounded-md text-xs font-semibold border border-gray-300 dark:border-gray-700 text-black dark:text-white"}>
                    Use Image Link
                  </button>
                </div>

                {imageMode === "upload" ? (
                  <div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-black dark:text-white" />
                    {uploading && <p className="text-xs text-gray-400 mt-2">Uploading...</p>}
                  </div>
                ) : (
                  <input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                  />
                )}

                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-md mt-3 border border-gray-200 dark:border-gray-800" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-black dark:text-white pb-2">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-brand" />
                  Featured Product
                </label>
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
            <p className="text-sm text-gray-500 dark:text-gray-400">No products yet. Add your first one above.</p>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded shrink-0 overflow-hidden">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {p.category}{p.subcategory ? " / " + p.subcategory : ""} • KSh {p.price.toFixed(2)} • Stock: {p.stock} • {p.status}
                      {p.featured && " • Featured"}
                    </p>
                  </div>
                  <a href={"/admin/products/" + p.id + "/edit"} className="text-brand text-xs font-semibold shrink-0">
                    Edit
                  </a>
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
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import { fetchProducts, addProduct, deleteProduct, uploadProductImage, bulkAddProducts, DbProduct } from "@/lib/supabaseProducts";
import { categories } from "@/lib/categories";

type CsvRow = {
  name: string;
  price: string;
  old_price?: string;
  category: string;
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

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
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
  }, []);

  const resetForm = () => {
    setName("");
    setPrice("");
    setOldPrice("");
    setCategory(categories[0]);
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
      description,
      image_url: imageUrl || null,
      status,
      stock: parseInt(stock) || 0,
      featured,
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
        description: row.description || "",
        image_url: row.image_url || null,
        status: row.status === "Draft" ? "Draft" : "Published",
        stock: row.stock ? parseInt(row.stock) || 0 : 0,
        featured: row.featured === "true" || row.featured === "TRUE" || row.featured === "1",
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

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
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

          {showCsvImport && (
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-8">
              <p className="text-sm font-semibold text-black dark:text-white mb-2">Bulk Import from CSV</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Your CSV needs these columns: <strong>name, price, category</strong> (required), and optionally
                old_price, description, image_url, stock, featured (true/false), status (Published/Draft).
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
                        {row.name} — ${row.price} — {row.category}
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
            <form onSubmit={handleAdd} className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-8 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Product Name</label>
                <input required placeholder="e.g. Sony WH-1000XM5" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" placeholder="299.00" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Old Price (optional)</label>
                  <input type="number" step="0.01" placeholder="349.00" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm">
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Stock Quantity</label>
                  <input type="number" placeholder="10" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
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
                <div key={p.id} className="flex items-center gap-4 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded shrink-0 overflow-hidden">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {p.category} • ${p.price.toFixed(2)} • Stock: {p.stock} • {p.status}
                      {p.featured && " • Featured"}
                    </p>
                  </div>
                 href={"/admin/products/" + p.id + "/edit"}
                    className="text-brand text-xs font-semibold shrink-0"
                  >
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
      </AdminGuard>
      <Footer />
    </main>
  );
}

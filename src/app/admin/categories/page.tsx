"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import {
  fetchCategories, addCategory, updateCategory, deleteCategory,
  fetchAllSubcategories, addSubcategory, updateSubcategory, deleteSubcategory,
  SiteCategory, SiteSubcategory,
} from "@/lib/supabaseCategories";
import { uploadProductImage } from "@/lib/supabaseProducts";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [subcategories, setSubcategories] = useState<SiteSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingSubId, setUploadingSubId] = useState<string | null>(null);
  const [subInputs, setSubInputs] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data: cats } = await fetchCategories();
    setCategories(cats || []);
    const { data: subs } = await fetchAllSubcategories();
    setSubcategories(subs || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const maxOrder = Math.max(0, ...categories.map((c) => c.sort_order));
    const { data } = await addCategory({ name: newCatName, image_url: null, sort_order: maxOrder + 1 });
    if (data) {
      setCategories((prev) => [...prev, data]);
      setNewCatName("");
    }
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    const { url } = await uploadProductImage(file);
    setUploadingId(null);
    if (url) {
      await updateCategory(id, { image_url: url });
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, image_url: url } : c)));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category and all its subcategories?")) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSubcategories((prev) => prev.filter((s) => s.category_id !== id));
  };

  const handleAddSubcategory = async (categoryId: string) => {
    const name = subInputs[categoryId];
    if (!name || !name.trim()) return;
    const existing = subcategories.filter((s) => s.category_id === categoryId);
    const maxOrder = Math.max(0, ...existing.map((s) => s.sort_order));
    const { data } = await addSubcategory({ category_id: categoryId, name, image_url: null, sort_order: maxOrder + 1 });
    if (data) {
      setSubcategories((prev) => [...prev, data]);
      setSubInputs((prev) => ({ ...prev, [categoryId]: "" }));
    }
  };

  const handleSubcategoryImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSubId(id);
    const { url } = await uploadProductImage(file);
    setUploadingSubId(null);
    if (url) {
      await updateSubcategory(id, { image_url: url });
      setSubcategories((prev) => prev.map((s) => (s.id === id ? { ...s, image_url: url } : s)));
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    await deleteSubcategory(id);
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1">
            <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Categories</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Manage categories, their images, and subcategories shown in the shop and menu.
            </p>

            <div className="flex gap-2 mb-8">
              <input
                placeholder="New category name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
              />
              <button onClick={handleAddCategory} className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold shrink-0">
                + Add Category
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">Loading categories...</p>
            ) : (
              <div className="space-y-6">
                {categories.map((cat) => {
                  const subs = subcategories.filter((s) => s.category_id === cat.id);
                  return (
                    <div key={cat.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden shrink-0 flex items-center justify-center text-gray-400 text-xs">
                          {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" /> : cat.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-black dark:text-white">{cat.name}</p>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(cat.id, e)} className="text-xs text-black dark:text-white mt-1" />
                          {uploadingId === cat.id && <p className="text-xs text-gray-400">Uploading...</p>}
                        </div>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 text-xs font-semibold shrink-0">
                          Delete Category
                        </button>
                      </div>

                      <div className="pl-2">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Subcategories</p>
                        {subs.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {subs.map((sub) => (
                              <div key={sub.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-md px-3 py-2">
                                <div className="w-9 h-9 rounded-md bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0 flex items-center justify-center text-gray-400 text-[10px]">
                                  {sub.image_url ? (
                                    <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
                                  ) : (
                                    sub.name.charAt(0)
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-black dark:text-white truncate">{sub.name}</p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleSubcategoryImageUpload(sub.id, e)}
                                    className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 w-full"
                                  />
                                  {uploadingSubId === sub.id && <p className="text-[10px] text-gray-400">Uploading...</p>}
                                </div>
                                <button onClick={() => handleDeleteSubcategory(sub.id)} className="text-red-500 font-bold text-sm shrink-0">×</button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            placeholder="New subcategory name"
                            value={subInputs[cat.id] || ""}
                            onChange={(e) => setSubInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                            className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-1.5 text-xs"
                          />
                          <button onClick={() => handleAddSubcategory(cat.id)} className="border border-brand text-brand px-3 py-1.5 rounded-md text-xs font-semibold shrink-0">
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

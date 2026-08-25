"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchCategories, fetchAllSubcategories, SiteCategory, SiteSubcategory } from "@/lib/supabaseCategories";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [subcategories, setSubcategories] = useState<SiteSubcategory[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchAllSubcategories()]).then(([catRes, subRes]) => {
      const cats = catRes.data || [];
      setCategories(cats);
      setSubcategories(subRes.data || []);
      if (cats.length > 0) setActiveId(cats[0].id);
      setLoading(false);
    });
  }, []);

  const active = categories.find((c) => c.id === activeId);
  const subcats = subcategories.filter((s) => s.category_id === activeId);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      {loading ? (
        <div className="px-4 py-10 text-center text-sm text-gray-400">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-gray-400">No categories yet.</div>
      ) : (
        <div className="flex">
          <aside className="w-28 sm:w-40 shrink-0 border-r border-gray-100 dark:border-gray-800">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveId(cat.id)}
                className={
                  activeId === cat.id
                    ? "w-full text-left px-3 py-4 text-xs sm:text-sm font-semibold border-l-2 border-brand bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
                    : "w-full text-left px-3 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 border-l-2 border-transparent"
                }
              >
                {cat.name}
              </button>
            ))}
          </aside>

          <div className="flex-1 px-4 py-4">
            <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-black dark:text-white">{active?.name}</p>
                <a href={"/shop?category=" + encodeURIComponent(active?.name || "")} className="text-xs font-semibold text-brand">
                  See All
                </a>
              </div>

              {subcats.length === 0 ? (
                <p className="text-xs text-gray-400">No subcategories yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {subcats.map((sub) => (
                    <a
                      key={sub.id}
                      href={"/shop?category=" + encodeURIComponent(active?.name || "") + "&subcategory=" + encodeURIComponent(sub.name)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-full aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center text-gray-400 text-[10px]">
                        {sub.image_url ? (
                          <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
                        ) : (
                          sub.name.charAt(0)
                        )}
                      </div>
                      <span className="text-[11px] text-center text-black dark:text-white leading-tight">{sub.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}

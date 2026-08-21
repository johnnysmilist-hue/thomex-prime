"use client";

import { useState, useEffect } from "react";
import { fetchCategories, fetchAllSubcategories, SiteCategory, SiteSubcategory } from "@/lib/supabaseCategories";

export default function CategoryMegaMenu() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [subcategories, setSubcategories] = useState<SiteSubcategory[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then((r) => {
      setCategories(r.data || []);
      if (r.data && r.data.length > 0) setActiveCat(r.data[0].id);
    });
    fetchAllSubcategories().then((r) => setSubcategories(r.data || []));
  }, []);

  const activeSubs = subcategories.filter((s) => s.category_id === activeCat);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="bg-white text-brand-dark text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2">
        Categories
      </button>

      {open && categories.length > 0 && (
        <div className="absolute top-full left-0 mt-1 flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl z-50 overflow-hidden">
          <div className="w-56 border-r border-gray-100 dark:border-gray-800 py-2">
            {categories.map((cat) => (
              
                key={cat.id}
                href={"/shop?category=" + encodeURIComponent(cat.name)}
                onMouseEnter={() => setActiveCat(cat.id)}
                className={
                  activeCat === cat.id
                    ? "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand bg-brand/5"
                    : "flex items-center gap-2 px-4 py-2.5 text-sm text-black dark:text-white"
                }
              >
                {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-5 h-5 rounded-full object-cover" />}
                {cat.name}
              </a>
            ))}
          </div>

          <div className="w-[500px] p-5 grid grid-cols-3 gap-4">
            {activeSubs.length === 0 ? (
              <p className="text-sm text-gray-400 col-span-3">No subcategories yet.</p>
            ) : (
              activeSubs.map((sub) => (
                
                  key={sub.id}
                  href={"/shop?category=" + encodeURIComponent(categories.find((c) => c.id === activeCat)?.name || "")}
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-brand"
                >
                  {sub.name}
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

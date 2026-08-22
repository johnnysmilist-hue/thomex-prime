"use client";

import { useState, useEffect } from "react";
import { fetchCategories, fetchAllSubcategories, SiteCategory, SiteSubcategory } from "@/lib/supabaseCategories";

export default function Sidebar() {
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [subcategories, setSubcategories] = useState<SiteSubcategory[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then((r) => setCategories(r.data || []));
    fetchAllSubcategories().then((r) => setSubcategories(r.data || []));
  }, []);

  const hoveredSubs = subcategories.filter((s) => s.category_id === hoveredId);
  const hoveredCategory = categories.find((c) => c.id === hoveredId);

  return (
    <aside className="hidden md:block md:w-56 shrink-0 relative">
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden h-full">
        <a href="/shop" className="block px-4 py-2.5 text-sm font-semibold text-black dark:text-white border-b border-gray-100 dark:border-gray-800 hover:text-brand">
          All Products
        </a>
        <ul className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
          {categories.map((cat) => (
            <li key={cat.id} onMouseEnter={() => setHoveredId(cat.id)} onMouseLeave={() => setHoveredId(null)}>
              
                href={"/shop?category=" + encodeURIComponent(cat.name)}
                className={
                  hoveredId === cat.id
                    ? "flex items-center gap-2 py-2 px-4 text-brand bg-brand/5"
                    : "flex items-center gap-2 py-2 px-4 text-black dark:text-white"
                }
              >
                {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-5 h-5 rounded-full object-cover shrink-0" />}
                {cat.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {hoveredId && hoveredSubs.length > 0 && (
        <div
          onMouseEnter={() => setHoveredId(hoveredId)}
          onMouseLeave={() => setHoveredId(null)}
          className="absolute top-0 left-full ml-2 w-[420px] min-h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-5"
        >
          <p className="text-sm font-bold text-black dark:text-white mb-4">{hoveredCategory?.name}</p>
          <div className="grid grid-cols-2 gap-3">
            {hoveredSubs.map((sub) => (
              
                key={sub.id}
                href={"/shop?category=" + encodeURIComponent(hoveredCategory?.name || "")}
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-brand"
              >
                {sub.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

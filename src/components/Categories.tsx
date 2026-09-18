"use client";

import { useEffect, useState } from "react";
import { fetchCategories, SiteCategory } from "@/lib/supabaseCategories";

const fallbackColors = [
  "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400",
  "bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400",
  "bg-green-50 text-green-500 dark:bg-green-950/40 dark:text-green-400",
  "bg-purple-50 text-purple-500 dark:bg-purple-950/40 dark:text-purple-400",
  "bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400",
  "bg-cyan-50 text-cyan-500 dark:bg-cyan-950/40 dark:text-cyan-400",
  "bg-pink-50 text-pink-500 dark:bg-pink-950/40 dark:text-pink-400",
];

const colorFor = (name: string) => fallbackColors[name.charCodeAt(0) % fallbackColors.length];

export default function Categories() {
  const [categories, setCategories] = useState<SiteCategory[]>([]);

  useEffect(() => {
    fetchCategories().then((r) => setCategories(r.data || []));
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-4 overflow-x-auto sm:grid sm:grid-cols-7 sm:gap-4" style={{ scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={"/shop?category=" + encodeURIComponent(cat.name)}
            className="flex flex-col items-center gap-2 shrink-0 w-16 sm:w-auto group"
          >
            <div
              className={
                "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden border-2 border-transparent group-hover:border-brand group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200 " +
                (cat.image_url ? "bg-gray-100 dark:bg-gray-900" : colorFor(cat.name))
              }
            >
              {cat.image_url ? (
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                cat.name.charAt(0)
              )}
            </div>
            <span className="text-[11px] sm:text-xs text-center text-black dark:text-white leading-tight group-hover:text-brand transition-colors">{cat.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

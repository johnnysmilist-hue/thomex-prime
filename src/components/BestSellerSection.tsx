"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { fetchCategories, SiteCategory } from "@/lib/supabaseCategories";
import type { Product } from "@/lib/supabaseProducts";

export default function BestSellerSection({ products }: { products: Product[] }) {
  const [active, setActive] = useState("Top 30");
  const [categories, setCategories] = useState<SiteCategory[]>([]);

  useEffect(() => {
    fetchCategories().then((r) => setCategories(r.data || []));
  }, []);

  // Only show category pills that actually have products, so a pill never
  // leads to an empty "no products" dead end.
  const categoriesWithProducts = categories.filter((c) => products.some((p) => p.category === c.name));
  const pills = ["Top 30", ...categoriesWithProducts.map((c) => c.name)].slice(0, 7);

  let filtered = products;
  if (active !== "Top 30") {
    filtered = products.filter((p) => p.category === active);
  }

  const sorted = [...filtered].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 30);

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-5 text-black dark:text-white flex items-center gap-2.5">
        <span className="w-1.5 h-6 rounded-full bg-brand inline-block" />
        Best Seller
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
        {pills.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={
              active === cat
                ? "shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold bg-brand text-white shadow-md shadow-brand/30"
                : "shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:border-brand/50 transition-colors"
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

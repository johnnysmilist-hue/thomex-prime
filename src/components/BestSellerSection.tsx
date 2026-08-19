"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/supabaseProducts";

const pillCategories = ["Top 30", "Gaming & VR", "PC & Computers", "Cameras", "Accessories", "Storage, USB"];

export default function BestSellerSection({ products }: { products: Product[] }) {
  const [active, setActive] = useState("Top 30");

  let filtered = products;
  if (active !== "Top 30") {
    filtered = products.filter((p) => p.category === active);
  }

  const sorted = [...filtered].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 30);

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-5 text-black dark:text-white">Best Seller</h2>

      <div className="flex gap-3 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
        {pillCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={
              active === cat
                ? "shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold bg-brand text-white"
                : "shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-300 dark:border-gray-700 text-black dark:text-white"
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

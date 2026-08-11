"use client";

import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").toLowerCase();

  const results = products.filter(
    (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1 text-black dark:text-white">
        Search results for "{searchParams.get("q")}"
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{results.length} products found</p>

      {results.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No products matched your search. Try a different term.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

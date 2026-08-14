"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ProductCard from "@/components/ProductCard";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";

export default function ShopContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetchAllProductsForSite().then(({ products }) => {
      setAllProducts(products);
      setLoading(false);
    });
  }, []);

  let products = allProducts;

  if (minPrice.trim() !== "") {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) products = products.filter((p) => p.price >= min);
  }

  if (maxPrice.trim() !== "") {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) products = products.filter((p) => p.price <= max);
  }

  if (categoryFilter) {
    products = products.filter((p) => p.category === categoryFilter);
  }

  if (sort === "price-low") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    products = [...products].sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-56 shrink-0 space-y-6">
        <Sidebar />
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm font-semibold mb-3 text-black dark:text-white">Price Range</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-2 py-1.5 text-sm"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-2 py-1.5 text-sm"
            />
          </div>
          {(minPrice || maxPrice) && (
            <button
              onClick={() => { setMinPrice(""); setMaxPrice(""); }}
              className="text-xs text-brand font-semibold mt-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="text-xl font-bold text-black dark:text-white">
            {categoryFilter ? categoryFilter : "All Products"}{" "}
            <span className="text-sm font-normal text-gray-400">({products.length})</span>
          </h1>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white text-sm rounded-md px-3 py-2">
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No products found in this range.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

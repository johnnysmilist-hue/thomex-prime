"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";
import { categories } from "@/lib/categories";

const discountOptions = [10, 20, 30, 40, 50];

export default function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialBrand = searchParams.get("brand");
  const initialSubcategory = searchParams.get("subcategory");
  const initialStore = searchParams.get("store");

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(initialSubcategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetchAllProductsForSite().then(({ products }) => {
      setAllProducts(products);
      setLoading(false);
    });
  }, []);

  const brands = Array.from(new Set(allProducts.map((p) => p.brand).filter(Boolean))) as string[];
  const colors = Array.from(new Set(allProducts.map((p) => p.color).filter(Boolean))) as string[];

  let products = allProducts;

  if (selectedCategory) products = products.filter((p) => p.category === selectedCategory);
  if (selectedSubcategory) products = products.filter((p) => p.subcategory === selectedSubcategory);
  if (initialStore) products = products.filter((p) => p.storeId === initialStore);
  if (selectedBrands.length > 0) products = products.filter((p) => p.brand && selectedBrands.includes(p.brand));
  if (selectedColors.length > 0) products = products.filter((p) => p.color && selectedColors.includes(p.color));
  if (minDiscount) products = products.filter((p) => (p.discountPercent || 0) >= minDiscount);

  if (minPrice.trim() !== "") {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) products = products.filter((p) => p.price >= min);
  }
  if (maxPrice.trim() !== "") {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) products = products.filter((p) => p.price <= max);
  }

  if (sort === "price-low") products = [...products].sort((a, b) => a.price - b.price);
  else if (sort === "price-high") products = [...products].sort((a, b) => b.price - a.price);
  else if (sort === "rating") products = [...products].sort((a, b) => b.rating - a.rating);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));
  };

  const clearAll = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedBrands([]);
    setSelectedColors([]);
    setMinDiscount(null);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasFilters = selectedCategory || selectedBrands.length > 0 || selectedColors.length > 0 || minDiscount || minPrice || maxPrice;
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtersPanel = (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-6 bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-black dark:text-white">Filters</p>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-brand font-semibold">Clear all</button>
        )}
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Category</p>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm text-black dark:text-white cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat}
                onChange={() => setSelectedCategory(cat)}
                className="accent-brand"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Brand</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 text-sm text-black dark:text-white cursor-pointer">
                <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="accent-brand" />
                {brand}
              </label>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Color</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {colors.map((color) => (
              <label key={color} className="flex items-center gap-2 text-sm text-black dark:text-white cursor-pointer">
                <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => toggleColor(color)} className="accent-brand" />
                {color}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Price (KSh)</p>
        <div className="flex items-center gap-2">
          <input type="number" min="0" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-2 py-1.5 text-sm" />
          <span className="text-gray-400 text-xs">to</span>
          <input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-2 py-1.5 text-sm" />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Discount</p>
        <div className="space-y-1.5">
          {discountOptions.map((d) => (
            <label key={d} className="flex items-center gap-2 text-sm text-black dark:text-white cursor-pointer">
              <input type="radio" name="discount" checked={minDiscount === d} onChange={() => setMinDiscount(d)} className="accent-brand" />
              {d}% or more
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      {/* Desktop sidebar */}
      <div className="hidden md:block md:w-64 shrink-0">{filtersPanel}</div>

      {/* Mobile filter toggle button */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="md:hidden flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 rounded-md py-2.5 text-sm font-semibold text-black dark:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="9" cy="6" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" />
          <circle cx="7" cy="18" r="1.5" fill="currentColor" />
        </svg>
        Filters
        {hasFilters && <span className="bg-brand text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">•</span>}
      </button>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-950 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-950">
            <p className="font-bold text-black dark:text-white">Filters</p>
            <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="p-4 pb-24">
            <div className="[&>div]:border-0 [&>div]:p-0">{filtersPanel}</div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full bg-brand text-white py-3 rounded-md font-semibold"
            >
              Show {products.length} Results
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="text-xl font-bold text-black dark:text-white">
            {selectedSubcategory || selectedCategory || (selectedBrands.length === 1 ? selectedBrands[0] : "All Products")}{" "}
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
          <p className="text-sm text-gray-500 dark:text-gray-400">No products found matching these filters.</p>
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

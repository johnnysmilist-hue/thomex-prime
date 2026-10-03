"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";
import { fetchCategories, SiteCategory } from "@/lib/supabaseCategories";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const discountOptions = [10, 20, 30, 40, 50];
type MobileSort = "popular" | "latest" | "bestsellers" | "price-low" | "price-high";

export default function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { format } = useCurrency();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const initialCategory = searchParams.get("category");
  const initialBrand = searchParams.get("brand");
  const initialSubcategory = searchParams.get("subcategory");
  const initialStore = searchParams.get("store");

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [siteCategories, setSiteCategories] = useState<SiteCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(initialSubcategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Mobile-only search + sort tabs
  const [mobileQuery, setMobileQuery] = useState("");
  const [mobileSort, setMobileSort] = useState<MobileSort>("popular");
  const [priceMenuOpen, setPriceMenuOpen] = useState(false);

  useEffect(() => {
    fetchAllProductsForSite().then(({ products }) => {
      setAllProducts(products);
      setLoading(false);
    });
    fetchCategories().then((r) => setSiteCategories(r.data || []));
  }, []);

  const subcategoriesForSelected = selectedCategory
    ? (Array.from(
        new Set(
          allProducts.filter((p) => p.category === selectedCategory).map((p) => p.subcategory).filter(Boolean)
        )
      ) as string[])
    : [];

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

  // Mobile search box (separate from the desktop filter panel, matches the mockup's own search field)
  let mobileProducts = products;
  if (mobileQuery.trim() !== "") {
    const q = mobileQuery.trim().toLowerCase();
    mobileProducts = mobileProducts.filter((p) => p.name.toLowerCase().includes(q));
  }

  if (sort === "price-low") products = [...products].sort((a, b) => a.price - b.price);
  else if (sort === "price-high") products = [...products].sort((a, b) => b.price - a.price);
  else if (sort === "rating") products = [...products].sort((a, b) => b.rating - a.rating);

  // "Popular" = most reviewed, "Best Sellers" = highest rated, "Latest" = the
  // order products already come back in (your fetch returns newest first).
  // No real "units sold" data exists, so these are honest proxies, not that.
  if (mobileSort === "popular") mobileProducts = [...mobileProducts].sort((a, b) => b.reviewCount - a.reviewCount);
  else if (mobileSort === "bestsellers") mobileProducts = [...mobileProducts].sort((a, b) => b.rating - a.rating);
  else if (mobileSort === "price-low") mobileProducts = [...mobileProducts].sort((a, b) => a.price - b.price);
  else if (mobileSort === "price-high") mobileProducts = [...mobileProducts].sort((a, b) => b.price - a.price);
  // "latest" needs no re-sort — already newest-first from the fetch.

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));
  };

  const handleSelectCategory = (name: string) => {
    setSelectedCategory((prev) => (prev === name ? null : name));
    setSelectedSubcategory(null);
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
          {siteCategories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm text-black dark:text-white cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.name}
                onChange={() => handleSelectCategory(cat.name)}
                className="accent-brand"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {selectedCategory && subcategoriesForSelected.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Subcategory</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {subcategoriesForSelected.map((sub) => (
              <label key={sub} className="flex items-center gap-2 text-sm text-black dark:text-white cursor-pointer">
                <input
                  type="radio"
                  name="subcategory"
                  checked={selectedSubcategory === sub}
                  onChange={() => setSelectedSubcategory(sub)}
                  className="accent-brand"
                />
                {sub}
              </label>
            ))}
          </div>
        </div>
      )}

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

  const mobileSortTabs: { key: MobileSort; label: string }[] = [
    { key: "popular", label: "Popular" },
    { key: "latest", label: "Latest" },
    { key: "bestsellers", label: "Best Sellers" },
  ];

  return (
    <>
      {/* ---------- Mobile ---------- */}
      <div className="md:hidden">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <button onClick={() => router.back()} aria-label="Back" className="w-9 h-9 flex items-center justify-center text-black dark:text-white shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0 mr-2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full bg-transparent text-sm text-black dark:text-white focus:outline-none"
            />
          </div>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="shrink-0 flex items-center gap-1.5 border border-brand text-brand rounded-xl px-3 py-2.5 text-sm font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18l-7 9v6l-4 2v-8L3 4Z" /></svg>
            Filter
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
          </button>
        </div>

        <div className="px-4 flex items-center gap-5 border-b border-gray-100 dark:border-gray-800 mt-1">
          {mobileSortTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setMobileSort(t.key)}
              className={
                mobileSort === t.key
                  ? "text-sm font-bold text-brand border-b-2 border-brand pb-2.5"
                  : "text-sm font-medium text-gray-500 dark:text-gray-400 pb-2.5"
              }
            >
              {t.label}
            </button>
          ))}
          <div className="relative ml-auto">
            <button
              onClick={() => setPriceMenuOpen((v) => !v)}
              className={
                (mobileSort === "price-low" || mobileSort === "price-high" ? "text-brand" : "text-gray-500 dark:text-gray-400") +
                " text-sm font-medium pb-2.5 flex items-center gap-1"
              }
            >
              Price
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {priceMenuOpen && (
              <div className="absolute right-0 top-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 w-40">
                <button onClick={() => { setMobileSort("price-low"); setPriceMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-xs text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  Price: Low to High
                </button>
                <button onClick={() => { setMobileSort("price-high"); setPriceMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-xs text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                  Price: High to Low
                </button>
              </div>
            )}
          </div>
        </div>

        {siteCategories.length > 0 && (
          <div className="flex gap-5 overflow-x-auto px-4 py-4" style={{ scrollbarWidth: "none" }}>
            {siteCategories.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.name)}
                  className="flex flex-col items-center gap-1.5 shrink-0 w-14"
                >
                  <div className={"w-12 h-12 rounded-full flex items-center justify-center overflow-hidden " + (active ? "ring-2 ring-brand" : "bg-gray-100 dark:bg-gray-900")}>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className={"text-sm font-bold " + (active ? "text-brand" : "text-gray-400")}>{cat.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className={"text-[10px] text-center leading-tight " + (active ? "text-brand font-semibold" : "text-gray-600 dark:text-gray-300")}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="px-4 pb-20">
          {loading ? (
            <p className="text-sm text-gray-400 py-6">Loading products...</p>
          ) : mobileProducts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-6">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {mobileProducts.map((product) => {
                const wishlisted = isWishlisted(product.id);
                return (
                  <div key={product.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <a href={"/product/" + product.id} className="block relative">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></svg>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist({ id: product.id, name: product.name, price: product.price });
                        }}
                        aria-label="Toggle wishlist"
                        className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white dark:bg-gray-950 shadow flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-300">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </button>
                    </a>
                    <div className="p-2.5">
                      <a href={"/product/" + product.id}>
                        <p className="text-xs text-black dark:text-white line-clamp-2 min-h-[2rem]">{product.name}</p>
                      </a>
                      <p className="text-sm font-bold text-black dark:text-white mt-1.5">{format(product.price)}</p>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {product.discountPercent && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-1 rounded">-{product.discountPercent}%</span>
                          )}
                          <span className="text-[10px] text-gray-400 line-through">{format(product.oldPrice)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        <span className="text-[11px] font-semibold text-black dark:text-white">{product.rating.toFixed(1)}</span>
                        <span className="text-[11px] text-gray-400">· {product.reviewCount} reviews</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Desktop (unchanged) ---------- */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
          <div className="hidden md:block md:w-64 shrink-0">{filtersPanel}</div>

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
      </div>

      {/* Mobile filter drawer — shared by both layouts */}
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
    </>
  );
}

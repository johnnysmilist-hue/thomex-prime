"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import FlashSaleTimer from "./FlashSaleTimer";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";
import { fetchSettings } from "@/lib/supabaseSettings";

export default function FlashSale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([fetchAllProductsForSite(), fetchSettings()]).then(([productsRes, settingsRes]) => {
      setProducts(productsRes.products.filter((p) => p.isFlashSale));
      setEndTime(settingsRes.data?.flash_sale_end || null);
      setLoading(false);
    });
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -220 : 220, behavior: "smooth" });
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="bg-red-600 text-white rounded-t-lg px-5 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Flash Sale</h2>
          {endTime && <FlashSaleTimer endTime={endTime} />}
        </div>
        <a href="/shop" className="text-sm font-semibold underline underline-offset-2">
          View All
        </a>
      </div>

      <div className="border border-t-0 border-red-200 dark:border-red-900 bg-white dark:bg-gray-950 rounded-b-lg p-5 relative">
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-black dark:text-white rounded-full w-9 h-9 flex items-center justify-center shadow"
        >
          ‹
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-1 scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[180px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-black dark:text-white rounded-full w-9 h-9 flex items-center justify-center shadow"
        >
          ›
        </button>
      </div>
    </section>
  );
}

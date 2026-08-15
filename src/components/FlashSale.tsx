"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import FlashSaleTimer from "./FlashSaleTimer";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";
import { fetchSettings } from "@/lib/supabaseSettings";

export default function FlashSale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllProductsForSite(), fetchSettings()]).then(([productsRes, settingsRes]) => {
      setProducts(productsRes.products.filter((p) => p.isFlashSale));
      setEndTime(settingsRes.data?.flash_sale_end || null);
      setLoading(false);
    });
  }, []);

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

      <div className="border border-t-0 border-red-200 dark:border-red-900 bg-white dark:bg-gray-950 rounded-b-lg p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

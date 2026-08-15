"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sidebar from "@/components/Sidebar";
import Categories from "@/components/Categories";
import FlashSale from "@/components/FlashSale";
import RecentlyViewed from "@/components/RecentlyViewed";
import ProductRow from "@/components/ProductRow";
import DealOfTheDay from "@/components/DealOfTheDay";
import PromoTiles from "@/components/PromoTiles";
import BrandStrip from "@/components/BrandStrip";
import Footer from "@/components/Footer";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProductsForSite().then(({ products }) => {
      setProducts(products);
      setLoading(false);
    });
  }, []);

  const featured = products.filter((p) => p.featured);
  const byCategory = (cat: string) => products.filter((p) => p.category === cat);

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <Sidebar />
        <Hero />
      </div>
      <Categories />

      <FlashSale />
      <RecentlyViewed />

      {!loading && products.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No products yet — add some from the admin panel to see them here.
          </p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          {featured.length > 0 && <ProductRow title="Featured Products" products={featured} />}

          <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-3">
              <h2 className="text-xl font-bold mb-5 text-black dark:text-white">All Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.slice(0, 6).map((p) => (
                  <div key={p.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-4">
                    <a href={"/product/" + p.id}>
                      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded mb-3 overflow-hidden flex items-center justify-center text-gray-400 text-xs">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : "Image"}
                      </div>
                      <h3 className="text-sm font-medium mb-1 line-clamp-2 text-black dark:text-white">{p.name}</h3>
                    </a>
                    <span className="text-brand font-bold text-sm">${p.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-1">
              <DealOfTheDay />
            </div>
          </section>

          {byCategory("Laptops").length > 0 && <ProductRow title="Laptops" products={byCategory("Laptops")} />}
          {byCategory("Sounds").length > 0 && <ProductRow title="Audio & Headphones" products={byCategory("Sounds")} />}
          {byCategory("Cell Phones").length > 0 && <ProductRow title="Phones" products={byCategory("Cell Phones")} />}
        </>
      )}

      <PromoTiles />
      <BrandStrip />
      <Footer />
    </main>
  );
}

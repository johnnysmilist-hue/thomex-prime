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
import BestSellerSection from "@/components/BestSellerSection";
import BrandStrip from "@/components/BrandStrip";
import FeaturedSellers from "@/components/FeaturedSellers";
import Footer from "@/components/Footer";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";
import TrustStrip from "@/components/TrustStrip";

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
      <TrustStrip />
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
              <ProductRow title="Recommended for You" products={products} />
            </div>
            <div className="md:col-span-1">
              <DealOfTheDay />
            </div>
          </section>

          {byCategory("Laptops").length > 0 && <ProductRow title="Laptops" products={byCategory("Laptops")} />}
          {byCategory("Sounds").length > 0 && <ProductRow title="Audio & Headphones" products={byCategory("Sounds")} />}
          {byCategory("Cell Phones").length > 0 && <ProductRow title="Phones" products={byCategory("Cell Phones")} />}

          <BestSellerSection products={products} />
        </>
      )}

      <PromoTiles />
      <BrandStrip />
      <FeaturedSellers />
      <Footer />
    </main>
  );
}

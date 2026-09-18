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
import BestSellerSection from "@/components/BestSellerSection";
import BrandStrip from "@/components/BrandStrip";
import FeaturedSellers from "@/components/FeaturedSellers";
import Footer from "@/components/Footer";
import TrustStrip from "@/components/TrustStrip";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";
import { fetchSettings } from "@/lib/supabaseSettings";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashSaleEnd, setFlashSaleEnd] = useState<string | null>(null);

  useEffect(() => {
    fetchAllProductsForSite().then(({ products }) => {
      setProducts(products);
      setLoading(false);
    });
    fetchSettings().then((r) => setFlashSaleEnd(r.data?.flash_sale_end || null));
  }, []);

  const featured = products.filter((p) => p.featured);
  const byCategory = (cat: string) => products.filter((p) => p.category === cat);

  // Deal of the Day: the product with the biggest real discount. Falls back
  // to a featured product, then any product, so the section still has
  // something sensible to show even with no discounts configured yet.
  const discountOf = (p: Product) => (p.oldPrice && p.oldPrice > p.price ? p.oldPrice - p.price : 0);
  const dealProduct =
    [...products].sort((a, b) => discountOf(b) - discountOf(a)).find((p) => discountOf(p) > 0) ||
    featured[0] ||
    products[0] ||
    null;

  return (
    <main className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <Sidebar />
        <Hero />
      </div>
      <Categories />
      <TrustStrip />
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
          {featured.length > 0 && <ProductRow title="Featured Products" products={featured} viewAllHref="/shop" />}

          <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-3">
              <ProductRow title="Recommended for You" products={products} viewAllHref="/shop" />
            </div>
            <div className="md:col-span-1">
              <DealOfTheDay product={dealProduct} endTime={flashSaleEnd} />
            </div>
          </section>

          {byCategory("Laptops").length > 0 && <ProductRow title="Laptops" products={byCategory("Laptops")} viewAllHref={"/shop?category=" + encodeURIComponent("Laptops")} />}
          {byCategory("Sounds").length > 0 && <ProductRow title="Audio & Headphones" products={byCategory("Sounds")} viewAllHref={"/shop?category=" + encodeURIComponent("Sounds")} />}
          {byCategory("Cell Phones").length > 0 && <ProductRow title="Phones" products={byCategory("Cell Phones")} viewAllHref={"/shop?category=" + encodeURIComponent("Cell Phones")} />}

          <BestSellerSection products={products} />

          {byCategory("Gaming & VR").length > 0 && <ProductRow title="Gaming Zone" products={byCategory("Gaming & VR")} viewAllHref={"/shop?category=" + encodeURIComponent("Gaming & VR")} />}
          {byCategory("Smart Home").length > 0 && <ProductRow title="Smart Home" products={byCategory("Smart Home")} viewAllHref={"/shop?category=" + encodeURIComponent("Smart Home")} />}
          <ProductRow title="New Arrivals" products={products.slice(0, 12)} viewAllHref="/shop" />
        </>
      )}

      <BrandStrip />
      <FeaturedSellers />
      <Footer />
    </main>
  );
}

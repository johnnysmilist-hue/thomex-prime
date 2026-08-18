"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import TrustBadges from "@/components/TrustBadges";
import ProductTabs from "@/components/ProductTabs";
import RelatedProducts from "@/components/RelatedProducts";
import { fetchProductById, Product } from "@/lib/supabaseProducts";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [variantImage, setVariantImage] = useState<string | undefined>(undefined);
  const { addViewed } = useRecentlyViewed();

  useEffect(() => {
    fetchProductById(params.id).then((r) => {
      setProduct(r.product);
      setLoading(false);
      if (r.product) {
        addViewed(r.product.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center text-sm text-gray-400">Loading...</div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Product not found</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            This product may have been removed or the link is incorrect.
          </p>
          <a href="/shop" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
            Browse Shop
          </a>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Home &gt; Shop &gt; {product.category} &gt; {product.name}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <ProductGallery productId={product.id} imageUrl={product.imageUrl} overrideUrl={variantImage} />
          <div>
            <ProductInfo product={product} onImageChange={setVariantImage} />
            <TrustBadges />
          </div>
        </div>
        <ProductTabs productId={product.id} description={product.description} />
        <RelatedProducts currentId={product.id} category={product.category} />
      </div>
      <Footer />
    </main>
  );
}

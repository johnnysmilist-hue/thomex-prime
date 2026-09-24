"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import TrustBadges from "@/components/TrustBadges";
import ProductTabs from "@/components/ProductTabs";
import RelatedProducts from "@/components/RelatedProducts";
import WhyThisProduct from "@/components/WhyThisProduct";
import ProductFaqAccordion from "@/components/ProductFaqAccordion";
import { fetchProductById, Product } from "@/lib/supabaseProducts";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [variantImage, setVariantImage] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<"description" | "reviews">("description");
  const [descExpanded, setDescExpanded] = useState(false);
  const { addViewed } = useRecentlyViewed();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { format } = useCurrency();

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

  const wishlisted = isWishlisted(product.id);
  const outOfStock = product.stock !== undefined && product.stock <= 0;
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, price: product.price, imageUrl: variantImage || product.imageUrl });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* ---------- Mobile ---------- */}
      <div className="md:hidden pb-32">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-black dark:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <p className="text-base font-bold text-black dark:text-white">Details</p>
          <button
            onClick={() => toggleWishlist({ id: product.id, name: product.name, price: product.price })}
            aria-label="Toggle wishlist"
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>

        <div className="px-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 flex items-center justify-center h-64 overflow-hidden">
            {(variantImage || product.imageUrl) ? (
              <img src={variantImage || product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
              </svg>
            )}
          </div>
        </div>

        <div className="px-4 mt-5 flex items-center justify-between">
          <p className="text-xl font-bold text-black dark:text-white">{product.name}</p>
          <div className="flex items-center gap-1 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span className="text-sm font-bold text-black dark:text-white">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>
        </div>

        <div className="px-4 mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-brand">{format(product.price)}</span>
          {product.oldPrice && <span className="text-sm text-gray-400 line-through">{format(product.oldPrice)}</span>}
          {discountPercent && discountPercent > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{discountPercent}%</span>
          )}
        </div>

        {outOfStock ? (
          <p className="px-4 mt-2 text-xs text-red-500 font-bold">Out of Stock</p>
        ) : product.stock !== undefined && product.stock <= 5 ? (
          <p className="px-4 mt-2 text-xs text-orange-500 font-bold">Only {product.stock} left in stock!</p>
        ) : null}

        <div className="px-4 mt-5 flex gap-2">
          <button
            onClick={() => setTab("description")}
            className={
              tab === "description"
                ? "flex-1 bg-brand text-white text-sm font-semibold py-2.5 rounded-full"
                : "flex-1 border border-gray-200 dark:border-gray-700 text-black dark:text-white text-sm font-semibold py-2.5 rounded-full"
            }
          >
            Description
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={
              tab === "reviews"
                ? "flex-1 bg-brand text-white text-sm font-semibold py-2.5 rounded-full"
                : "flex-1 border border-gray-200 dark:border-gray-700 text-black dark:text-white text-sm font-semibold py-2.5 rounded-full"
            }
          >
            Reviews
          </button>
        </div>

        <div className="px-4 mt-4">
          {tab === "description" ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {product.description ? (
                <>
                  {descExpanded ? product.description : product.description.slice(0, 120) + (product.description.length > 120 ? "..." : "")}
                  {product.description.length > 120 && (
                    <button onClick={() => setDescExpanded((v) => !v)} className="text-brand font-semibold ml-1">
                      {descExpanded ? "Show Less" : "Read More"}
                    </button>
                  )}
                </>
              ) : (
                "No description available for this product yet."
              )}
            </p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-black dark:text-white">{product.rating.toFixed(1)}</p>
                <div className="flex gap-0.5 justify-center my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={i < Math.round(product.rating) ? "#f59e0b" : "#e5e7eb"} stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400">{product.reviewCount} reviews</p>
              </div>
              <p className="text-xs text-gray-400 flex-1">
                Full written reviews are further down the page — this tab shows the quick rating snapshot.
              </p>
            </div>
          )}
        </div>

        {/* Fixed buy bar sits above the site's bottom tab nav */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 z-30">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label="Add to cart"
            className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-black dark:text-white shrink-0 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="flex-1 bg-black dark:bg-brand text-white font-semibold py-3.5 rounded-xl disabled:opacity-50"
          >
            {outOfStock ? "Out of Stock" : "Buy Now"}
          </button>
        </div>
      </div>

      {/* ---------- Desktop (unchanged) ---------- */}
      <div className="hidden md:block">
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
          <WhyThisProduct productId={product.id} productName={product.name} />
          <ProductTabs productId={product.id} description={product.description} />
          <ProductFaqAccordion productId={product.id} />
          <RelatedProducts currentId={product.id} category={product.category} />
        </div>
        <Footer />
      </div>

      {/* Related products still show below the fixed buy bar on mobile */}
      <div className="md:hidden px-4">
        <RelatedProducts currentId={product.id} category={product.category} />
      </div>
      <div className="md:hidden">
        <Footer />
      </div>
    </main>
  );
}

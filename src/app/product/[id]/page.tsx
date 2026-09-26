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
import SoldBy from "@/components/SoldBy";
import { fetchProductById, Product } from "@/lib/supabaseProducts";
import { fetchProductImages, ProductImage } from "@/lib/supabaseProductImages";
import { fetchAttributes, Attribute } from "@/lib/supabaseAttributes";
import { getColorHex } from "@/lib/colorMap";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";

type MediaItem = { url: string; type: string };

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

  // Real multi-image gallery (same source ProductGallery uses)
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaIndex, setMediaIndex] = useState(0);

  // Real size/color/other attributes (same source ProductInfo uses)
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selected, setSelected] = useState<Record<string, Attribute>>({});
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetchProductById(params.id).then((r) => {
      setProduct(r.product);
      setLoading(false);
      if (r.product) addViewed(r.product.id);
    });
    fetchProductImages(params.id).then((r) => {
      const extra = ((r.data as ProductImage[]) || []).map((m) => ({ url: m.image_url, type: m.media_type || "image" }));
      setMedia(extra);
    });
    fetchAttributes(params.id).then((r) => setAttributes(r.data || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    const withImage = Object.values(selected).find((a) => a.image_url);
    setVariantImage(withImage?.image_url || undefined);
  }, [selected]);

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
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const allMedia: MediaItem[] = [
    ...(product.imageUrl ? [{ url: product.imageUrl, type: "image" }] : []),
    ...media,
  ];
  const activeUrl = variantImage || allMedia[mediaIndex]?.url || product.imageUrl;
  const activeItem = allMedia.find((m) => m.url === activeUrl) || allMedia[0];

  const goPrev = () => setMediaIndex((i) => (i - 1 + allMedia.length) % allMedia.length);
  const goNext = () => setMediaIndex((i) => (i + 1) % allMedia.length);

  const grouped: Record<string, Attribute[]> = {};
  attributes.forEach((attr) => {
    if (!grouped[attr.name]) grouped[attr.name] = [];
    grouped[attr.name].push(attr);
  });

  const priceAdjustment = Object.values(selected).reduce((sum, a) => sum + a.price_modifier, 0);
  const finalPrice = product.price + priceAdjustment;
  const discountPercent =
    product.oldPrice && product.oldPrice > finalPrice
      ? Math.round(((product.oldPrice - finalPrice) / product.oldPrice) * 100)
      : null;

  const selectAttribute = (attr: Attribute) => {
    setSelected((prev) => ({ ...prev, [attr.name]: attr }));
    const idx = allMedia.findIndex((m) => m.url === attr.image_url);
    if (idx >= 0) setMediaIndex(idx);
  };

  const buildCartName = () => {
    const parts = Object.values(selected).map((a) => a.value);
    return parts.length > 0 ? product.name + " (" + parts.join(", ") + ")" : product.name;
  };

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: buildCartName(), price: finalPrice, imageUrl: activeUrl }, qty);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* ---------- Mobile ---------- */}
      <div className="md:hidden pb-32">
        <div className="relative">
          <div className="bg-gray-50 dark:bg-gray-900 h-72 flex items-center justify-center overflow-hidden">
            {activeItem ? (
              activeItem.type === "video" ? (
                <video src={activeItem.url} controls playsInline className="w-full h-full object-contain bg-black" />
              ) : (
                <img src={activeItem.url} alt={product.name} className="max-h-full max-w-full object-contain" />
              )
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
              </svg>
            )}
          </div>

          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-950/90 backdrop-blur flex items-center justify-center text-black dark:text-white shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <button
            onClick={() => toggleWishlist({ id: product.id, name: product.name, price: product.price })}
            aria-label="Toggle wishlist"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-950/90 backdrop-blur flex items-center justify-center shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>

          {allMedia.length > 1 && !variantImage && (
            <>
              <button onClick={goPrev} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-950/90 flex items-center justify-center shadow text-black dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button onClick={goNext} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-950/90 flex items-center justify-center shadow text-black dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                {mediaIndex + 1}/{allMedia.length}
              </span>
            </>
          )}
        </div>

        <div className="px-4 mt-4">
          <SoldBy storeId={product.storeId} />

          <div className="flex items-start justify-between gap-3 mt-1">
            <p className="text-lg font-bold text-black dark:text-white">{product.name}</p>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span className="text-sm font-bold text-black dark:text-white">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-black dark:text-white">{format(finalPrice)}</span>
            {product.oldPrice && product.oldPrice > finalPrice && (
              <span className="text-sm text-gray-400 line-through">{format(product.oldPrice)}</span>
            )}
            {discountPercent && discountPercent > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{discountPercent}% Off</span>
            )}
          </div>

          {outOfStock ? (
            <p className="mt-2 text-xs text-red-500 font-bold">Out of Stock</p>
          ) : lowStock ? (
            <p className="mt-2 text-xs text-orange-500 font-bold">Only {product.stock} left in stock!</p>
          ) : null}

          {Object.entries(grouped).map(([attrName, options]) => {
            const isColorGroup = attrName.trim().toLowerCase() === "color";
            return (
              <div key={attrName} className="mt-4">
                <p className="text-sm font-semibold text-black dark:text-white mb-2">
                  {attrName}
                  {selected[attrName] && <span className="font-normal text-gray-500 dark:text-gray-400">: {selected[attrName].value}</span>}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {options.map((opt) => {
                    const isSelected = selected[attrName]?.id === opt.id;
                    if (isColorGroup) {
                      const hex = getColorHex(opt.value);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => selectAttribute(opt)}
                          title={opt.value}
                          aria-label={opt.value}
                          style={hex ? { backgroundColor: hex } : undefined}
                          className={
                            (isSelected ? "w-8 h-8 rounded-full ring-2 ring-offset-2 ring-brand dark:ring-offset-gray-950" : "w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600") +
                            (!hex ? " bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[9px] text-gray-500" : "")
                          }
                        >
                          {!hex && opt.value.charAt(0).toUpperCase()}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectAttribute(opt)}
                        className={
                          isSelected
                            ? "min-w-[36px] px-2 py-1.5 rounded-lg border-2 border-brand text-sm font-semibold text-black dark:text-white"
                            : "min-w-[36px] px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-black dark:text-white"
                        }
                      >
                        {opt.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between mt-5">
            <p className="text-sm font-bold text-black dark:text-white">Description</p>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-7 h-7 flex items-center justify-center text-black dark:text-white">−</button>
              <span className="px-2 text-sm text-black dark:text-white">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-7 h-7 flex items-center justify-center text-black dark:text-white">+</button>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
            {product.description ? (
              <>
                {descExpanded ? product.description : product.description.slice(0, 100) + (product.description.length > 100 ? "..." : "")}
                {product.description.length > 100 && (
                  <button onClick={() => setDescExpanded((v) => !v)} className="text-brand font-semibold ml-1">
                    {descExpanded ? "Show Less" : "Read more"}
                  </button>
                )}
              </>
            ) : (
              "No description available for this product yet."
            )}
          </p>
        </div>

        <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex gap-3 z-30">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex-1 border border-black dark:border-white text-black dark:text-white font-semibold py-3 rounded-xl disabled:opacity-50"
          >
            Add to cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="flex-1 bg-black dark:bg-brand text-white font-semibold py-3 rounded-xl disabled:opacity-50"
          >
            {outOfStock ? "Out of Stock" : "Buy now"}
          </button>
        </div>

        <div className="px-4 mt-2">
          <RelatedProducts currentId={product.id} category={product.category} />
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

      <div className="md:hidden">
        <Footer />
      </div>
    </main>
  );
}

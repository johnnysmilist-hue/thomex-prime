"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/products";

const colors = ["#1e3a8a", "#f9a8d4", "#bbf7d0", "#374151"];

export default function ProductInfo({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(0);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, price: product.price }, qty);
  };

  const handleBuyNow = () => {
    addToCart({ id: product.id, name: product.name, price: product.price }, qty);
    router.push("/checkout");
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
        <button
          onClick={() => toggleWishlist({ id: product.id, name: product.name, price: product.price })}
          aria-label="Toggle wishlist"
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-300">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">{product.name}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{product.description}</p>

      <div className="flex items-center gap-1 text-sm text-yellow-500 mb-4">
        {"★".repeat(Math.round(product.rating))}
        {"☆".repeat(5 - Math.round(product.rating))}
        <span className="text-gray-400 ml-1">({product.reviewCount} Reviews)</span>
      </div>

      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl font-bold text-black dark:text-white">${product.price.toFixed(2)}</span>
        {product.oldPrice && (
          <span className="text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
        )}
      </div>
      {product.discountPercent && (
        <p className="text-xs text-red-500 mb-5">Save {product.discountPercent}% for a limited time</p>
      )}

      <p className="text-sm font-semibold mb-2 text-black dark:text-white">Pick a Color</p>
      <div className="flex gap-3 mb-5">
        {colors.map((c, i) => (
          <button
            key={c}
            onClick={() => setColor(i)}
            style={{ backgroundColor: c }}
            className={
              i === color
                ? "w-7 h-7 rounded-full border-2 border-brand"
                : "w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600"
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1 text-lg text-black dark:text-white">-</button>
          <span className="px-4 text-black dark:text-white">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-3 py-1 text-lg text-black dark:text-white">+</button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-brand text-white py-3 rounded-md font-semibold hover:bg-brand-dark transition-colors"
        >
          Buy Now
        </button>
        <button
          onClick={handleAddToCart}
          className="flex-1 border border-brand text-brand py-3 rounded-md font-semibold hover:bg-brand/5 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

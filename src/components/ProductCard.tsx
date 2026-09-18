"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  discountPercent?: number;
  imageUrl?: string;
  stock?: number;
};

const LOW_STOCK_THRESHOLD = 5;

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { format } = useCurrency();
  const wishlisted = isWishlisted(product.id);
  const outOfStock = product.stock !== undefined && product.stock <= 0;
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <div className="h-full flex flex-col border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-2.5 sm:p-4 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
      {product.discountPercent && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          -{product.discountPercent}%
        </span>
      )}

      <button
        onClick={() =>
          toggleWishlist({ id: product.id, name: product.name, price: product.price })
        }
        aria-label="Toggle wishlist"
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center z-10 hover:scale-110 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-300">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

      <Link href={"/product/" + product.id}>
        <div className="h-24 sm:h-32 bg-gray-100 dark:bg-gray-800 rounded mb-2 sm:mb-3 flex items-center justify-center text-gray-400 overflow-hidden group">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
            </svg>
          )}
        </div>
        <h3 className="text-xs sm:text-sm font-medium mb-1 line-clamp-2 text-black dark:text-white min-h-[2rem] sm:min-h-[2.5rem]">{product.name}</h3>
      </Link>

      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-yellow-500 mb-1.5 sm:mb-2">
        {"★".repeat(Math.round(product.rating))}
        {"☆".repeat(5 - Math.round(product.rating))}
        <span className="text-gray-400 ml-1">({product.reviewCount})</span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1 min-w-0">
       <span className="text-brand font-bold text-xs sm:text-sm truncate max-w-full">{format(product.price)}</span>
        {product.oldPrice && (
          <span className="text-gray-400 text-[10px] line-through truncate max-w-full">{format(product.oldPrice)}</span>
        )}
      </div>

      {outOfStock ? (
        <p className="text-[10px] text-red-500 font-bold mb-2">Out of Stock</p>
      ) : lowStock ? (
        <p className="text-[10px] text-orange-500 font-bold mb-2">Only {product.stock} left in stock!</p>
      ) : (
        <div className="mb-2" />
      )}

       <button
        onClick={() =>
          addToCart({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl })
        }
        disabled={outOfStock}
        className="mt-auto w-full bg-black dark:bg-brand text-white text-xs sm:text-sm py-1.5 sm:py-2 rounded-full hover:bg-brand dark:hover:bg-brand-light transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:hover:bg-gray-300 dark:disabled:hover:bg-gray-700"
      >
        {outOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}

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

export default function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { format } = useCurrency();
  const wishlisted = isWishlisted(product.id);
  const outOfStock = product.stock !== undefined && product.stock <= 0;
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <div className={"h-full flex flex-col border border-transparent bg-white dark:bg-gray-900 rounded-lg hover:shadow-md transition-shadow relative overflow-hidden " + (compact ? "p-2" : "p-2.5 sm:p-4")}>
      {product.discountPercent && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
          -{product.discountPercent}%
        </span>
      )}

      <button
        onClick={() =>
          toggleWishlist({ id: product.id, name: product.name, price: product.price })
        }
        aria-label="Toggle wishlist"
        className={"absolute top-2 right-2 rounded-full bg-white dark:bg-gray-800 shadow flex items-center justify-center z-10 " + (compact ? "w-6 h-6" : "w-7 h-7")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={compact ? "12" : "14"} height={compact ? "12" : "14"} viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-300">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

      <Link href={"/product/" + product.id}>
        <div className={"bg-gray-100 dark:bg-gray-800 rounded mb-2 flex items-center justify-center text-gray-400 text-xs overflow-hidden " + (compact ? "h-16 sm:h-20" : "h-24 sm:h-32 sm:mb-3")}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            "Image"
          )}
        </div>
        <h3 className={"font-medium mb-1 line-clamp-2 text-black dark:text-white " + (compact ? "text-[11px] min-h-[1.6rem]" : "text-xs sm:text-sm min-h-[2rem] sm:min-h-[2.5rem]")}>{product.name}</h3>
      </Link>

      {!compact && (
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-yellow-500 mb-1.5 sm:mb-2">
          {"★".repeat(Math.round(product.rating))}
          {"☆".repeat(5 - Math.round(product.rating))}
          <span className="text-gray-400 ml-1">({product.reviewCount})</span>
        </div>
      )}

      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 mb-1 min-w-0">
        <span className={"text-brand font-bold truncate max-w-full " + (compact ? "text-xs" : "text-xs sm:text-sm")}>{format(product.price)}</span>
        {product.oldPrice && !compact && (
          <span className="text-gray-400 text-[10px] line-through truncate max-w-full">{format(product.oldPrice)}</span>
        )}
      </div>

      {!compact && (outOfStock ? (
        <p className="text-[10px] text-red-500 font-bold mb-2">Out of Stock</p>
      ) : lowStock ? (
        <p className="text-[10px] text-orange-500 font-bold mb-2">Only {product.stock} left in stock!</p>
      ) : (
        <div className="mb-2" />
      ))}

      <button
        onClick={() =>
          addToCart({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl })
        }
        disabled={outOfStock}
        className={"mt-auto w-full bg-black dark:bg-brand text-white rounded-full hover:bg-brand transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:hover:bg-gray-300 dark:disabled:hover:bg-gray-700 " + (compact ? "text-[11px] py-1" : "text-xs sm:text-sm py-1.5 sm:py-2")}
      >
        {outOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}

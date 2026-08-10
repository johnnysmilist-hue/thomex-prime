"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  discountPercent?: number;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-4 hover:shadow-md transition-shadow relative">
      {product.discountPercent && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          -{product.discountPercent}%
        </span>
      )}
      <Link href={"/product/" + product.id}>
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded mb-3 flex items-center justify-center text-gray-400 text-xs">
          Image
        </div>
        <h3 className="text-sm font-medium mb-1 line-clamp-2 text-black dark:text-white">{product.name}</h3>
      </Link>
      <div className="flex items-center gap-1 text-xs text-yellow-500 mb-2">
        {"★".repeat(Math.round(product.rating))}
        {"☆".repeat(5 - Math.round(product.rating))}
        <span className="text-gray-400 ml-1">({product.reviewCount})</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-brand font-bold">${product.price.toFixed(2)}</span>
        {product.oldPrice && (
          <span className="text-gray-400 text-xs line-through">${product.oldPrice.toFixed(2)}</span>
        )}
      </div>
      <button
        onClick={() =>
          addToCart({ id: product.id, name: product.name, price: product.price })
        }
        className="w-full bg-black dark:bg-brand text-white text-sm py-2 rounded-full hover:bg-brand transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
}

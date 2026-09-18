"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import FlashSaleTimer from "./FlashSaleTimer";
import { Product } from "@/lib/supabaseProducts";

export default function DealOfTheDay({ product, endTime }: { product: Product | null; endTime: string | null }) {
  const { addToCart } = useCart();
  const { format } = useCurrency();

  if (!product) return null;

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-5">
      <h3 className="font-bold mb-3 text-black dark:text-white">Deal of the Day</h3>

      {endTime && (
        <div className="mb-4 bg-gray-900 dark:bg-black rounded-lg px-3 py-2 inline-block">
          <FlashSaleTimer endTime={endTime} />
        </div>
      )}

      <Link href={"/product/" + product.id}>
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded mb-3 flex items-center justify-center text-gray-400 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
            </svg>
          )}
        </div>
        <h4 className="text-sm font-medium mb-1 text-black dark:text-white line-clamp-1">{product.name}</h4>
      </Link>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-brand font-bold">{format(product.price)}</span>
        {product.oldPrice && <span className="text-gray-400 text-xs line-through">{format(product.oldPrice)}</span>}
        {discountPercent && discountPercent > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">{discountPercent}% OFF</span>
        )}
      </div>

      <button
        onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl })}
        className="w-full bg-black dark:bg-brand text-white text-sm py-2 rounded-full hover:bg-brand dark:hover:bg-brand-light transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
}

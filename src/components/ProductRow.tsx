"use client";

import { useRef } from "react";
import ProductCard from "./ProductCard";

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  discountPercent?: number;
};

export default function ProductRow({ title, products }: { title: string; products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 220;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 relative">
      <h2 className="text-xl font-bold mb-5 text-black dark:text-white">{title}</h2>

      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-black dark:text-white rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        ‹
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[180px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-black dark:text-white rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        ›
      </button>
    </section>
  );
}

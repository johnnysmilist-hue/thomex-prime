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

export default function ProductRow({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 220;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const showArrows = products.length > 4;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 relative">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2.5">
          <span className="w-1.5 h-5 rounded-full bg-brand inline-block" />
          {title}
        </h2>
        {viewAllHref && (
          <a href={viewAllHref} className="text-sm font-semibold text-brand hover:underline shrink-0">
            View All →
          </a>
        )}
      </div>

      <div className="relative">
        {showArrows && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-black dark:text-white rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            ‹
          </button>
        )}

        {/* Edge fade hints that the row scrolls */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10" />

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

        {showArrows && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-black dark:text-white rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            ›
          </button>
        )}
      </div>
    </section>
  );
}

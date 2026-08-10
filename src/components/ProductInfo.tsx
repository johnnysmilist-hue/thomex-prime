"use client";

import { useState } from "react";

const colors = ["#1e3a8a", "#f9a8d4", "#bbf7d0", "#374151"];

export default function ProductInfo() {
  const [qty, setQty] = useState(2);
  const [color, setColor] = useState(0);

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Headphones</p>
      <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">AirPods-Max</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Wireless over-ear headphones with active noise cancellation and spatial audio.
      </p>

      <div className="flex items-center gap-1 text-sm text-yellow-500 mb-4">
        ★★★★☆
        <span className="text-gray-400 ml-1">(258 Reviews)</span>
      </div>

      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl font-bold text-black dark:text-white">$49.00</span>
        <span className="text-gray-400 line-through">$69.00</span>
      </div>
      <p className="text-xs text-red-500 mb-5">Discount Only For This Weekend</p>

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
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1 text-lg">-</button>
          <span className="px-4 text-black dark:text-white">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-3 py-1 text-lg">+</button>
        </div>
        <span className="text-xs text-red-500">Only 10 Items Left, Hurry up!</span>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-brand text-white py-3 rounded-md font-semibold hover:bg-brand-dark transition-colors">
          Buy Now
        </button>
        <button className="flex-1 border border-brand text-brand py-3 rounded-md font-semibold hover:bg-brand/5 transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

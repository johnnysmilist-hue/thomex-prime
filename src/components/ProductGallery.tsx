"use client";

import { useState } from "react";

const thumbs = ["black", "green", "blue", "pink"];

export default function ProductGallery() {
  const [active, setActive] = useState(2);

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg h-80 flex items-center justify-center text-gray-400 text-sm mb-4">
        Main product image ({thumbs[active]})
      </div>
      <div className="flex gap-3">
        {thumbs.map((color, i) => (
          <button
            key={color}
            onClick={() => setActive(i)}
            className={
              i === active
                ? "w-16 h-16 rounded-md border-2 border-brand bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-500"
                : "w-16 h-16 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] text-gray-500"
            }
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
}

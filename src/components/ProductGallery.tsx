"use client";

import { useState, useEffect } from "react";
import { fetchProductImages } from "@/lib/supabaseProductImages";

export default function ProductGallery({
  productId,
  imageUrl,
  overrideUrl,
}: {
  productId: string;
  imageUrl?: string;
  overrideUrl?: string;
}) {
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchProductImages(productId).then((r) => {
      setExtraImages((r.data || []).map((img) => img.image_url));
    });
  }, [productId]);

  const allImages = [imageUrl, ...extraImages].filter(Boolean) as string[];
  const displayUrl = overrideUrl || selected || imageUrl;

  useEffect(() => {
    if (overrideUrl) setSelected(undefined);
  }, [overrideUrl]);

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg h-80 flex items-center justify-center text-gray-400 text-sm mb-4 overflow-hidden">
        {displayUrl ? (
          <img src={displayUrl} alt="Product" className="w-full h-full object-contain" />
        ) : (
          "No image yet"
        )}
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-3">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(img)}
              className={
                (overrideUrl ? false : displayUrl === img)
                  ? "w-16 h-16 rounded-md border-2 border-brand overflow-hidden shrink-0"
                  : "w-16 h-16 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0"
              }
            >
              <img src={img} alt={"View " + (i + 1)} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

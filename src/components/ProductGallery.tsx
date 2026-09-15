"use client";

import { useState, useEffect } from "react";
import { fetchProductImages, ProductImage } from "@/lib/supabaseProductImages";

type MediaItem = { url: string; type: string };

export default function ProductGallery({
  productId,
  imageUrl,
  overrideUrl,
}: {
  productId: string;
  imageUrl?: string;
  overrideUrl?: string;
}) {
  const [extraMedia, setExtraMedia] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<MediaItem | undefined>(undefined);

  useEffect(() => {
    fetchProductImages(productId).then((r) => {
      const items = ((r.data as ProductImage[]) || []).map((m) => ({
        url: m.image_url,
        type: m.media_type || "image",
      }));
      setExtraMedia(items);
    });
  }, [productId]);

  const allMedia: MediaItem[] = [
    ...(imageUrl ? [{ url: imageUrl, type: "image" }] : []),
    ...extraMedia,
  ];

  const displayItem: MediaItem | undefined = overrideUrl
    ? { url: overrideUrl, type: "image" }
    : selected || (imageUrl ? { url: imageUrl, type: "image" } : allMedia[0]);

  useEffect(() => {
    if (overrideUrl) setSelected(undefined);
  }, [overrideUrl]);

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg h-80 flex items-center justify-center text-gray-400 text-sm mb-4 overflow-hidden">
        {displayItem ? (
          displayItem.type === "video" ? (
            <video
              src={displayItem.url}
              controls
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <img src={displayItem.url} alt="Product" className="w-full h-full object-contain" />
          )
        ) : (
          "No image yet"
        )}
      </div>

      {allMedia.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {allMedia.map((item, i) => {
            const isActive = !overrideUrl && displayItem?.url === item.url;
            return (
              <button
                key={i}
                onClick={() => setSelected(item)}
                className={
                  "relative w-16 h-16 rounded-md overflow-hidden shrink-0 " +
                  (isActive ? "border-2 border-brand" : "border border-gray-200 dark:border-gray-700")
                }
              >
                {item.type === "video" ? (
                  <>
                    <video src={item.url} className="w-full h-full object-cover bg-black" muted />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </span>
                  </>
                ) : (
                  <img src={item.url} alt={"View " + (i + 1)} className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

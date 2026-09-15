"use client";

import { useState, useEffect, useRef } from "react";
import { uploadProductImage, uploadProductVideo } from "@/lib/supabaseProducts";
import { fetchProductImages, addProductImage, deleteProductImage, ProductImage } from "@/lib/supabaseProductImages";

const MAX_VIDEO_MB = 50;

export default function ProductImageGallery({
  productId,
  mainImageUrl,
  onMainImageChange,
}: {
  productId: string | null;
  mainImageUrl: string;
  onMainImageChange: (url: string) => void;
}) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    fetchProductImages(productId).then((r) => {
      setImages((r.data as ProductImage[]) || []);
      setLoading(false);
    });
  }, [productId]);

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const { url } = await uploadProductImage(file);
    if (url) onMainImageChange(url);
    setUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    setUploading(true);
    setError("");
    const { url } = await uploadProductImage(file);
    if (url) {
      const nextOrder = images.length > 0 ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;
      const { data } = await addProductImage(productId, url, nextOrder, "image");
      if (data) setImages((prev) => [...prev, data as ProductImage]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_VIDEO_MB) {
      setError("Video must be under " + MAX_VIDEO_MB + "MB (this one is " + sizeMb.toFixed(1) + "MB).");
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");
    const { url } = await uploadProductVideo(file);
    if (url) {
      const nextOrder = images.length > 0 ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;
      const { data } = await addProductImage(productId, url, nextOrder, "video");
      if (data) setImages((prev) => [...prev, data as ProductImage]);
    }
    setUploading(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    await deleteProductImage(id);
  };

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Product Media</p>
      <div className="grid grid-cols-4 gap-3">
        {/* Main image slot */}
        <div className="aspect-square border-2 border-brand rounded-lg overflow-hidden relative bg-gray-50 dark:bg-gray-800">
          {mainImageUrl ? (
            <img src={mainImageUrl} alt="Main" className="w-full h-full object-cover" />
          ) : (
            <button
              type="button"
              onClick={() => mainFileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
              </svg>
              Browse Image
            </button>
          )}
          <span className="absolute top-1 left-1 bg-brand text-white text-[9px] font-bold px-1.5 py-0.5 rounded">MAIN</span>
          {mainImageUrl && (
            <button
              type="button"
              onClick={() => mainFileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded"
            >
              Change
            </button>
          )}
          <input ref={mainFileInputRef} type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
        </div>

        {/* Gallery items */}
        {!loading &&
          images.map((item) => (
            <div key={item.id} className="aspect-square border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative bg-gray-50 dark:bg-gray-800">
              {item.media_type === "video" ? (
                <>
                  <video src={item.image_url} className="w-full h-full object-cover" muted />
                  <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    VIDEO
                  </span>
                </>
              ) : (
                <img src={item.image_url} alt="Gallery" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}

        {/* Add photo slot */}
        {productId && (
          <div className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center justify-center text-gray-400 text-[11px] gap-1 w-full h-full disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
              </svg>
              {uploading ? "Uploading..." : "Add Photo"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
          </div>
        )}

        {/* Add video slot */}
        {productId && (
          <div className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center justify-center text-gray-400 text-[11px] gap-1 w-full h-full disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
              {uploading ? "Uploading..." : "Add Video"}
            </button>
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      {productId && (
        <p className="text-[11px] text-gray-400 mt-2">Videos must be under {MAX_VIDEO_MB}MB. Keep them short — they use storage quickly.</p>
      )}
      {!productId && (
        <p className="text-[11px] text-gray-400 mt-2">Save the product first to add gallery photos and videos.</p>
      )}
    </div>
  );
}

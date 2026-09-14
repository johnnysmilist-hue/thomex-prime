"use client";

import { useState, useEffect, useRef } from "react";
import { uploadProductImage } from "@/lib/supabaseProducts";
import { fetchProductImages, addProductImage, deleteProductImage, ProductImage } from "@/lib/supabaseProductImages";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    const { url } = await uploadProductImage(file);
    if (url) onMainImageChange(url);
    setUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    setUploading(true);
    const { url } = await uploadProductImage(file);
    if (url) {
      const nextOrder = images.length > 0 ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;
      const { data } = await addProductImage(productId, url, nextOrder);
      if (data) setImages((prev) => [...prev, data as ProductImage]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    await deleteProductImage(id);
  };

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Product Images</p>
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

        {/* Gallery slots */}
        {!loading &&
          images.map((img) => (
            <div key={img.id} className="aspect-square border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative bg-gray-50 dark:bg-gray-800">
              <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}

        {/* Add more slot */}
        {productId && (
          <div className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center justify-center text-gray-400 text-xs gap-1 w-full h-full disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {uploading ? "Uploading..." : "Browse Image"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
          </div>
        )}
      </div>
      {!productId && (
        <p className="text-[11px] text-gray-400 mt-2">Save the product first to add additional gallery images.</p>
      )}
    </div>
  );
}

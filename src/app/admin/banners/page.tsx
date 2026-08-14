"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchBanners, updateBanner, addBanner, deleteBanner, Banner } from "@/lib/supabaseBanners";
import { uploadProductImage } from "@/lib/supabaseProducts";

const slotLabels: Record<string, string> = {
  hero_side_1: "Side Tile 1",
  hero_side_2: "Side Tile 2",
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [addingSlide, setAddingSlide] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchBanners();
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (id: string, field: keyof Banner, value: string | boolean) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    const { url } = await uploadProductImage(file);
    setUploadingId(null);
    if (url) {
      updateField(id, "image_url", url);
    }
  };

  const handleSave = async (banner: Banner) => {
    setSavingId(banner.id);
    await updateBanner(banner.id, {
      title: banner.title,
      subtitle: banner.subtitle,
      button_text: banner.button_text,
      button_link: banner.button_link,
      image_url: banner.image_url,
      active: banner.active,
      sort_order: banner.sort_order,
    });
    setSavingId(null);
    setSavedId(banner.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleAddSlide = async () => {
    setAddingSlide(true);
    const maxOrder = Math.max(0, ...slides.map((s) => s.sort_order));
    const { data } = await addBanner({
      slot: "hero_slide",
      title: "New Slide",
      subtitle: "",
      button_text: "Shop Now",
      button_link: "/shop",
      image_url: null,
      sort_order: maxOrder + 1,
      active: true,
    });
    setAddingSlide(false);
    if (data) {
      setBanners((prev) => [...prev, data]);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    await deleteBanner(id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const slides = banners.filter((b) => b.slot === "hero_slide");
  const sideTiles = banners.filter((b) => b.slot === "hero_side_1" || b.slot === "hero_side_2");

  const renderBannerFields = (banner: Banner, showOrder: boolean) => (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Title</label>
        <input value={banner.title || ""} onChange={(e) => updateField(banner.id, "title", e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subtitle</label>
        <input value={banner.subtitle || ""} onChange={(e) => updateField(banner.id, "subtitle", e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Button Text</label>
          <input value={banner.button_text || ""} onChange={(e) => updateField(banner.id, "button_text", e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Button Link</label>
          <input value={banner.button_link || ""} onChange={(e) => updateField(banner.id, "button_link", e.target.value)} placeholder="/shop" className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
        </div>
      </div>
      {showOrder && (
        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Order</label>
            <input type="number" value={banner.sort_order} onChange={(e) => updateField(banner.id, "sort_order", e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-black dark:text-white pb-2">
            <input type="checkbox" checked={banner.active} onChange={(e) => updateField(banner.id, "active", e.target.checked)} className="accent-brand" />
            Active
          </label>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Banner Image</label>
        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(banner.id, e)} className="text-sm text-black dark:text-white" />
        {uploadingId === banner.id && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
        {banner.image_url && <img src={banner.image_url} alt="Banner" className="w-32 h-20 object-cover rounded-md mt-2 border border-gray-200 dark:border-gray-800" />}
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleSave(banner)} disabled={savingId === banner.id} className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
          {savingId === banner.id ? "Saving..." : savedId === banner.id ? "Saved!" : "Save"}
        </button>
        {showOrder && (
          <button onClick={() => handleDeleteSlide(banner.id)} className="text-red-500 text-sm font-semibold px-3">
            Delete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1 max-w-2xl">
            <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Homepage Banners</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Manage the rotating slideshow and the two side tiles on your homepage.
            </p>

            {loading ? (
              <p className="text-sm text-gray-400">Loading banners...</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-black dark:text-white">Rotating Slides ({slides.length})</h2>
                  <button onClick={handleAddSlide} disabled={addingSlide} className="border border-brand text-brand px-4 py-2 rounded-md text-xs font-semibold">
                    {addingSlide ? "Adding..." : "+ Add Slide"}
                  </button>
                </div>

                <div className="space-y-6 mb-10">
                  {slides.map((slide) => (
                    <div key={slide.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                      {renderBannerFields(slide, true)}
                    </div>
                  ))}
                </div>

                <h2 className="text-sm font-bold text-black dark:text-white mb-4">Side Tiles</h2>
                <div className="space-y-6">
                  {sideTiles.map((tile) => (
                    <div key={tile.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4">{slotLabels[tile.slot] || tile.slot}</p>
                      {renderBannerFields(tile, false)}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

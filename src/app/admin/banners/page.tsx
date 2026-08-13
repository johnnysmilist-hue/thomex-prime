"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchBanners, updateBanner, Banner } from "@/lib/supabaseBanners";
import { uploadProductImage } from "@/lib/supabaseProducts";

const slotLabels: Record<string, string> = {
  hero_main: "Main Banner",
  hero_side_1: "Side Tile 1",
  hero_side_2: "Side Tile 2",
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchBanners();
    setBanners(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (id: string, field: keyof Banner, value: string) => {
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
    });
    setSavingId(null);
    setSavedId(banner.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1 max-w-2xl">
            <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Homepage Banners</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Edit the text, button, and image for each banner shown at the top of your homepage.
            </p>

            {loading ? (
              <p className="text-sm text-gray-400">Loading banners...</p>
            ) : (
              <div className="space-y-6">
                {banners.map((banner) => (
                  <div key={banner.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-5">
                    <p className="text-sm font-bold text-black dark:text-white mb-4">
                      {slotLabels[banner.slot] || banner.slot}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Title</label>
                        <input
                          value={banner.title || ""}
                          onChange={(e) => updateField(banner.id, "title", e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subtitle</label>
                        <input
                          value={banner.subtitle || ""}
                          onChange={(e) => updateField(banner.id, "subtitle", e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Button Text</label>
                          <input
                            value={banner.button_text || ""}
                            onChange={(e) => updateField(banner.id, "button_text", e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Button Link</label>
                          <input
                            value={banner.button_link || ""}
                            onChange={(e) => updateField(banner.id, "button_link", e.target.value)}
                            placeholder="/shop"
                            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Banner Image</label>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(banner.id, e)} className="text-sm text-black dark:text-white" />
                        {uploadingId === banner.id && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
                        {banner.image_url && (
                          <img src={banner.image_url} alt="Banner" className="w-32 h-20 object-cover rounded-md mt-2 border border-gray-200 dark:border-gray-800" />
                        )}
                      </div>

                      <button
                        onClick={() => handleSave(banner)}
                        disabled={savingId === banner.id}
                        className="bg-brand text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
                      >
                        {savingId === banner.id ? "Saving..." : savedId === banner.id ? "Saved!" : "Save Banner"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminGuard>
      <Footer />
    </main>
  );
}

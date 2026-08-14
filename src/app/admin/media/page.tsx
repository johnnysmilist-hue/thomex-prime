"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import { supabase } from "@/lib/supabaseClient";
import { uploadProductImage } from "@/lib/supabaseProducts";

type MediaFile = {
  name: string;
  url: string;
};

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedName, setCopiedName] = useState("");

  const loadFiles = async () => {
    setLoading(true);
    const { data } = await supabase.storage.from("product-images").list("", {
      sortBy: { column: "created_at", order: "desc" },
    });

    if (data) {
      const mapped = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((f) => {
          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(f.name);
          return { name: f.name, url: urlData.publicUrl };
        });
      setFiles(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadProductImage(file);
    setUploading(false);
    loadFiles();
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Delete this image? This won't remove it from products already using it.")) return;
    await supabase.storage.from("product-images").remove([name]);
    loadFiles();
  };

  const handleCopy = (url: string, name: string) => {
    navigator.clipboard.writeText(url);
    setCopiedName(name);
    setTimeout(() => setCopiedName(""), 1500);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <AdminGuard>
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
          <AdminSidebar />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
              <h1 className="text-xl font-bold text-black dark:text-white">Media Library</h1>
              <label className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold cursor-pointer">
                {uploading ? "Uploading..." : "+ Upload Image"}
                <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Every image you've uploaded across products and banners. Copy a link to reuse it anywhere.
            </p>

            {loading ? (
              <p className="text-sm text-gray-400">Loading media...</p>
            ) : files.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No images uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div key={file.name} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="h-28 bg-gray-100 dark:bg-gray-900">
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 space-y-1.5">
                      <button
                        onClick={() => handleCopy(file.url, file.name)}
                        className="w-full text-xs font-semibold text-brand border border-brand rounded-md py-1.5"
                      >
                        {copiedName === file.name ? "Copied!" : "Copy Link"}
                      </button>
                      <button
                        onClick={() => handleDelete(file.name)}
                        className="w-full text-xs font-semibold text-red-500 py-1"
                      >
                        Delete
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

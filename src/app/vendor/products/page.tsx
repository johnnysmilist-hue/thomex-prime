"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import VendorSidebar from "@/components/VendorSidebar";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  stock: number;
  status: string;
  sku: string | null;
};

export default function VendorProductsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <VendorGuard>{(store) => <VendorProductsList storeId={store.id} />}</VendorGuard>
      <Footer />
    </main>
  );
}

function VendorProductsList({ storeId }: { storeId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, price, old_price, image_url, stock, status, sku")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [storeId]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
      <VendorSidebar />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-black dark:text-white">My Products</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product listings.</p>
          </div>
          <a href="/vendor/products/new" className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-md">
            + Add New Product
          </a>
        </div>

        <div className="relative max-w-xs mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-black dark:text-white focus:outline-none"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <p className="text-sm text-gray-400 p-6">Loading products...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 p-6">
              {products.length === 0 ? "You haven't added any products yet." : "No products match your search."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">SKU</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                            {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                          </div>
                          <span className="text-black dark:text-white font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.sku || "—"}</td>
                      <td className="px-4 py-3 text-black dark:text-white font-medium">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.stock}</td>
                      <td className="px-4 py-3">
                        <span className={"text-[10px] font-bold px-2 py-1 rounded " + (p.status === "Published" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>
                          {p.status?.toUpperCase() || "DRAFT"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a href={"/vendor/products/" + p.id + "/edit"} className="text-xs font-semibold text-brand">Edit</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { categories } from "@/lib/categories";

const subcategoryMap: Record<string, string[]> = {
  "Laptops": ["Gaming Laptops", "Ultrabooks", "2-in-1 Laptops", "Laptop Bags"],
  "PC & Computers": ["Desktops", "Monitors", "Keyboards & Mice", "PC Components"],
  "Accessories": ["Chargers", "Cables", "Power Banks", "Cases & Covers"],
  "Gaming & VR": ["Consoles", "Controllers", "VR Headsets", "Gaming Chairs"],
  "Networking": ["Routers", "Extenders", "Modems", "Network Switches"],
  "Office": ["Printers", "Scanners", "Office Chairs", "Desks"],
  "Sounds": ["Headphones", "Speakers", "Earbuds", "Soundbars"],
  "Cameras": ["DSLR Cameras", "Mirrorless Cameras", "Action Cameras", "Camera Accessories"],
  "Cell Phones": ["Smartphones", "Feature Phones", "Phone Cases", "Screen Protectors"],
  "Tablets": ["iPads", "Android Tablets", "Tablet Keyboards", "Tablet Cases"],
  "Storage, USB": ["Flash Drives", "External Hard Drives", "SD Cards", "SSDs"],
  "Clearance": ["Last Chance Deals", "Open Box", "Refurbished"],
};

export default function CategoriesPage() {
  const [active, setActive] = useState(categories[0]);
  const subcats = subcategoryMap[active] || [];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="flex">
        <aside className="w-28 sm:w-40 shrink-0 border-r border-gray-100 dark:border-gray-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={
                active === cat
                  ? "w-full text-left px-3 py-4 text-xs sm:text-sm font-semibold border-l-2 border-brand bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
                  : "w-full text-left px-3 py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 border-l-2 border-transparent"
              }
            >
              {cat}
            </button>
          ))}
        </aside>

        <div className="flex-1 px-4 py-4">
          <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-black dark:text-white">{active}</p>
              <a href={"/shop?category=" + encodeURIComponent(active)} className="text-xs font-semibold text-brand">
                See All
              </a>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {subcats.map((sub) => (
                
                  key={sub}
                  href={"/shop?category=" + encodeURIComponent(active)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-full aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center text-gray-400 text-[10px]">
                    {sub.charAt(0)}
                  </div>
                  <span className="text-[11px] text-center text-black dark:text-white leading-tight">{sub}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

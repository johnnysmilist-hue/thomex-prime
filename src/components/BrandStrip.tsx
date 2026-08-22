"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchBrands, Brand } from "@/lib/supabaseBrands";

export default function BrandStrip() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    fetchBrands().then((r) => setBrands(r.data || []));
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-5">Shop By Top Brands</h3>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={"/shop?brand=" + encodeURIComponent(brand.name)}
              title={brand.name}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <img src={brand.logo_url} alt={brand.name} className="h-7 w-auto object-contain" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

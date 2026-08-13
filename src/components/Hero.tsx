"use client";

import { useState, useEffect } from "react";
import { fetchBannerBySlot, Banner } from "@/lib/supabaseBanners";

export default function Hero() {
  const [main, setMain] = useState<Banner | null>(null);
  const [side1, setSide1] = useState<Banner | null>(null);
  const [side2, setSide2] = useState<Banner | null>(null);

  useEffect(() => {
    fetchBannerBySlot("hero_main").then((r) => setMain(r.data));
    fetchBannerBySlot("hero_side_1").then((r) => setSide1(r.data));
    fetchBannerBySlot("hero_side_2").then((r) => setSide2(r.data));
  }, []);

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        className="md:col-span-2 bg-gray-500 dark:bg-gray-800 text-white rounded-lg p-8 flex flex-col justify-center min-h-[280px] bg-cover bg-center"
        style={main?.image_url ? { backgroundImage: "url(" + main.image_url + ")" } : {}}
      >
        <h1 className="text-3xl font-bold mb-2 leading-tight max-w-md">
          {main?.title || "Next Gen Tech For Every Lifestyle"}
        </h1>
        <p className="text-gray-200 text-sm mb-5 max-w-xs">
          {main?.subtitle || "Latest gadgets. Unbeatable prices."}
        </p>
        {main?.button_text && (
          <a href={main.button_link || "/shop"} className="inline-block w-fit bg-brand hover:bg-brand-light transition-colors text-white px-5 py-2 rounded-md text-sm font-semibold">
            {main.button_text}
          </a>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div
          className="bg-gray-100 dark:bg-gray-900 rounded-lg p-5 flex-1 flex flex-col justify-center bg-cover bg-center"
          style={side1?.image_url ? { backgroundImage: "url(" + side1.image_url + ")" } : {}}
        >
          <h3 className="font-bold mb-3 text-black dark:text-white">{side1?.title || "Featured"}</h3>
          {side1?.button_text && (
            <a href={side1.button_link || "/shop"} className="inline-block w-fit bg-brand text-white px-4 py-2 rounded-md text-xs font-semibold">
              {side1.button_text}
            </a>
          )}
        </div>

        <div
          className="bg-gray-800 dark:bg-black text-white rounded-lg p-5 flex-1 flex flex-col justify-center bg-cover bg-center"
          style={side2?.image_url ? { backgroundImage: "url(" + side2.image_url + ")" } : {}}
        >
          <h3 className="font-bold mb-3">{side2?.title || "Featured"}</h3>
          <p className="text-sm text-gray-300">{side2?.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

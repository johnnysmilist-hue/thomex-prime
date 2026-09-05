"use client";

import { useState, useEffect } from "react";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";
import { fetchSettings } from "@/lib/supabaseSettings";
import ProductCard from "@/components/ProductCard";

function getTimeLeft(endISO: string) {
  const diff = new Date(endISO).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/15 backdrop-blur rounded-lg px-3 py-2 min-w-[56px]">
      <span className="text-lg font-bold text-white tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="text-[9px] text-white/70 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export default function FlashSaleSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllProductsForSite(), fetchSettings()]).then(([productsRes, settingsRes]) => {
      setProducts(productsRes.products.filter((p) => p.isFlashSale));
      setEndTime(settingsRes.data?.flash_sale_end || null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!endTime) return;
    setTimeLeft(getTimeLeft(endTime));
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (loading) return null;
  if (products.length === 0) return null;
  if (!endTime || !timeLeft) return null;

  return (
    <div className="bg-gradient-to-r from-brand-dark via-brand to-brand-light rounded-2xl overflow-hidden my-8 mx-4 md:mx-0">
      <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
            </svg>
          </span>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Flash Sale</p>
            <p className="text-white/70 text-xs">Limited time only — grab it before it's gone</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TimeBox value={timeLeft.days} label="Days" />
          <span className="text-white font-bold">:</span>
          <TimeBox value={timeLeft.hours} label="Hrs" />
          <span className="text-white font-bold">:</span>
          <TimeBox value={timeLeft.minutes} label="Min" />
          <span className="text-white font-bold">:</span>
          <TimeBox value={timeLeft.seconds} label="Sec" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 px-4 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchSiteFaqs, SiteFaq } from "@/lib/supabaseSiteFaqs";

type FaqCategory = {
  id: string;
  label: string;
  items: SiteFaq[];
};

export default function FaqPage() {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteFaqs().then(({ data }) => {
      const rows = (data as SiteFaq[]) || [];
      const grouped: FaqCategory[] = [];

      rows.forEach((row) => {
        let cat = grouped.find((g) => g.id === row.category_id);
        if (!cat) {
          cat = { id: row.category_id, label: row.category_label, items: [] };
          grouped.push(cat);
        }
        cat.items.push(row);
      });

      setCategories(grouped);
      if (grouped.length > 0) setActiveCategory(grouped[0].id);
      setLoading(false);
    });
  }, []);

  const current = categories.find((c) => c.id === activeCategory) || null;

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setOpenId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">FAQs</h1>
        <p className="text-sm text-gray-400 mt-1">Home / FAQs</p>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}

      {!loading && categories.length === 0 && (
        <p className="text-sm text-gray-400">No FAQs available yet.</p>
      )}

      {!loading && categories.length > 0 && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Category sidebar */}
          <div className="md:w-56 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {categories.map((cat) => {
              const active = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={
                    "text-left px-4 py-3 rounded-md text-sm font-semibold whitespace-nowrap shrink-0 transition-colors " +
                    (active
                      ? "bg-brand text-white"
                      : "bg-gray-50 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700")
                  }
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Questions */}
          <div className="flex-1 space-y-3">
            {current?.items.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={
                    "rounded-md border overflow-hidden transition-colors " +
                    (isOpen
                      ? "border-brand bg-brand/5"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900")
                  }
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-black dark:text-white pr-4">
                      {faq.question}
                    </span>
                    <span
                      className={
                        "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold " +
                        (isOpen ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500")
                      }
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

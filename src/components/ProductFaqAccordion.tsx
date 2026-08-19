"use client";

import { useState, useEffect } from "react";
import { fetchProductFaqs, ProductFaq } from "@/lib/supabaseFaqs";

export default function ProductFaqAccordion({ productId }: { productId: string }) {
  const [faqs, setFaqs] = useState<ProductFaq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchProductFaqs(productId).then((r) => setFaqs(r.data || []));
  }, [productId]);

  if (faqs.length === 0) return null;

  return (
    <div className="mt-14">
      <h2 className="text-xl font-bold mb-5 text-black dark:text-white">Frequently Asked Questions</h2>
      <div className="divide-y divide-gray-200 dark:divide-gray-800 border-t border-b border-gray-200 dark:border-gray-800">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="text-sm font-medium text-black dark:text-white">{faq.question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={"text-gray-400 shrink-0 transition-transform " + (isOpen ? "rotate-180" : "")}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isOpen && (
                <p className="text-sm text-gray-600 dark:text-gray-300 pb-4">{faq.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { fetchProductFeatures, ProductFeature } from "@/lib/supabaseFeatures";
import { FeatureIcon } from "@/lib/featureIcons";

export default function WhyThisProduct({ productId, productName }: { productId: string; productName: string }) {
  const [features, setFeatures] = useState<ProductFeature[]>([]);

  useEffect(() => {
    fetchProductFeatures(productId).then((r) => setFeatures(r.data || []));
  }, [productId]);

  if (features.length === 0) return null;

  return (
    <div className="mt-14">
      <h2 className="text-xl font-bold text-center mb-8 text-black dark:text-white">
        Why {productName}?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {features.map((f) => (
          <div key={f.id} className="text-center sm:text-left flex sm:block items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mx-auto sm:mx-0 mb-0 sm:mb-3">
              <FeatureIcon name={f.icon} />
            </div>
            <div>
              <p className="font-semibold text-black dark:text-white mb-1">{f.title}</p>
              {f.description && <p className="text-sm text-gray-500 dark:text-gray-400">{f.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import ProductRow from "./ProductRow";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { fetchAllProductsForSite, Product } from "@/lib/supabaseProducts";

export default function RecentlyViewed() {
  const { ids } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    fetchAllProductsForSite().then(({ products: allProducts }) => {
      const ordered = ids
        .map((id) => allProducts.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));
      setProducts(ordered);
    });
  }, [ids]);

  if (products.length === 0) return null;

  return <ProductRow title="Recently Viewed" products={products} />;
}

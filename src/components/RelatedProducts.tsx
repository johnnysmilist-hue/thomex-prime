import ProductCard from "./ProductCard";
import { products } from "@/lib/products";
import type { Product } from "@/lib/products";

export default function RelatedProducts({ currentId, category }: { currentId: string; category: string }) {
  const related = products.filter((p) => p.category === category && p.id !== currentId).slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="mt-14">
      <h2 className="text-xl font-bold mb-5 text-black dark:text-white">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {related.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

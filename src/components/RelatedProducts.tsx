import ProductCard from "./ProductCard";

const related = [
  { id: "40", name: "T-fun NC95 Hybrid", price: 14, oldPrice: 20, rating: 4.5, reviewCount: 32, discountPercent: 30 },
  { id: "41", name: "Apple AirPod Max", price: 12, oldPrice: 15, rating: 4.6, reviewCount: 45, discountPercent: 20 },
  { id: "42", name: "Apple AirPods 4 Wireless", price: 25, oldPrice: 30, rating: 4.8, reviewCount: 67, discountPercent: 17 },
  { id: "43", name: "Sony WH-1000XM5", price: 299, oldPrice: 349, rating: 4.9, reviewCount: 98, discountPercent: 15 },
];

export default function RelatedProducts() {
  return (
    <div className="mt-14">
      <h2 className="text-xl font-bold mb-5 text-black dark:text-white">Related Posts</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

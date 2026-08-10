import ProductCard from "./ProductCard";

const products = [
  { id: "13", name: "Apple iPad Air 4 10.9-inch Wi-Fi 256GB", price: 49, rating: 4.5, reviewCount: 4 },
  { id: "14", name: "Apple iPad Mini 6 Wi-Fi Cellular 64GB/128GB", price: 56, rating: 5, reviewCount: 4 },
  { id: "15", name: "Apple iPad Pro M1 11-inch 2021 Wi-Fi 128GB", price: 56, rating: 3, reviewCount: 4 },
  { id: "16", name: "Apple iPhone 11 Pro 256GB Space Gray - Unlocked", price: 210, oldPrice: 220, rating: 4.5, reviewCount: 2, discountPercent: 5 },
  { id: "17", name: "Apple iPhone 12 Pro Max 128GB - Unlocked", price: 120, rating: 4.5, reviewCount: 3 },
  { id: "18", name: "Apple iPhone 13 Mini 128GB Pink - Unlocked", price: 150, rating: 5, reviewCount: 1 },
  { id: "19", name: "Apple iPhone 13 Pro Max 128GB - Unlocked", price: 120, oldPrice: 150, rating: 5, reviewCount: 1, discountPercent: 20 },
];

export default function ProductCarousel() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-xl font-bold mb-5">Featured Deals</h2>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
        {products.map((product) => (
          <div key={product.id} className="min-w-[180px] snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

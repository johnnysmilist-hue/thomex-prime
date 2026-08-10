import ProductCard from "./ProductCard";

const products = [
  { id: "1", name: "iPhone 15 Pro Max 256GB", price: 1099, oldPrice: 1379, rating: 4.8, reviewCount: 124, discountPercent: 20 },
  { id: "2", name: "Sony WH-1000XM5", price: 299, oldPrice: 349, rating: 4.9, reviewCount: 98, discountPercent: 15 },
  { id: "3", name: "Samsung Galaxy Watch 6", price: 199, oldPrice: 219, rating: 4.7, reviewCount: 76, discountPercent: 10 },
  { id: "4", name: "Canon EOS R50 Camera", price: 649, oldPrice: 929, rating: 4.8, reviewCount: 64, discountPercent: 30 },
  { id: "5", name: "DJI Mini 3 Pro Drone", price: 759, oldPrice: 1009, rating: 4.7, reviewCount: 53, discountPercent: 25 },
  { id: "6", name: "AirPods Pro 2nd Gen", price: 199, oldPrice: 249, rating: 4.9, reviewCount: 112, discountPercent: 18 },
];

export default function TopPicks() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Top Picks For You</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

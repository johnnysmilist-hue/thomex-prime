import ProductCard from "./ProductCard";

const products = [
  { id: "7", name: "Dell XPS 13 Plus Laptop", price: 1199, rating: 4.7, reviewCount: 89 },
  { id: "8", name: "iPad Air 5th Gen", price: 549, oldPrice: 599, rating: 4.8, reviewCount: 103, discountPercent: 8 },
  { id: "9", name: "JBL Charge 5 Speaker", price: 129, rating: 4.6, reviewCount: 72 },
  { id: "10", name: "ASUS ROG Strix G15", price: 1299, rating: 4.7, reviewCount: 65 },
  { id: "11", name: "GoPro HERO11 Black", price: 349, oldPrice: 399, rating: 4.6, reviewCount: 77, discountPercent: 13 },
  { id: "12", name: "Logitech MX Master 3S", price: 99, rating: 4.8, reviewCount: 91 },
];

export default function BestSelling() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-xl font-bold mb-5">Best Selling Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

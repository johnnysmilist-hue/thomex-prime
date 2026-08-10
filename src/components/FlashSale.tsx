import ProductCard from "./ProductCard";

const flashProducts = [
  { id: "30", name: "Xiaomi Redmi Note 13 128GB", price: 149, oldPrice: 219, rating: 4.4, reviewCount: 210, discountPercent: 32 },
  { id: "31", name: "Anker PowerCore 20000mAh", price: 19, oldPrice: 35, rating: 4.6, reviewCount: 340, discountPercent: 46 },
  { id: "32", name: "Samsung 55-inch 4K Smart TV", price: 349, oldPrice: 549, rating: 4.5, reviewCount: 88, discountPercent: 36 },
  { id: "33", name: "HP DeskJet Wireless Printer", price: 59, oldPrice: 99, rating: 4.2, reviewCount: 56, discountPercent: 40 },
  { id: "34", name: "Xbox Wireless Controller", price: 39, oldPrice: 64, rating: 4.7, reviewCount: 129, discountPercent: 39 },
  { id: "35", name: "Ring Video Doorbell", price: 49, oldPrice: 89, rating: 4.3, reviewCount: 74, discountPercent: 45 },
];

export default function FlashSale() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="bg-red-600 text-white rounded-t-lg px-5 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">⚡ Flash Sale</h2>
          <div className="flex gap-1 text-xs font-bold">
            <span className="bg-black/30 rounded px-2 py-1">08</span>
            <span className="self-center">:</span>
            <span className="bg-black/30 rounded px-2 py-1">45</span>
            <span className="self-center">:</span>
            <span className="bg-black/30 rounded px-2 py-1">12</span>
          </div>
        </div>
        <a href="/shop" className="text-sm font-semibold underline underline-offset-2">
          View All
        </a>
      </div>

      <div className="border border-t-0 border-red-200 rounded-b-lg p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {flashProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

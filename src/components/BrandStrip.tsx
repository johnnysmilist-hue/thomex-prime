const brands = ["Apple", "Samsung", "Sony", "Dell", "HP", "Asus", "Lenovo", "JBL", "Canon", "DJI"];

export default function BrandStrip() {
  return (
    <section className="border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h3 className="text-center text-sm font-semibold text-gray-500 mb-5">Shop By Top Brands</h3>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          {brands.map((brand) => (
            <span key={brand} className="text-gray-400 font-bold text-lg">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const brands = [
  { name: "Apple", slug: "apple" },
  { name: "Samsung", slug: "samsung" },
  { name: "Sony", slug: "sony" },
  { name: "Dell", slug: "dell" },
  { name: "HP", slug: "hp" },
  { name: "Asus", slug: "asus" },
  { name: "Lenovo", slug: "lenovo" },
  { name: "JBL", slug: "jbl" },
  { name: "Canon", slug: "canon" },
  { name: "DJI", slug: "dji" },
];

export default function BrandStrip() {
  return (
    <section className="border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h3 className="text-center text-sm font-semibold text-gray-500 mb-5">Shop By Top Brands</h3>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6">
          {brands.map((brand) => (
            <img
              key={brand.slug}
              src={"https://cdn.simpleicons.org/" + brand.slug + "/9ca3af"}
              alt={brand.name}
              className="h-7 opacity-70 hover:opacity-100 transition-opacity"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

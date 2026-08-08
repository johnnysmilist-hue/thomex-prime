const categories = [
  "Laptops",
  "Phones",
  "Smart Watch",
  "Headphones",
  "Cameras",
  "Gaming",
  "Accessories",
];

export default function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {categories.map((cat) => (
          
            key={cat}
            href="/shop"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-brand hover:text-brand transition-colors text-center"
          >
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold">
              {cat.charAt(0)}
            </div>
            <span className="text-xs font-medium">{cat}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

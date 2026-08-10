const categories = [
  { title: "Laptops", subtitle: "Work & Play" },
  { title: "Phones", subtitle: "Latest Models" },
  { title: "Smart Watch", subtitle: "Track. Achieve." },
  { title: "Headphones", subtitle: "Premium Sound" },
  { title: "Cameras", subtitle: "Capture More" },
  { title: "Gaming", subtitle: "Level Up" },
  { title: "Accessories", subtitle: "Designed for You" },
];

export default function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
        {categories.map((cat) => (
          <a key={cat.title} href="/shop" className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm">{cat.title}</h3>
              <p className="text-xs text-gray-500">{cat.subtitle}</p>
            </div>
            <span className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shrink-0">→</span>
          </a>
        ))}
      </div>
    </section>
  );
}

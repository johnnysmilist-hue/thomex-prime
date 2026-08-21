const categories = [
  { title: "Laptops" },
  { title: "Phones" },
  { title: "Smart Watch" },
  { title: "Headphones" },
  { title: "Cameras" },
  { title: "Gaming" },
  { title: "Accessories" },
];

export default function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-4 overflow-x-auto sm:grid sm:grid-cols-7 sm:gap-4" style={{ scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <a key={cat.title} href="/shop" className="flex flex-col items-center gap-2 shrink-0 w-16 sm:w-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 text-[10px] overflow-hidden">
              {cat.title.charAt(0)}
            </div>
            <span className="text-[11px] sm:text-xs text-center text-black dark:text-white leading-tight">{cat.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

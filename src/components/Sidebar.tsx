const categories = [
  "Laptops",
  "PC & Computers",
  "Accessories",
  "Gaming & VR",
  "Networking",
  "Office",
  "Sounds",
  "Cameras",
  "Cell Phones",
  "Tablets",
  "Storage, USB",
  "Clearance",
];

export default function Sidebar() {
  return (
    <aside className="w-full md:w-56 shrink-0">
      <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-4">
        <ul className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
          <li>
            <a href="/shop" className="block py-2 text-black dark:text-white hover:text-brand font-semibold">
              All Products
            </a>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <a href={"/shop?category=" + encodeURIComponent(cat)} className="block py-2 text-black dark:text-white hover:text-brand">
                {cat}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

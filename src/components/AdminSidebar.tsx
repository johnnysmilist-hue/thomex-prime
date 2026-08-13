"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "🧾" },
  { href: "/admin/media", label: "Media Library", icon: "🖼️" },
  { href: "/admin/users", label: "Users", icon: "👤" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-56 shrink-0 bg-gray-900 text-gray-300 rounded-lg overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-800">
        <p className="text-white font-bold text-sm">Thomex Admin</p>
      </div>
      <nav className="py-2">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "flex items-center gap-3 px-4 py-2.5 text-sm bg-brand text-white"
                  : "flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-800 hover:text-white transition-colors"
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

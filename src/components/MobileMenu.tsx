"use client";

import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();

  const links = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Categories", href: "/categories" },
    { name: "Track Order", href: "/track" },
    { name: "Wishlist", href: "/wishlist" },
    { name: "Cart", href: "/cart" },
    { name: user ? "My Account" : "Log In / Sign Up", href: user ? "/account" : "/signin" },
    { name: "Sell on Thomex", href: "/sell" },
    { name: "Contact Us", href: "/contact" },
  ];

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-72 bg-white dark:bg-gray-950 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <p className="font-bold text-black dark:text-white">Menu</p>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {links.map((link) => (
            <a key={link.name} href={link.href} onClick={onClose} className="block px-4 py-3 text-sm text-black dark:text-white border-b border-gray-50 dark:border-gray-900">
              {link.name}
            </a>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

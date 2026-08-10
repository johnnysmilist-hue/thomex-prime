"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

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

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors">
      <div className="text-xs text-gray-600 dark:text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <a href="/" className="text-lg font-bold text-brand">Thomex</a>
          <div className="flex items-center gap-4">
            <a href="/track" className="bg-green-600 text-white px-3 py-1 rounded-full font-semibold">Track Order</a>
            <a href="/account">Log In / Sign Up</a>
            <a href="/cart" className="flex items-center gap-2">
              <span className="bg-brand text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">3</span>
              <span>Cart</span>
            </a>
            <span>USD</span>
            <span>Eng</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="bg-brand">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap relative">
          <button onClick={() => setOpen(!open)} className="bg-white text-brand-dark text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2 shrink-0">
            All Categories ▾
          </button>

          {open && (
            <div className="absolute top-full left-4 mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 py-2">
              {categories.map((cat) => (
                <a key={cat} href={"/shop?category=" + encodeURIComponent(cat)} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                  {cat}
                </a>
              ))}
            </div>
          )}

          <div className="flex-1 min-w-[200px] flex">
            <input type="text" placeholder="Search anything..." className="w-full px-4 py-2 text-sm rounded-l-md focus:outline-none" />
            <button className="bg-brand-dark text-white px-5 rounded-r-md text-sm">Search</button>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-white text-xs font-medium">
            <span>Free Shipping Over $399</span>
            <span>Money Back Guarantee</span>
            <span>100% Secure Payment</span>
          </div>
        </div>
      </div>
    </header>
  );
}

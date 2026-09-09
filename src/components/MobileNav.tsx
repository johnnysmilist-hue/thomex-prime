"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path;

  const items = [
    {
      href: "/",
      label: "Home",
      active: isActive("/"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      badge: null as number | null,
    },
    {
      href: "/categories",
      label: "Categories",
      active: isActive("/categories"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      badge: null as number | null,
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      active: isActive("/wishlist"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
      badge: wishlistItems.length > 0 ? wishlistItems.length : null,
    },
    {
      href: "/cart",
      label: "Cart",
      active: isActive("/cart"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      ),
      badge: totalItems > 0 ? totalItems : null,
    },
    {
      href: user ? "/account" : "/signin",
      label: "Account",
      active: isActive("/account") || isActive("/signin"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      badge: null as number | null,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-black dark:bg-gray-900 rounded-full shadow-xl border border-white/5 flex items-center justify-between px-2 py-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              item.active
                ? "flex items-center gap-1.5 bg-white text-black rounded-full pl-3 pr-4 py-2 transition-all duration-200"
                : "relative flex items-center justify-center w-10 h-10 rounded-full text-gray-400 hover:text-white transition-colors"
            }
          >
            <span className="relative shrink-0">
              {item.icon}
              {item.badge !== null && !item.active && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand text-white rounded-full w-3.5 h-3.5 text-[8px] font-bold flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </span>
            {item.active && (
              <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

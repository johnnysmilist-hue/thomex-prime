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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around py-2 px-1">
      <Link href="/" className={isActive("/") ? "flex flex-col items-center gap-0.5 text-brand" : "flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400"}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-[10px] font-medium">Home</span>
      </Link>

      <Link href="/shop" className={isActive("/shop") ? "flex flex-col items-center gap-0.5 text-brand" : "flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400"}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
        <span className="text-[10px] font-medium">Categories</span>
      </Link>

      <Link href="/wishlist" className={isActive("/wishlist") ? "flex flex-col items-center gap-0.5 text-brand relative" : "flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 relative"}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        {wishlistItems.length > 0 && (
          <span className="absolute -top-1 right-2 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center">{wishlistItems.length}</span>
        )}
        <span className="text-[10px] font-medium">Wishlist</span>
      </Link>

      <Link href="/cart" className={isActive("/cart") ? "flex flex-col items-center gap-0.5 text-brand relative" : "flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 relative"}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-1 right-2 bg-brand text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center">{totalItems}</span>
        )}
        <span className="text-[10px] font-medium">Cart</span>
      </Link>

      <Link href={user ? "/account" : "/signin"} className={isActive("/account") || isActive("/signin") ? "flex flex-col items-center gap-0.5 text-brand" : "flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400"}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="text-[10px] font-medium">Account</span>
      </Link>
    </nav>
  );
}

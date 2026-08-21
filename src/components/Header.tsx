"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";
import CategoryMegaMenu from "./CategoryMegaMenu";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { products } from "@/lib/products";
import { fetchSettings } from "@/lib/supabaseSettings";

export default function Header() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hotline, setHotline] = useState("+254 700 123 456");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    fetchSettings().then((r) => {
      if (r.data?.hotline) {
        setHotline(r.data.hotline);
      }
    });
  }, []);

  const suggestions =
    query.trim().length > 0
      ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
      : [];

  const goToSearch = (term: string) => {
    setShowSuggestions(false);
    setQuery(term);
    router.push("/search?q=" + encodeURIComponent(term.trim()));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      goToSearch(query);
    }
  };

  const logoSrc = mounted && theme === "dark" ? "/logo-dark.png" : "/logo-light.png";
  const username = user?.user_metadata?.username;

  return (
    <header className="w-full border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors">
      {/* Mobile compact bar */}
      <div className="md:hidden px-4 py-3">
        <div className="relative flex items-center gap-3">
          <a href={mounted && user ? "/account" : "/signin"} className="shrink-0 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-black dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </a>
          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0 mr-2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search on Thomex"
              className="w-full bg-transparent text-sm text-black dark:text-white focus:outline-none"
            />
          </form>

          <button onClick={() => setMobileMenuOpen(true)} className="shrink-0 w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-black dark:text-white" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-12 right-12 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 py-1">
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goToSearch(p.name)}
                  className="block w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Desktop full header */}
      <div className="hidden md:block">
        <div className="text-xs text-gray-600 dark:text-gray-300">
          <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
            <a href="/">
              <img src={logoSrc} alt="Thomex" className="h-8 w-auto" />
            </a>
            <div className="flex items-center gap-4">
              <span className="hidden lg:inline">Hotline: {hotline}</span>
              <a href="/track" className="bg-green-600 text-white px-3 py-1 rounded-full font-semibold">Track Order</a>
              {mounted && user ? (
                <a href="/account">{username || user.email}</a>
              ) : (
                <a href="/signin">Log In / Sign Up</a>
              )}
              <a href="/wishlist" className="flex items-center gap-2">
                <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">{wishlistItems.length}</span>
                <span>Wishlist</span>
              </a>
              <a href="/cart" className="flex items-center gap-2">
                <span className="bg-brand text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">{totalItems}</span>
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
            <CategoryMegaMenu />

            <div className="flex-1 min-w-[200px] relative">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search anything..."
                  className="w-full px-4 py-2 text-sm rounded-l-md focus:outline-none"
                />
                <button type="submit" className="bg-brand-dark text-white px-5 rounded-r-md text-sm">Search</button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 py-1">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => goToSearch(p.name)}
                      className="block w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-6 text-white text-xs font-medium">
              <span>Free Shipping Over $399</span>
              <span>Money Back Guarantee</span>
              <span>100% Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

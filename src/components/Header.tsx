"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";
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
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

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

  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    await signOut();
    router.push("/");
  };

  const menuIcon = (name: string) => {
    const common = { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (name === "account") return <svg {...common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    if (name === "orders") return <svg {...common}><path d="M20 7h-3a2 2 0 0 1-2-2V2" /><path d="M9 22h9a2 2 0 0 0 2-2V7l-5-5H9a2 2 0 0 0-2 2v3" /><path d="M3 12h6" /><path d="M3 16h6" /><path d="M3 8h2" /></svg>;
    if (name === "wishlist") return <svg {...common}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>;
    if (name === "cart") return <svg {...common}><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>;
    if (name === "logout") return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
    return null;
  };

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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          <a href="/" className="shrink-0">
            <img src={logoSrc} alt="Thomex" className="h-8 w-auto" />
          </a>

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
                className="w-full px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-900 text-black dark:text-white rounded-l-md focus:outline-none"
              />
              <button type="submit" className="bg-brand text-white px-6 rounded-r-md text-sm font-semibold">Search</button>
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

          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300 shrink-0">
            <a href="/track" className="bg-green-600 text-white px-3 py-1 rounded-full font-semibold">Track Order</a>
            {mounted && user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5"
                >
                  <span className="text-gray-500 dark:text-gray-400">{menuIcon("account")}</span>
                  Hi, {username || user.email?.split("@")[0]}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {accountMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 py-2">
                      <a href="/account" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                        <span className="text-gray-500 dark:text-gray-400">{menuIcon("account")}</span>
                        My Account
                      </a>
                      <a href="/account/orders" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                        <span className="text-gray-500 dark:text-gray-400">{menuIcon("orders")}</span>
                        Orders
                      </a>
                      <a href="/wishlist" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                        <span className="text-gray-500 dark:text-gray-400">{menuIcon("wishlist")}</span>
                        Wishlist
                      </a>
                      <a href="/cart" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                        <span className="text-gray-500 dark:text-gray-400">{menuIcon("cart")}</span>
                        Cart
                      </a>
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                        <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left">
                          <span>{menuIcon("logout")}</span>
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a href="/signin">Log In / Sign Up</a>
            )}
            <a href="/cart" className="flex items-center gap-2">
              <span className="bg-brand text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">{totalItems}</span>
              <span>Cart</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

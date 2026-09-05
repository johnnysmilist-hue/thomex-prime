"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/supabaseNewsletter";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("saving");
    const { error } = await subscribeToNewsletter(email.trim());

    if (error) {
      // Postgres unique violation code = already subscribed, treat as success
      if (error.code === "23505") {
        setStatus("done");
        setEmail("");
        return;
      }
      setStatus("error");
      return;
    }

    setStatus("done");
    setEmail("");
  };

  return (
    <footer className="bg-brand-dark dark:bg-black text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-xs sm:text-sm">
        <div className="col-span-2 sm:col-span-1">
          <img src="/logo-dark.png" alt="Thomex" className="h-6 sm:h-8 w-auto mb-3" />
          <p className="text-gray-300">Your one-stop shop for the latest tech gadgets. Quality products, best prices, fast delivery.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2 sm:mb-3">Shop</h4>
          <ul className="space-y-1.5 sm:space-y-2 text-gray-300">
            <li><a href="/shop">All Products</a></li>
            <li><a href="/shop">New Arrivals</a></li>
            <li><a href="/shop">Best Sellers</a></li>
            <li><a href="/shop">Deals & Offers</a></li>
          </ul>
        </div>
         <div>
          <h4 className="font-semibold mb-2 sm:mb-3">Customer Care</h4>
          <ul className="space-y-1.5 sm:space-y-2 text-gray-300">
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/track-order">Track Your Order</a></li>
            <li><a href="/shipping">Shipping & Delivery</a></li>
            <li><a href="/returns">Returns & Refunds</a></li>
            <li><a href="/faq">FAQs</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
            <li><a href="/sell" className="font-semibold text-white">Sell on Thomex</a></li>
          </ul>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <h4 className="font-semibold mb-2 sm:mb-3">Stay Updated</h4>
          <p className="text-gray-300 mb-3">Get special offers and the latest tech deals.</p>

          {status === "done" ? (
            <p className="text-sm text-green-400 font-semibold flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              You're subscribed!
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-l-md text-black text-xs sm:text-sm focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "saving"}
                className="bg-brand px-3 sm:px-4 rounded-r-md text-xs sm:text-sm font-semibold shrink-0 disabled:opacity-60"
              >
                {status === "saving" ? "..." : "Subscribe"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="text-xs text-red-300 mt-1.5">Something went wrong — please try again.</p>
          )}
        </div>
       </div>
      <div className="border-t border-white/10 max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">We Accept</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-white/10 rounded-md px-3 py-1.5 text-xs font-bold text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            M-Pesa
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 rounded-md px-3 py-1.5 text-xs font-bold text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="7" width="15" height="13" rx="2" />
              <path d="M16 8h4l3 3v5h-7V8Z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            Pay on Delivery
          </span>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-[10px] sm:text-xs text-gray-400 py-4 px-4">
        © 2026 Thomex. All Rights Reserved.
      </div>
    </footer>
  );
}

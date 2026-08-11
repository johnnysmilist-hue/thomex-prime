"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6 text-black dark:text-white">Your Wishlist</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Your wishlist is empty.</p>
            <a href="/shop" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-400 text-[10px] shrink-0">
                  Image
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black dark:text-white truncate">{item.name}</p>
                  <p className="text-brand font-bold text-sm">${item.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                  className="bg-brand text-white text-xs font-semibold px-4 py-2 rounded-full shrink-0"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="text-red-500 text-xs font-semibold shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

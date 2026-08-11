"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeFromCart, updateQty, totalPrice } = useCart();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6 text-black dark:text-white">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty.</p>
            <a href="/shop" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
              Continue Shopping
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
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
                  <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="px-3 py-1 text-lg text-black dark:text-white"
                    >
                      -
                    </button>
                    <span className="px-3 text-black dark:text-white">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="px-3 py-1 text-lg text-black dark:text-white"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-black dark:text-white w-16 text-right shrink-0">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 text-xs font-semibold shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-5 flex items-center justify-between">
              <span className="text-lg font-bold text-black dark:text-white">
                Total: ${totalPrice.toFixed(2)}
              </span>
              <Link
                href="/checkout"
                className="bg-brand text-white px-6 py-3 rounded-md font-semibold hover:bg-brand-dark transition-colors"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}

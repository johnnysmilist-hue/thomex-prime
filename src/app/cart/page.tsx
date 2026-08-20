"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";

export default function CartPage() {
  const { items, removeFromCart, updateQty, totalPrice } = useCart();
  const { format } = useCurrency();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-lg font-bold mb-4 text-black dark:text-white">Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty.</p>
            <a href="/shop" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
              Continue Shopping
            </a>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Cart Summary</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">Cart ({items.length})</span>
                <span className="font-semibold text-black dark:text-white">{format(totalPrice)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex justify-between">
                <span className="font-bold text-black dark:text-white">Subtotal</span>
                <span className="font-bold text-black dark:text-white">{format(totalPrice)}</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-b border-gray-100 dark:border-gray-800 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 py-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-400 text-[10px] shrink-0">
                    Image
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white line-clamp-2 mb-1">{item.name}</p>
                    <p className="text-brand font-bold text-sm mb-2">{format(item.price)}</p>
                    <div className="flex items-center justify-between">
                      <button onClick={() => removeFromCart(item.id)} className="text-xs font-semibold text-brand">
                        Remove
                      </button>
                      <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2.5 py-1 text-black dark:text-white">-</button>
                        <span className="px-3 text-sm text-black dark:text-white">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2.5 py-1 text-black dark:text-white">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center bg-brand text-white py-3 rounded-md font-semibold hover:bg-brand-dark transition-colors"
            >
              Checkout ({format(totalPrice)})
            </Link>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}

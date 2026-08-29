"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";

export default function CartPage() {
  const { items, removeFromCart, updateQty, totalPrice } = useCart();
  const { format } = useCurrency();
  const [coupon, setCoupon] = useState("");

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {items.length === 0 ? (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty.</p>
          <a href="/shop" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
            Continue Shopping
          </a>
        </div>
      ) : (
        <>
          {/* Desktop table layout */}
          <div className="hidden md:block max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-1 text-black dark:text-white">Shopping Cart</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Review your items before checkout.</p>

            <div className="grid grid-cols-3 gap-10">
              <div className="col-span-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-200 dark:border-gray-800">
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 font-semibold">Quantity</th>
                      <th className="pb-3 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden shrink-0">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">Image</div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-black dark:text-white">{item.name}</p>
                              <p className="text-gray-500 dark:text-gray-400">{format(item.price)}</p>
                              <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 mt-1">Remove</button>
                            </div>
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="inline-flex items-center border border-gray-300 dark:border-gray-700 rounded-full">
                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center text-black dark:text-white">-</button>
                            <span className="px-3 text-black dark:text-white">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center text-black dark:text-white">+</button>
                          </div>
                        </td>
                        <td className="py-5 text-right font-bold text-brand">{format(item.price * item.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <a href="/shop" className="inline-flex items-center gap-1 text-sm text-brand font-semibold mt-6">
                  ← Continue Shopping
                </a>
              </div>

              <div>
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-4">
                  <p className="font-bold text-black dark:text-white mb-4">Order Summary</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Subtotal</span>
                      <span>{format(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Shipping</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">Free</span>
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mb-5">
                    <span className="font-bold text-black dark:text-white">Total</span>
                    <span className="font-bold text-xl text-brand">{format(totalPrice)}</span>
                  </div>

                  <div className="flex gap-2 mb-5">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm"
                    />
                    <button className="border border-gray-300 dark:border-gray-700 text-black dark:text-white px-4 rounded-md text-sm font-semibold">
                      Apply
                    </button>
                  </div>

                  <Link href="/checkout" className="block text-center bg-brand text-white py-3 rounded-md font-semibold hover:bg-brand-dark transition-colors">
                    Proceed to Checkout
                  </Link>
                </div>

                <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-bold text-black dark:text-white">Thomex Buyer Guarantee</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pay on delivery — you only pay once you've received and checked your order.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile compact layout */}
          <div className="md:hidden max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-lg font-bold mb-4 text-black dark:text-white">Cart</h1>

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
                      <button onClick={() => removeFromCart(item.id)} className="text-xs font-semibold text-brand">Remove</button>
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

            <Link href="/checkout" className="block w-full text-center bg-brand text-white py-3 rounded-md font-semibold hover:bg-brand-dark transition-colors">
              Checkout ({format(totalPrice)})
            </Link>
          </div>
        </>
      )}

      <Footer />
    </main>
  );
}

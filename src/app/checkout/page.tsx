"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const whatsappNumber = "254700123456";

  const buildMessage = () => {
    let msg = "New Order from Thomex website%0A%0A";
    msg += "Name: " + encodeURIComponent(name) + "%0A";
    msg += "Phone: " + encodeURIComponent(phone) + "%0A";
    msg += "Address: " + encodeURIComponent(address) + "%0A%0A";
    msg += "Items:%0A";
    items.forEach((item) => {
      msg += "- " + encodeURIComponent(item.name) + " x" + item.qty + " ($" + (item.price * item.qty).toFixed(2) + ")%0A";
    });
    msg += "%0ATotal: $" + totalPrice.toFixed(2) + "%0A";
    if (notes.trim()) {
      msg += "%0ANotes: " + encodeURIComponent(notes);
    }
    return msg;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const url = "https://wa.me/" + whatsappNumber + "?text=" + buildMessage();
    window.open(url, "_blank");
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6 text-black dark:text-white">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty.</p>
            <a href="/shop" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <h2 className="text-sm font-bold text-black dark:text-white">Delivery Details</h2>
              <input
                type="text"
                required
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand"
              />
              <input
                type="tel"
                required
                placeholder="Phone number (for delivery & M-Pesa)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand"
              />
              <textarea
                required
                placeholder="Delivery address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand resize-none"
              />
              <textarea
                placeholder="Order notes (optional)"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand resize-none"
              />

              <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4">
                <p className="text-sm font-semibold text-black dark:text-white mb-1">Payment Method</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pay on Delivery (M-Pesa or cash)</p>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
              >
                Place Order via WhatsApp
              </button>
            </form>

            <div>
              <h2 className="text-sm font-bold mb-4 text-black dark:text-white">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.name} x{item.qty}
                    </span>
                    <span className="text-black dark:text-white font-medium">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between">
                <span className="font-bold text-black dark:text-white">Total</span>
                <span className="font-bold text-brand">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

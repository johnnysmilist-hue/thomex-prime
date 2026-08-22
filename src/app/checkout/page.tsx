"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { fetchSettings } from "@/lib/supabaseSettings";
import { validateCoupon, incrementCouponUsage, Coupon } from "@/lib/supabaseCoupons";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [error, setError] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("254781102057");
  const [adminEmail, setAdminEmail] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const finalTotal = Math.max(totalPrice - discountAmount, 0);

  useEffect(() => {
    fetchSettings().then((r) => {
      if (r.data?.whatsapp_number) setWhatsappNumber(r.data.whatsapp_number);
      if (r.data?.support_email) setAdminEmail(r.data.support_email);
    });
  }, []);

  const generateOrderCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return "THX-" + random;
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponInput.trim()) return;

    setCheckingCoupon(true);
    const result = await validateCoupon(couponInput, totalPrice);
    setCheckingCoupon(false);

    if (!result.valid) {
      setCouponError(result.message);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return;
    }

    setAppliedCoupon(result.coupon);
    setDiscountAmount(result.discountAmount);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput("");
    setCouponError("");
  };

  const buildWhatsAppMessage = (code: string) => {
    let msg = "New Order from Thomex website%0A%0A";
    msg += "Order Code: " + code + "%0A";
    msg += "Name: " + encodeURIComponent(name) + "%0A";
    msg += "Phone: " + encodeURIComponent(phone) + "%0A";
    msg += "Address: " + encodeURIComponent(address) + "%0A%0A";
    msg += "Items:%0A";
    items.forEach((item) => {
      msg += "- " + encodeURIComponent(item.name) + " x" + item.qty + " ($" + (item.price * item.qty).toFixed(2) + ")%0A";
    });
    if (appliedCoupon) {
      msg += "%0ACoupon: " + appliedCoupon.code + " (-$" + discountAmount.toFixed(2) + ")%0A";
    }
    msg += "%0ATotal: $" + finalTotal.toFixed(2) + "%0A";
    if (notes.trim()) {
      msg += "%0ANotes: " + encodeURIComponent(notes);
    }
    return msg;
  };

  const sendOrderEmail = async (code: string) => {
    const recipients = [adminEmail, email].filter(Boolean);
    if (recipients.length === 0) return;

    try {
      await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipients,
          orderCode: code,
          customerName: name,
          items,
          total: finalTotal,
          address,
          phone,
        }),
      });
    } catch {
      // Non-fatal — order already saved, email is a bonus notification
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const code = generateOrderCode();

    const { error: dbError } = await supabase.from("orders").insert({
      order_code: code,
      customer_name: name,
      phone: phone,
      address: address,
      items: items,
      total: finalTotal,
      notes: notes || null,
      user_id: user ? user.id : null,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      discount_amount: discountAmount || null,
    });

    if (dbError) {
      setLoading(false);
      setError("Something went wrong saving your order. Please try again.");
      return;
    }

    if (appliedCoupon) {
      await incrementCouponUsage(appliedCoupon.id, appliedCoupon.uses_count);
    }

    await sendOrderEmail(code);

    setLoading(false);
    setOrderCode(code);
    clearCart();

    const url = "https://wa.me/" + whatsappNumber + "?text=" + buildWhatsAppMessage(code);
    window.open(url, "_blank");
  };

  if (orderCode) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-green-600 dark:text-green-400 font-semibold mb-2">Order placed successfully!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your order code:</p>
          <p className="text-2xl font-bold text-brand mb-6">{orderCode}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Save this code to track your order status anytime.
          </p>
          <a href={"/track?code=" + orderCode} className="inline-block bg-brand text-white px-6 py-2 rounded-md font-semibold">
            Track This Order
          </a>
        </div>
        <Footer />
      </main>
    );
  }

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
              <input
                type="email"
                placeholder="Email (optional, for order confirmation)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                                {loading ? "Placing order..." : "Place Order"}
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

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md px-3 py-2">
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                      {appliedCoupon.code} applied (-${discountAmount.toFixed(2)})
                    </span>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-500 font-semibold">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-3 py-2 text-sm uppercase focus:outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={checkingCoupon}
                        className="bg-gray-900 dark:bg-white dark:text-black text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
                      >
                        {checkingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="text-black dark:text-white">${totalPrice.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">Discount</span>
                    <span className="text-green-600 dark:text-green-400">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex justify-between">
                  <span className="font-bold text-black dark:text-white">Total</span>
                  <span className="font-bold text-brand">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { fetchSettings } from "@/lib/supabaseSettings";
import { validateCoupon, incrementCouponUsage, Coupon } from "@/lib/supabaseCoupons";
import { createNotification, ADMIN_RECIPIENT_ID } from "@/lib/supabaseNotifications";
import { fetchShippingRates, ShippingRate } from "@/lib/supabaseShipping";

type PaymentMethod = "mpesa" | "cod";
type MpesaStatus = "idle" | "requesting" | "polling" | "paid" | "failed";

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand text-white text-xs font-bold shrink-0">
      {n}
    </span>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [county, setCounty] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [error, setError] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("254781102057");
  const [adminEmail, setAdminEmail] = useState("");

  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const shippingFee = shippingRates.find((r) => r.county === county)?.fee || 0;

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [mpesaStatus, setMpesaStatus] = useState<MpesaStatus>("idle");
  const [mpesaError, setMpesaError] = useState("");
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAttempts = useRef(0);

  const finalTotal = Math.max(totalPrice + shippingFee - discountAmount, 0);

  useEffect(() => {
    fetchSettings().then((r) => {
      if (r.data?.whatsapp_number) setWhatsappNumber(r.data.whatsapp_number);
      if (r.data?.support_email) setAdminEmail(r.data.support_email);
    });
    fetchShippingRates().then((r) => {
      setShippingRates((r.data as ShippingRate[]) || []);
    });
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
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

  const buildWhatsAppMessage = (code: string, method: PaymentMethod) => {
    let msg = "New Order from Thomex website%0A%0A";
    msg += "Order Code: " + code + "%0A";
    msg += "Name: " + encodeURIComponent(name) + "%0A";
    msg += "Phone: " + encodeURIComponent(phone) + "%0A";
    msg += "County: " + encodeURIComponent(county) + "%0A";
    msg += "Address: " + encodeURIComponent(address) + "%0A%0A";
    msg += "Items:%0A";
    items.forEach((item) => {
      msg += "- " + encodeURIComponent(item.name) + " x" + item.qty + " ($" + (item.price * item.qty).toFixed(2) + ")%0A";
    });
    msg += "%0AShipping: $" + shippingFee.toFixed(2) + "%0A";
    if (appliedCoupon) {
      msg += "Coupon: " + appliedCoupon.code + " (-$" + discountAmount.toFixed(2) + ")%0A";
    }
    msg += "%0ATotal: $" + finalTotal.toFixed(2) + "%0A";
    msg += "Payment: " + (method === "mpesa" ? "Paid via M-Pesa" : "Pay on Delivery") + "%0A";
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

  const finishSuccessfulOrder = async (code: string, method: PaymentMethod) => {
    await sendOrderEmail(code);
    await createNotification({
      recipient_type: "admin",
      recipient_id: ADMIN_RECIPIENT_ID,
      title: "New order received",
      body: name + " placed order " + code + " — KSh " + finalTotal.toFixed(2) + " (" + (method === "mpesa" ? "M-Pesa" : "Pay on Delivery") + ")",
    });
    setOrderCode(code);
    clearCart();
    const url = "https://wa.me/" + whatsappNumber + "?text=" + buildWhatsAppMessage(code, method);
    window.open(url, "_blank");
  };

  const pollPaymentStatus = (orderId: string, code: string) => {
    pollAttempts.current = 0;
    pollTimer.current = setInterval(async () => {
      pollAttempts.current += 1;

      try {
        const res = await fetch("/api/mpesa/status?orderId=" + orderId);
        const data = await res.json();

        if (data.status === "paid") {
          if (pollTimer.current) clearInterval(pollTimer.current);
          setMpesaStatus("paid");
          setLoading(false);
          await finishSuccessfulOrder(code, "mpesa");
          return;
        }

        if (data.status === "failed") {
          if (pollTimer.current) clearInterval(pollTimer.current);
          setMpesaStatus("failed");
          setMpesaError("Payment was not completed. You can try again or choose Pay on Delivery.");
          setLoading(false);
          return;
        }
      } catch {
        // transient — keep polling
      }

      if (pollAttempts.current >= 20) {
        if (pollTimer.current) clearInterval(pollTimer.current);
        setMpesaStatus("failed");
        setMpesaError("We didn't get confirmation in time. Check your phone, or try again.");
        setLoading(false);
      }
    }, 3000);
  };

  const notifyVendorsOfNewOrder = async (code: string) => {
    const productIds = items.map((i) => i.id).filter(Boolean);
    if (productIds.length === 0) return;

    const { data: productsData } = await supabase
      .from("products")
      .select("id, store_id")
      .in("id", productIds);

    const storeIds = new Set(
      (productsData || []).map((p: { store_id: string | null }) => p.store_id).filter((id): id is string => Boolean(id))
    );

    await Promise.all(
      Array.from(storeIds).map((storeId) =>
        createNotification({
          recipient_type: "vendor",
          recipient_id: storeId,
          title: "New order received",
          body: "Order " + code + " includes one or more of your products.",
        })
      )
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMpesaError("");

    if (!county) {
      setError("Please select your delivery county.");
      return;
    }

    setLoading(true);

    const code = generateOrderCode();

    const { data: inserted, error: dbError } = await supabase
      .from("orders")
      .insert({
        order_code: code,
        customer_name: name,
        phone: phone,
        address: address,
        county: county,
        shipping_fee: shippingFee,
        items: items,
        total: finalTotal,
        notes: notes || null,
        user_id: user ? user.id : null,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        discount_amount: discountAmount || null,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "cod" : "pending",
      })
      .select()
      .single();

    if (dbError || !inserted) {
      setLoading(false);
      setError("Something went wrong saving your order. Please try again.");
      return;
    }

    if (appliedCoupon) {
      await incrementCouponUsage(appliedCoupon.id, appliedCoupon.uses_count);
    }

    await notifyVendorsOfNewOrder(code);

    if (paymentMethod === "cod") {
      setLoading(false);
      await finishSuccessfulOrder(code, "cod");
      return;
    }

    // M-Pesa STK Push flow
    setMpesaStatus("requesting");

    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: inserted.id,
          orderCode: code,
          phone,
          amount: finalTotal,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMpesaStatus("failed");
        setMpesaError(data.error || "Could not start M-Pesa payment. Please try again.");
        setLoading(false);
        return;
      }

      setMpesaStatus("polling");
      pollPaymentStatus(inserted.id, code);
    } catch {
      setMpesaStatus("failed");
      setMpesaError("Could not reach M-Pesa. Check your connection and try again.");
      setLoading(false);
    }
  };

  const handleRetryMpesa = () => {
    setMpesaStatus("idle");
    setMpesaError("");
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
          <a href="/track-order" className="inline-block bg-brand text-white px-6 py-2 rounded-md font-semibold">
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
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-black dark:text-white">Checkout</h1>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure Checkout
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Complete your purchase securely.</p>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty.</p>
            <a href="/shop" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Section 1: Contact + Shipping */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <StepBadge n={1} />
                  <h2 className="text-sm font-bold text-black dark:text-white">Contact & Shipping</h2>
                </div>
                <div className="space-y-3 pl-8">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="text"
                      required
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      type="tel"
                      required
                      placeholder="Phone number (for delivery & M-Pesa)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-10 5L2 7" />
                    </svg>
                    <input
                      type="email"
                      placeholder="Email (optional, for order confirmation)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md text-sm focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <select
                      required
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md text-sm focus:outline-none focus:border-brand appearance-none"
                    >
                      <option value="">Select your county</option>
                      {shippingRates.map((r) => (
                        <option key={r.id} value={r.county}>{r.county}</option>
                      ))}
                    </select>
                  </div>
                  {county && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                      Shipping to {county}: <strong>KSh {shippingFee.toFixed(2)}</strong>
                    </p>
                  )}

                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3 text-gray-400">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <textarea
                      required
                      placeholder="Delivery address (street, building, landmark)"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md text-sm focus:outline-none focus:border-brand resize-none"
                    />
                  </div>
                  <textarea
                    placeholder="Order notes (optional)"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md text-sm focus:outline-none focus:border-brand resize-none"
                  />
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <StepBadge n={2} />
                  <h2 className="text-sm font-bold text-black dark:text-white">Payment Method</h2>
                </div>

                <div className="pl-8 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("mpesa");
                        setMpesaStatus("idle");
                        setMpesaError("");
                      }}
                      className={
                        "flex flex-col items-center gap-2 border rounded-lg p-4 transition-colors " +
                        (paymentMethod === "mpesa"
                          ? "border-brand ring-1 ring-brand bg-brand/5"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800")
                      }
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <rect x="5" y="2" width="14" height="20" rx="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                      <span className="text-xs font-semibold text-black dark:text-white">M-Pesa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("cod");
                        setMpesaStatus("idle");
                        setMpesaError("");
                      }}
                      className={
                        "flex flex-col items-center gap-2 border rounded-lg p-4 transition-colors " +
                        (paymentMethod === "cod"
                          ? "border-brand ring-1 ring-brand bg-brand/5"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800")
                      }
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
                        <rect x="1" y="7" width="15" height="13" rx="2" />
                        <path d="M16 8h4l3 3v5h-7V8Z" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      <span className="text-xs font-semibold text-black dark:text-white">Pay on Delivery</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {paymentMethod === "mpesa"
                      ? "You'll get a prompt on your phone to enter your M-Pesa PIN."
                      : "Cash or M-Pesa when your order arrives."}
                  </p>

                  {paymentMethod === "mpesa" && mpesaStatus === "polling" && (
                    <div className="bg-brand/5 border border-brand/20 rounded-md px-3 py-2.5 flex items-center gap-2.5">
                      <svg className="animate-spin h-4 w-4 text-brand shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-xs text-black dark:text-white">Check your phone and enter your M-Pesa PIN to complete payment...</span>
                    </div>
                  )}

                  {paymentMethod === "mpesa" && mpesaStatus === "failed" && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md px-3 py-2.5">
                      <p className="text-xs text-red-600 dark:text-red-400 mb-2">{mpesaError}</p>
                      <button type="button" onClick={handleRetryMpesa} className="text-xs font-semibold text-brand">
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-xs text-red-500 pl-8">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {loading
                  ? mpesaStatus === "polling"
                    ? "Waiting for M-Pesa..."
                    : "Processing..."
                  : paymentMethod === "mpesa"
                  ? "Pay with M-Pesa"
                  : "Place Order"}
              </button>
              <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Your data is safe and encrypted
              </p>
            </form>

            <div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                <p className="text-sm font-bold mb-4 text-black dark:text-white">Order Summary</p>
                <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[9px]">Image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-black dark:text-white font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm text-black dark:text-white font-semibold shrink-0">
                        ${(item.price * item.qty).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-4">
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

                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="text-black dark:text-white">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Shipping{county ? " (" + county + ")" : ""}</span>
                    <span className="text-black dark:text-white">
                      {county ? "$" + shippingFee.toFixed(2) : "Select county"}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Discount</span>
                      <span className="text-green-600 dark:text-green-400">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex justify-between">
                    <span className="font-bold text-black dark:text-white">Total</span>
                    <span className="font-bold text-brand text-lg">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                    </svg>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Secure Checkout</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                      <rect x="1" y="3" width="15" height="13" rx="2" />
                      <path d="M16 8h4l3 3v5h-7V8Z" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Nationwide Delivery</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Easy Returns</span>
                  </div>
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

"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { useAuth } from "@/context/AuthContext";
import {
  fetchPaymentMethods,
  addCardPaymentMethod,
  deletePaymentMethod,
  detectCardBrand,
  PaymentMethod,
} from "@/lib/supabasePaymentMethods";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
      <span className="w-1.5 h-5 rounded-full bg-brand inline-block" />
      {children}
    </h2>
  );
}

// Falls back to a plain text badge if the logo file hasn't been added yet at
// public/payment-logos/<file> — so the page still works before/without it.
function BrandLogo({ src, alt, fallback }: { src: string; alt: string; fallback: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) return <span className="font-bold text-gray-500 text-xs">{fallback}</span>;
  return <img src={src} alt={alt} className="max-h-6 max-w-[40px] object-contain" onError={() => setErrored(true)} />;
}

export default function PaymentMethodsPage() {
  const { user, loading: authLoading } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async (userId: string) => {
    setLoading(true);
    const { data } = await fetchPaymentMethods(userId);
    setMethods(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) return;

    const digits = cardNumber.replace(/\s/g, "");
    const [monthStr, yearStr] = expiry.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt("20" + (yearStr || ""), 10);

    if (!cardholderName.trim() || digits.length < 12 || !month || !year || cvv.length < 3) {
      setError("Please fill in all fields correctly.");
      return;
    }

    setSaving(true);
    const { error: dbErr } = await addCardPaymentMethod({
      user_id: user.id,
      brand: detectCardBrand(digits),
      last4: digits.slice(-4),
      expiry_month: month,
      expiry_year: year,
      cardholder_name: cardholderName,
    });
    setSaving(false);

    if (dbErr) {
      setError("Something went wrong saving this card.");
      return;
    }

    setCardholderName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setShowForm(false);
    load(user.id);
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Remove this payment method?")) return;
    await deletePaymentMethod(id);
    load(user.id);
  };

  const brandLogo = (brand: string | null) => {
    if (brand === "Visa") return <BrandLogo src="/payment-logos/visa.png" alt="Visa" fallback="VISA" />;
    if (brand === "Mastercard") return <BrandLogo src="/payment-logos/mastercard.png" alt="Mastercard" fallback="MC" />;
    return <span className="font-bold text-gray-500 text-xs">Card</span>;
  };

  const inputClass = "w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

  if (authLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-400">Loading...</div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You&apos;re not signed in.</p>
          <a href="/signin" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">Sign In</a>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        <AccountSidebar />

        <div className="flex-1 min-w-0 space-y-4">
          <SectionTitle>Payment Methods</SectionTitle>

          <Card>
            <div className="flex items-center justify-between py-1">
              <BrandLogo src="/payment-logos/paypal.png" alt="PayPal" fallback="PayPal" />
              <span className="text-xs font-semibold text-gray-400">Not available yet</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between py-1">
              <BrandLogo src="/payment-logos/gpay.png" alt="Google Pay" fallback="Google Pay" />
              <span className="text-xs font-semibold text-gray-400">Not available yet</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between py-1">
              <BrandLogo src="/payment-logos/mpesa.png" alt="M-Pesa" fallback="M-Pesa" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">Available at checkout</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between py-1">
              <BrandLogo src="/payment-logos/airtel-money.png" alt="Airtel Money" fallback="Airtel Money" />
              <span className="text-xs font-semibold text-gray-400">Not available yet</span>
            </div>
          </Card>

          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            methods.map((m) => (
              <Card key={m.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-7 rounded bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                      {brandLogo(m.brand)}
                    </div>
                    <span className="text-sm text-black dark:text-white tracking-widest">
                      •••• •••• •••• {m.last4}
                    </span>
                    <span className="text-xs text-gray-400">{String(m.expiry_month).padStart(2, "0")}/{String(m.expiry_year).slice(-2)}</span>
                  </div>
                  <button onClick={() => handleDelete(m.id)} className="text-xs font-semibold text-red-500">Delete</button>
                </div>
              </Card>
            ))
          )}

          <Card>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-sm font-semibold text-black dark:text-white">
              <span className={"w-4 h-4 rounded-full border-2 " + (showForm ? "bg-brand border-brand" : "border-gray-300")} />
              Add New Credit/Debit Card
            </button>

            {showForm && (
              <form onSubmit={handleAddCard} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Card Holder Name *</label>
                  <input required placeholder="Ex. John Doe" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Card Number *</label>
                  <input required placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} maxLength={19} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Expiry Date *</label>
                    <input required placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} maxLength={5} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">CVV *</label>
                    <input required type="password" placeholder="000" value={cvv} onChange={(e) => setCvv(e.target.value)} maxLength={4} className={inputClass} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="accent-brand" />
                  Save card for future payments
                </label>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button type="submit" disabled={saving} className="bg-brand hover:bg-brand-dark transition-colors text-white px-6 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60">
                  {saving ? "Adding..." : "Add Card"}
                </button>
              </form>
            )}
          </Card>

          <p className="text-xs text-gray-400 leading-relaxed">
            For your security, we only store your card brand, last 4 digits, and expiry date — never your full card number or CVV.
            Real charging requires connecting a payment processor like Stripe or Flutterwave.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}

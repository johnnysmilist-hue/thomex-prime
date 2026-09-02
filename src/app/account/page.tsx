"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { fetchAddresses, addAddress, deleteAddress, setDefaultAddress, Address } from "@/lib/supabaseAddresses";
import {
  fetchPaymentMethods,
  addCardPaymentMethod,
  deletePaymentMethod,
  detectCardBrand,
  PaymentMethod,
} from "@/lib/supabasePaymentMethods";

type Tab = "personal" | "address" | "payment" | "password";

const tabs: { key: Tab; label: string }[] = [
  { key: "personal", label: "Personal Information" },
  { key: "address", label: "Manage Address" },
  { key: "payment", label: "Payment Method" },
  { key: "password", label: "Password Manager" },
];

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("personal");

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You're not signed in.</p>
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
        <aside className="w-full md:w-64 shrink-0 space-y-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                "w-full text-left px-5 py-4 rounded-lg text-sm font-semibold transition-colors " +
                (tab === t.key
                  ? "bg-amber-400 text-black"
                  : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800")
              }
            >
              {t.label}
            </button>
          ))}
          <a
            href="/account/orders"
            className="block w-full text-left px-5 py-4 rounded-lg text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            My Orders
          </a>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-5 py-4 rounded-lg text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Logout
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          {tab === "personal" && <PersonalInfoTab userId={user.id} email={user.email || ""} username={user.user_metadata?.username || ""} />}
          {tab === "address" && <AddressTab userId={user.id} />}
          {tab === "payment" && <PaymentTab userId={user.id} />}
          {tab === "password" && <PasswordTab />}
        </div>
      </div>
      <Footer />
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">{children}</div>;
}

function PersonalInfoTab({ userId, email, username }: { userId: string; email: string; username: string }) {
  const [name, setName] = useState(username);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.auth.updateUser({ data: { username: name } });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <h2 className="text-lg font-bold text-black dark:text-white mb-4">Personal Information</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg px-4 py-2 text-sm cursor-not-allowed"
          />
        </div>
        <button type="submit" disabled={saving} className="bg-amber-400 text-black px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && <span className="ml-3 text-xs text-green-600 dark:text-green-400">Saved</span>}
      </form>
    </Card>
  );
}

function AddressTab({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await fetchAddresses(userId);
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await addAddress({
      user_id: userId,
      label,
      full_name: fullName,
      phone,
      address_line: addressLine,
      city,
      is_default: addresses.length === 0,
    });
    setSaving(false);
    setShowForm(false);
    setLabel("Home");
    setFullName("");
    setPhone("");
    setAddressLine("");
    setCity("");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await deleteAddress(id);
    load();
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(userId, id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-black dark:text-white">Manage Address</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-bold">
          {showForm ? "Cancel" : "+ Add Address"}
        </button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select value={label} onChange={(e) => setLabel(e.target.value)} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm">
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
              <input required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            </div>
            <input required placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            <input required placeholder="Address" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            <input required placeholder="Town / City" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            <button type="submit" disabled={saving} className="bg-amber-400 text-black px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-60">
              {saving ? "Saving..." : "Save Address"}
            </button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : addresses.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">No saved addresses yet.</p>
        </Card>
      ) : (
        addresses.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                  {a.label}
                  {a.is_default && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">DEFAULT</span>}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{a.full_name} • {a.phone}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{a.address_line}, {a.city}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                {!a.is_default && (
                  <button onClick={() => handleSetDefault(a.id)} className="text-xs font-semibold text-brand">Set Default</button>
                )}
                <button onClick={() => handleDelete(a.id)} className="text-xs font-semibold text-red-500">Delete</button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

function PaymentTab({ userId }: { userId: string }) {
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

  const load = async () => {
    setLoading(true);
    const { data } = await fetchPaymentMethods(userId);
    setMethods(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const digits = cardNumber.replace(/\s/g, "");
    const [monthStr, yearStr] = expiry.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt("20" + (yearStr || ""), 10);

    if (!cardholderName.trim() || digits.length < 12 || !month || !year || cvv.length < 3) {
      setError("Please fill in all fields correctly.");
      return;
    }

    setSaving(true);
    // Only the brand, last 4 digits, expiry, and name are saved — the full
    // card number and CVV are used only to derive these and are never sent
    // anywhere or stored.
    const { error: dbErr } = await addCardPaymentMethod({
      user_id: userId,
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
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this payment method?")) return;
    await deletePaymentMethod(id);
    load();
  };

  const cardIcon = (brand: string | null) => {
    if (brand === "Visa") return <span className="font-black italic text-blue-700">VISA</span>;
    if (brand === "Mastercard") return <span className="font-black text-orange-500">MC</span>;
    if (brand === "Amex") return <span className="font-black text-blue-500">AMEX</span>;
    return <span className="font-bold text-gray-500">Card</span>;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-black dark:text-white">Payment Method</h2>

      <Card>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <span className="text-blue-600 font-black text-lg italic">Pay</span><span className="text-sky-500 font-black text-lg italic -ml-1">Pal</span>
          </div>
          <span className="text-xs font-semibold text-gray-400">Not available yet</span>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-red-500">G</span><span className="text-blue-500">o</span><span className="text-yellow-500">o</span><span className="text-red-500">g</span><span className="text-green-500">l</span><span className="text-blue-500">e</span>
            <span className="text-gray-600 dark:text-gray-300 font-semibold ml-1">Pay</span>
          </div>
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
                {cardIcon(m.brand)}
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
          <span className={"w-4 h-4 rounded-full border-2 border-gray-300 " + (showForm ? "bg-amber-400 border-amber-400" : "")} />
          Add New Credit/Debit Card
        </button>

        {showForm && (
          <form onSubmit={handleAddCard} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Card Holder Name *</label>
              <input required placeholder="Ex. John Doe" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Card Number *</label>
              <input required placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} maxLength={19} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Expiry Date *</label>
                <input required placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} maxLength={5} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">CVV *</label>
                <input required type="password" placeholder="000" value={cvv} onChange={(e) => setCvv(e.target.value)} maxLength={4} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="accent-amber-400" />
              Save card for future payments
            </label>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button type="submit" disabled={saving} className="bg-[#3a2418] text-white px-6 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60">
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
  );
}

function PasswordTab() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const { error: authErr } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (authErr) {
      setError(authErr.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Card>
      <h2 className="text-lg font-bold text-black dark:text-white mb-4">Password Manager</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-2 text-sm"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {success && <p className="text-xs text-green-600 dark:text-green-400">Password updated successfully.</p>}
        <button type="submit" disabled={saving} className="bg-amber-400 text-black px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-60">
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </Card>
  );
}

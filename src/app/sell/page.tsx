"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { fetchStoreByOwner, applyAsStore, Store } from "@/lib/supabaseStores";

export default function SellPage() {
  const { user, loading: authLoading } = useAuth();
  const [existingStore, setExistingStore] = useState<Store | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    fetchStoreByOwner(user.id).then((r) => {
      setExistingStore(r.data);
      setChecking(false);
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");

    const { data, error: applyError } = await applyAsStore({
      owner_id: user.id,
      name,
      description,
      logo_url: null,
      contact_email: contactEmail,
      contact_phone: contactPhone,
    });

    setSubmitting(false);

    if (applyError || !data) {
      setError("Could not submit your application. Please try again.");
      return;
    }

    setExistingStore(data);
  };

  if (authLoading || checking) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-gray-400">Loading...</div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h1 className="text-xl font-bold mb-2 text-black dark:text-white">Sell on Thomex</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sign in first to apply as a store.</p>
          <a href="/signin" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">Sign In</a>
        </div>
        <Footer />
      </main>
    );
  }

  if (existingStore) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h1 className="text-xl font-bold mb-4 text-black dark:text-white">{existingStore.name}</h1>
          {existingStore.status === "Pending" && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Your application is pending review. We'll notify you once it's approved.
            </p>
          )}
          {existingStore.status === "Approved" && (
            <>
              <p className="text-sm text-green-600 dark:text-green-400 mb-4">Your store is approved and live!</p>
              <a href="/vendor" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">Go to Vendor Dashboard</a>
            </>
          )}
          {existingStore.status === "Rejected" && (
            <p className="text-sm text-red-500">
              Your application wasn't approved this time. Contact support for details.
            </p>
          )}
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-xl font-bold mb-2 text-black dark:text-white text-center">Sell on Thomex</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center">
          Apply to open your own store. We review every application before it goes live.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Store name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
          <textarea required placeholder="Tell us about your store" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm resize-none" />
          <input required type="email" placeholder="Contact email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
          <input required type="tel" placeholder="Contact phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full bg-brand text-white py-3 rounded-md font-semibold disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
      <Footer />
    </main>
  );
}

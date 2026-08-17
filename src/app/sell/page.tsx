"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { fetchStoreByOwner, applyAsStore, uploadStoreDocument, Store } from "@/lib/supabaseStores";

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

  const [idDocUrl, setIdDocUrl] = useState("");
  const [businessDocUrl, setBusinessDocUrl] = useState("");
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingBusiness, setUploadingBusiness] = useState(false);

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

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(true);
    const { url, error: uploadError } = await uploadStoreDocument(file);
    setUploadingId(false);
    if (uploadError || !url) {
      setError("ID document upload failed. Please try again.");
      return;
    }
    setIdDocUrl(url);
  };

  const handleBusinessUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBusiness(true);
    const { url, error: uploadError } = await uploadStoreDocument(file);
    setUploadingBusiness(false);
    if (uploadError || !url) {
      setError("Business document upload failed. Please try again.");
      return;
    }
    setBusinessDocUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!idDocUrl) {
      setError("Please upload a valid ID document before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    const { data, error: applyError } = await applyAsStore({
      owner_id: user.id,
      name,
      description,
      logo_url: null,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      id_document_url: idDocUrl,
      business_document_url: businessDocUrl || null,
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
              Your application and documents are under review. We'll notify you once it's approved.
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
          Apply to open your own store. We review every application, including your documents, before it goes live.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Store name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
          <textarea required placeholder="Tell us about your store" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm resize-none" />
          <input required type="email" placeholder="Contact email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />
          <input required type="tel" placeholder="Contact phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm" />

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">National ID / Passport (required)</label>
            <input type="file" accept="image/*,.pdf" onChange={handleIdUpload} className="text-sm text-black dark:text-white" />
            {uploadingId && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
            {idDocUrl && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Uploaded ✓</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Business Registration (optional)</label>
            <input type="file" accept="image/*,.pdf" onChange={handleBusinessUpload} className="text-sm text-black dark:text-white" />
            {uploadingBusiness && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
            {businessDocUrl && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Uploaded ✓</p>}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={submitting || uploadingId || uploadingBusiness} className="w-full bg-brand text-white py-3 rounded-md font-semibold disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
      <Footer />
    </main>
  );
}

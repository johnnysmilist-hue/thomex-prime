"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? window.location.origin + "/reset-password" : undefined,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-md mx-auto px-6 py-20">
        <h1 className="text-lg font-bold text-black dark:text-white text-center mb-2">Reset your password</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-8">
          Enter the email on your account and we&apos;ll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="text-center">
            <p className="text-sm text-green-600 dark:text-green-400 mb-4">
              If an account exists for {email}, a reset link is on its way. Check your inbox.
            </p>
            <Link href="/signin" className="text-brand font-semibold text-sm">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              <Link href="/signin" className="text-brand font-semibold">Back to Sign In</Link>
            </p>
          </form>
        )}
      </div>
      <Footer />
    </main>
  );
}

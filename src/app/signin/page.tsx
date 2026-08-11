"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      router.push("/account");
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-xl font-bold mb-6 text-black dark:text-white text-center">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand"
          />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-3 rounded-md font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-brand font-semibold">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
      <Footer />
    </main>
  );
}

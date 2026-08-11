"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

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
          <a href="/signin" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
            Sign In
          </a>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-xl font-bold mb-6 text-black dark:text-white text-center">My Account</h1>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-5 mb-5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signed in as</p>
          <p className="text-sm font-semibold text-black dark:text-white">{user.email}</p>
        </div>
        <div className="space-y-2">
          <a href="/cart" className="block text-sm text-black dark:text-white hover:text-brand py-2 border-b border-gray-100 dark:border-gray-800">
            My Cart
          </a>
          <a href="/wishlist" className="block text-sm text-black dark:text-white hover:text-brand py-2 border-b border-gray-100 dark:border-gray-800">
            My Wishlist
          </a>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full mt-6 border border-red-500 text-red-500 py-2 rounded-md text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          Sign Out
        </button>
      </div>
      <Footer />
    </main>
  );
}

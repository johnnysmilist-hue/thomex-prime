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
          <a href="/signin" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">Sign In</a>
        </div>
        <Footer />
      </main>
    );
  }

  const username = user.user_metadata?.username || "Thomex Customer";

  const menuGroups = [
    {
      label: "My Account",
      items: [
        { name: "My Orders", href: "/track", icon: "orders" },
        { name: "Ratings & Reviews", href: "/", icon: "reviews" },
        { name: "Wishlist", href: "/wishlist", icon: "wishlist" },
        { name: "Cart", href: "/cart", icon: "cart" },
      ],
    },
  ];

  const icon = (name: string) => {
    const common = { xmlns: "http://www.w3.org/2000/svg", width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    if (name === "orders") return <svg {...common}><path d="M20 7h-3a2 2 0 0 1-2-2V2" /><path d="M9 22h9a2 2 0 0 0 2-2V7l-5-5H9a2 2 0 0 0-2 2v3" /><path d="M3 12h6" /><path d="M3 16h6" /><path d="M3 8h2" /></svg>;
    if (name === "reviews") return <svg {...common}><path d="m17 3-5 5-5-5" /><rect x="2" y="8" width="20" height="14" rx="2" /></svg>;
    if (name === "wishlist") return <svg {...common}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>;
    if (name === "cart") return <svg {...common}><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>;
    return null;
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-md mx-auto px-4 py-6">
        <p className="text-lg font-bold text-black dark:text-white mb-1">Welcome, {username}!</p>
        <p className="text-sm text-brand mb-6">{user.email}</p>

        {menuGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">{group.label}</p>
            <div className="border-t border-gray-100 dark:border-gray-800">
              {group.items.map((item) => (
                <a key={item.name} href={item.href} className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 text-black dark:text-white">
                    <span className="text-gray-500 dark:text-gray-400">{icon(item.icon)}</span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleSignOut} className="w-full text-center border border-red-500 text-red-500 py-3 rounded-md text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-4">
          Logout
        </button>
      </div>
      <Footer />
    </main>
  );
}

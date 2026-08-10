import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopContent from "@/components/ShopContent";

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 text-sm text-gray-400">Loading...</div>}>
        <ShopContent />
      </Suspense>
      <Footer />
    </main>
  );
}

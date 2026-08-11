import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackContent from "@/components/TrackContent";

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12 text-sm text-gray-400 text-center">Loading...</div>}>
        <TrackContent />
      </Suspense>
      <Footer />
    </main>
  );
}

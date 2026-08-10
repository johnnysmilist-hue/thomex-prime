import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import TrustBadges from "@/components/TrustBadges";

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Home &gt; Shop &gt; Category &gt; Product {params.id}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ProductGallery />
          <div>
            <ProductInfo />
            <TrustBadges />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import TopPicks from "@/components/TopPicks";
import DealOfTheDay from "@/components/DealOfTheDay";
import PromoTiles from "@/components/PromoTiles";
import BestSelling from "@/components/BestSelling";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Categories />
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
          <TopPicks />
        </div>
        <div className="md:col-span-1">
          <DealOfTheDay />
        </div>
      </section>
      <PromoTiles />
      <BestSelling />
      <Footer />
    </main>
  );
}

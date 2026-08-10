import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductRow from "@/components/ProductRow";
import TopPicks from "@/components/TopPicks";
import DealOfTheDay from "@/components/DealOfTheDay";
import PromoTiles from "@/components/PromoTiles";
import BestSelling from "@/components/BestSelling";
import BrandStrip from "@/components/BrandStrip";
import Footer from "@/components/Footer";

const tablets = [
  { id: "13", name: "Apple iPad Air 4 10.9-inch Wi-Fi 256GB", price: 49, rating: 4.5, reviewCount: 4 },
  { id: "14", name: "Apple iPad Mini 6 Wi-Fi Cellular 64GB/128GB", price: 56, rating: 5, reviewCount: 4 },
  { id: "15", name: "Apple iPad Pro M1 11-inch 2021 Wi-Fi 128GB", price: 56, rating: 3, reviewCount: 4 },
  { id: "16", name: "Apple iPhone 11 Pro 256GB Space Gray - Unlocked", price: 210, oldPrice: 220, rating: 4.5, reviewCount: 2, discountPercent: 5 },
  { id: "17", name: "Apple iPhone 12 Pro Max 128GB - Unlocked", price: 120, rating: 4.5, reviewCount: 3 },
  { id: "18", name: "Apple iPhone 13 Mini 128GB Pink - Unlocked", price: 150, rating: 5, reviewCount: 1 },
  { id: "19", name: "Apple iPhone 13 Pro Max 128GB - Unlocked", price: 120, oldPrice: 150, rating: 5, reviewCount: 1, discountPercent: 20 },
];

const laptops = [
  { id: "20", name: "Dell XPS 13 Plus Laptop", price: 1199, rating: 4.7, reviewCount: 89 },
  { id: "21", name: "ASUS ROG Strix G15 Gaming Laptop", price: 1299, rating: 4.7, reviewCount: 65 },
  { id: "22", name: "MacBook Air M2 13-inch", price: 899, oldPrice: 1199, rating: 4.9, reviewCount: 140, discountPercent: 24 },
  { id: "23", name: "Lenovo ThinkPad X1 Carbon", price: 1349, rating: 4.6, reviewCount: 54 },
  { id: "24", name: "HP Spectre x360 14-inch", price: 1099, oldPrice: 1299, rating: 4.5, reviewCount: 47, discountPercent: 15 },
];

const audio = [
  { id: "25", name: "Sony WH-1000XM5 Headphones", price: 299, oldPrice: 349, rating: 4.9, reviewCount: 98, discountPercent: 15 },
  { id: "26", name: "AirPods Pro 2nd Gen", price: 199, oldPrice: 249, rating: 4.9, reviewCount: 112, discountPercent: 18 },
  { id: "27", name: "JBL Charge 5 Speaker", price: 129, rating: 4.6, reviewCount: 72 },
  { id: "28", name: "Bose QuietComfort Earbuds II", price: 249, rating: 4.7, reviewCount: 61 },
  { id: "29", name: "Sonos Roam Portable Speaker", price: 159, oldPrice: 179, rating: 4.5, reviewCount: 38, discountPercent: 11 },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Categories />
      <ProductRow title="Phones & Tablets" products={tablets} />
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-3">
          <TopPicks />
        </div>
        <div className="md:col-span-1">
          <DealOfTheDay />
        </div>
      </section>
      <ProductRow title="Laptops" products={laptops} />
      <PromoTiles />
      <ProductRow title="Audio & Headphones" products={audio} />
      <BestSelling />
      <BrandStrip />
      <Footer />
    </main>
  );
}

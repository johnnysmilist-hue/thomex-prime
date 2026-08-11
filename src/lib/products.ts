export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  discountPercent?: number;
  category: string;
  description: string;
};

export const products: Product[] = [
  { id: "1", name: "iPhone 15 Pro Max 256GB", price: 1099, oldPrice: 1379, rating: 4.8, reviewCount: 124, discountPercent: 20, category: "Cell Phones", description: "Apple's flagship phone with a titanium frame, A17 Pro chip, and a pro-grade camera system." },
  { id: "2", name: "Sony WH-1000XM5", price: 299, oldPrice: 349, rating: 4.9, reviewCount: 98, discountPercent: 15, category: "Sounds", description: "Industry-leading noise cancelling headphones with rich, detailed sound and all-day comfort." },
  { id: "3", name: "Samsung Galaxy Watch 6", price: 199, oldPrice: 219, rating: 4.7, reviewCount: 76, discountPercent: 10, category: "Accessories", description: "Track your health and fitness with advanced sensors, a bright display, and long battery life." },
  { id: "4", name: "Canon EOS R50 Camera", price: 649, oldPrice: 929, rating: 4.8, reviewCount: 64, discountPercent: 30, category: "Cameras", description: "A compact mirrorless camera with fast autofocus, ideal for photos, vlogging, and content creation." },
  { id: "5", name: "DJI Mini 3 Pro Drone", price: 759, oldPrice: 1009, rating: 4.7, reviewCount: 53, discountPercent: 25, category: "Accessories", description: "Lightweight, foldable drone with 4K HDR video, obstacle sensing, and long flight time." },
  { id: "6", name: "AirPods Pro 2nd Gen", price: 199, oldPrice: 249, rating: 4.9, reviewCount: 112, discountPercent: 18, category: "Sounds", description: "Wireless earbuds with adaptive noise cancellation, spatial audio, and a comfortable secure fit." },
  { id: "20", name: "Dell XPS 13 Plus Laptop", price: 1199, rating: 4.7, reviewCount: 89, category: "Laptops", description: "A sleek ultraportable laptop with a stunning display and premium build quality." },
  { id: "21", name: "ASUS ROG Strix G15 Gaming Laptop", price: 1299, rating: 4.7, reviewCount: 65, category: "Gaming & VR", description: "A powerful gaming laptop with a high refresh-rate display and serious graphics performance." },
  { id: "22", name: "MacBook Air M2 13-inch", price: 899, oldPrice: 1199, rating: 4.9, reviewCount: 140, discountPercent: 24, category: "Laptops", description: "Apple's thin, silent, all-day-battery laptop powered by the efficient M2 chip." },
  { id: "25", name: "Sony WH-1000XM5 Headphones", price: 299, oldPrice: 349, rating: 4.9, reviewCount: 98, discountPercent: 15, category: "Sounds", description: "Industry-leading noise cancelling headphones with rich, detailed sound and all-day comfort." },
  { id: "27", name: "JBL Charge 5 Speaker", price: 129, rating: 4.6, reviewCount: 72, category: "Sounds", description: "A rugged, waterproof portable speaker with punchy bass and a built-in power bank." },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

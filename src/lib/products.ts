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
  { id: "13", name: "Apple iPad Air 4 10.9-inch Wi-Fi 256GB", price: 49, rating: 4.5, reviewCount: 4, category: "Tablets", description: "A powerful, colorful iPad with a large Liquid Retina display, great for work and play." },
  { id: "14", name: "Apple iPad Mini 6 Wi-Fi Cellular 64GB/128GB", price: 56, rating: 5, reviewCount: 4, category: "Tablets", description: "A compact, pocketable iPad with cellular connectivity, perfect for reading and browsing on the go." },
  { id: "15", name: "Apple iPad Pro M1 11-inch 2021 Wi-Fi 128GB", price: 56, rating: 3, reviewCount: 4, category: "Tablets", description: "A high-performance iPad with the M1 chip, ideal for creative work and multitasking." },
  { id: "16", name: "Apple iPhone 11 Pro 256GB Space Gray - Unlocked", price: 210, oldPrice: 220, rating: 4.5, reviewCount: 2, discountPercent: 5, category: "Cell Phones", description: "A reliable unlocked iPhone with a triple-camera system and long-lasting battery." },
  { id: "17", name: "Apple iPhone 12 Pro Max 128GB - Unlocked", price: 120, rating: 4.5, reviewCount: 3, category: "Cell Phones", description: "A large-screen unlocked iPhone with 5G support and a pro camera system." },
  { id: "18", name: "Apple iPhone 13 Mini 128GB Pink - Unlocked", price: 150, rating: 5, reviewCount: 1, category: "Cell Phones", description: "A compact unlocked iPhone with all the power of the 13 series in a smaller size." },
  { id: "19", name: "Apple iPhone 13 Pro Max 128GB - Unlocked", price: 120, oldPrice: 150, rating: 5, reviewCount: 1, discountPercent: 20, category: "Cell Phones", description: "A large-screen unlocked iPhone with Pro cameras and a smooth ProMotion display." },
  { id: "20", name: "Dell XPS 13 Plus Laptop", price: 1199, rating: 4.7, reviewCount: 89, category: "Laptops", description: "A sleek ultraportable laptop with a stunning display and premium build quality." },
  { id: "21", name: "ASUS ROG Strix G15 Gaming Laptop", price: 1299, rating: 4.7, reviewCount: 65, category: "Gaming & VR", description: "A powerful gaming laptop with a high refresh-rate display and serious graphics performance." },
  { id: "22", name: "MacBook Air M2 13-inch", price: 899, oldPrice: 1199, rating: 4.9, reviewCount: 140, discountPercent: 24, category: "Laptops", description: "Apple's thin, silent, all-day-battery laptop powered by the efficient M2 chip." },
  { id: "23", name: "Lenovo ThinkPad X1 Carbon", price: 1349, rating: 4.6, reviewCount: 54, category: "Laptops", description: "A business-grade ultrabook known for its durability, keyboard, and security features." },
  { id: "24", name: "HP Spectre x360 14-inch", price: 1099, oldPrice: 1299, rating: 4.5, reviewCount: 47, discountPercent: 15, category: "Laptops", description: "A premium 2-in-1 convertible laptop with a gorgeous display and elegant design." },
  { id: "25", name: "Sony WH-1000XM5 Headphones", price: 299, oldPrice: 349, rating: 4.9, reviewCount: 98, discountPercent: 15, category: "Sounds", description: "Industry-leading noise cancelling headphones with rich, detailed sound and all-day comfort." },
  { id: "26", name: "AirPods Pro 2nd Gen", price: 199, oldPrice: 249, rating: 4.9, reviewCount: 112, discountPercent: 18, category: "Sounds", description: "Wireless earbuds with adaptive noise cancellation, spatial audio, and a comfortable secure fit." },
  { id: "27", name: "JBL Charge 5 Speaker", price: 129, rating: 4.6, reviewCount: 72, category: "Sounds", description: "A rugged, waterproof portable speaker with punchy bass and a built-in power bank." },
  { id: "28", name: "Bose QuietComfort Earbuds II", price: 249, rating: 4.7, reviewCount: 61, category: "Sounds", description: "Premium noise-cancelling earbuds with a custom fit and clear, balanced sound." },
  { id: "29", name: "Sonos Roam Portable Speaker", price: 159, oldPrice: 179, rating: 4.5, reviewCount: 38, discountPercent: 11, category: "Sounds", description: "A compact, weatherproof smart speaker that sounds great both indoors and out." },
  { id: "30", name: "Xiaomi Redmi Note 13 128GB", price: 149, oldPrice: 219, rating: 4.4, reviewCount: 210, discountPercent: 32, category: "Cell Phones", description: "An affordable phone with a bright AMOLED display and solid all-round performance." },
  { id: "31", name: "Anker PowerCore 20000mAh", price: 19, oldPrice: 35, rating: 4.6, reviewCount: 340, discountPercent: 46, category: "Accessories", description: "A high-capacity portable charger that can top up your phone several times over." },
  { id: "32", name: "Samsung 55-inch 4K Smart TV", price: 349, oldPrice: 549, rating: 4.5, reviewCount: 88, discountPercent: 36, category: "Accessories", description: "A crisp 4K smart TV with vibrant colors and built-in streaming apps." },
  { id: "33", name: "HP DeskJet Wireless Printer", price: 59, oldPrice: 99, rating: 4.2, reviewCount: 56, discountPercent: 40, category: "Office", description: "A compact wireless printer for everyday home and small-office printing." },
  { id: "34", name: "Xbox Wireless Controller", price: 39, oldPrice: 64, rating: 4.7, reviewCount: 129, discountPercent: 39, category: "Gaming & VR", description: "A comfortable wireless controller compatible with Xbox consoles and Windows PCs." },
  { id: "35", name: "Ring Video Doorbell", price: 49, oldPrice: 89, rating: 4.3, reviewCount: 74, discountPercent: 45, category: "Accessories", description: "See, hear, and speak to visitors at your door from your phone, wherever you are." },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

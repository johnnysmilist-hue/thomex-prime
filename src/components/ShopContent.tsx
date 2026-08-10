"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ProductCard from "@/components/ProductCard";

const allProducts = [
  { id: "1", name: "iPhone 15 Pro Max 256GB", price: 1099, oldPrice: 1379, rating: 4.8, reviewCount: 124, discountPercent: 20, category: "Cell Phones" },
  { id: "2", name: "Sony WH-1000XM5", price: 299, oldPrice: 349, rating: 4.9, reviewCount: 98, discountPercent: 15, category: "Sounds" },
  { id: "3", name: "Samsung Galaxy Watch 6", price: 199, oldPrice: 219, rating: 4.7, reviewCount: 76, discountPercent: 10, category: "Accessories" },
  { id: "4", name: "Canon EOS R50 Camera", price: 649, oldPrice: 929, rating: 4.8, reviewCount: 64, discountPercent: 30, category: "Cameras" },
  { id: "5", name: "DJI Mini 3 Pro Drone", price: 759, oldPrice: 1009, rating: 4.7, reviewCount: 53, discountPercent: 25, category: "Accessories" },
  { id: "6", name: "AirPods Pro 2nd Gen", price: 199, oldPrice: 249, rating: 4.9, reviewCount: 112, discountPercent: 18, category: "Sounds" },
  { id: "20", name: "Dell XPS 13 Plus Laptop", price: 1199, rating: 4.7, reviewCount: 89, category: "Laptops" },
  { id: "21", name: "ASUS ROG Strix G15 Gaming Laptop", price: 1299, rating: 4.7, reviewCount: 65, category: "Gaming & VR" },
  { id: "22", name: "MacBook Air M2 13-inch", price: 899, oldPrice: 1199, rating: 4.9, reviewCount: 140, discountPercent: 24, category: "Laptops" },
  { id: "25", name: "Sony WH-1000XM5 Headphones", price: 299, oldPrice: 349, rating: 4.9, reviewCount: 98, discountPercent: 15, category: "Sounds" },
  { id: "26", name: "AirPods Pro 2nd Gen", price: 199, oldPrice: 249, rating: 4.9, reviewCount: 112, discountPercent: 18, category: "Sounds" },
  { id: "27", name: "JBL Charge 5 Speaker", price: 129, rating: 4.6, reviewCount: 72, category: "Sounds" },
];

export default function ShopContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");

  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(1500);

  let products = allProducts.filter((p) => p.price <= maxPrice);

  if (categoryFilter) {
    products = products.filter((p) => p.category === categoryFilter);
  }

  if (sort === "price-low") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    products = [...products].sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-56 shrink-0 space-y-6">
        <Sidebar />
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-sm font-semibold mb-3 text-black dark:text-white">Max Price: ${maxPrice}</p>
          <input type="range" min="10" max="1500" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-brand" />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="text-xl font-bold text-black dark:text-white">
            {categoryFilter ? categoryFilter : "All Products"}{" "}
            <span className="text-sm font-normal text-gray-400">({products.length})</span>
          </h1>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white text-sm rounded-md px-3 py-2">
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No products found in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

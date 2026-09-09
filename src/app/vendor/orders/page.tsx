"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import VendorSidebar from "@/components/VendorSidebar";
import { supabase } from "@/lib/supabaseClient";

type OrderItem = { id?: string; name?: string; price?: number; qty?: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  status: string;
  items: OrderItem[];
  created_at: string;
};

type VendorOrder = {
  order: Order;
  myItems: OrderItem[];
  mySubtotal: number;
};

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  Confirmed: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  Shipped: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  Delivered: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  Cancelled: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  Returned: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold " + style}>
      {status}
    </span>
  );
}

export default function VendorOrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <VendorGuard>{(store) => <VendorOrdersList storeId={store.id} />}</VendorGuard>
      <Footer />
    </main>
  );
}

function VendorOrdersList({ storeId }: { storeId: string }) {
  const [vendorOrders, setVendorOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: myProducts } = await supabase
        .from("products")
        .select("id")
        .eq("store_id", storeId);

      const myProductIds = new Set((myProducts || []).map((p) => p.id));

      if (myProductIds.size === 0) {
        setVendorOrders([]);
        setLoading(false);
        return;
      }

      const { data: allOrders } = await supabase
        .from("orders")
        .select("id, order_code, customer_name, status, items, created_at")
        .order("created_at", { ascending: false });

      const matched: VendorOrder[] = [];
      (allOrders as Order[] || []).forEach((order) => {
        const myItems = (order.items || []).filter((item) => item.id && myProductIds.has(item.id));
        if (myItems.length > 0) {
          const mySubtotal = myItems.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);
          matched.push({ order, myItems, mySubtotal });
        }
      });

      setVendorOrders(matched);
      setLoading(false);
    };
    load();
  }, [storeId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6">
      <VendorSidebar />

      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold mb-1 text-black dark:text-white">Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Orders containing your products. You only see your own items and totals — not other sellers' products in the same order.
        </p>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <p className="text-sm text-gray-400 p-6">Loading orders...</p>
          ) : vendorOrders.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 p-6">No orders yet — this fills in as customers buy your products.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Your Items</th>
                    <th className="px-4 py-3 font-semibold">Your Subtotal</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorOrders.map(({ order, myItems, mySubtotal }) => (
                    <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-semibold text-brand">#{order.order_code}</td>
                      <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap">{order.customer_name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {myItems.map((i) => i.name + " ×" + i.qty).join(", ")}
                      </td>
                      <td className="px-4 py-3 font-semibold text-black dark:text-white whitespace-nowrap">
                        ${mySubtotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3">
                        
                        <a  href={"/vendor/orders/" + order.id + "/invoice"}
                          className="text-brand text-xs font-semibold hover:underline"
                        >
                          View Invoice
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

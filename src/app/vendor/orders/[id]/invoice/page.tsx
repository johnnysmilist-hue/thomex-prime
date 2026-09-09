"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorGuard from "@/components/VendorGuard";
import { supabase } from "@/lib/supabaseClient";

type OrderItem = { id?: string; name?: string; price?: number; qty?: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  address: string;
  county: string | null;
  country: string | null;
  items: OrderItem[];
  status: string;
  created_at: string;
};

export default function VendorInvoicePage() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>
      <VendorGuard>{(store) => <InvoiceContent storeId={store.id} />}</VendorGuard>
      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
}

function InvoiceContent({ storeId }: { storeId: string }) {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [myItems, setMyItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: myProducts } = await supabase
        .from("products")
        .select("id")
        .eq("store_id", storeId);
      const myProductIds = new Set((myProducts || []).map((p) => p.id));

      const { data } = await supabase.from("orders").select("*").eq("id", params.id).single();

      if (!data) {
        setNotAllowed(true);
        setLoading(false);
        return;
      }

      const items = (data.items as OrderItem[]) || [];
      const mine = items.filter((item) => item.id && myProductIds.has(item.id));

      if (mine.length === 0) {
        setNotAllowed(true);
        setLoading(false);
        return;
      }

      setOrder(data as Order);
      setMyItems(mine);
      setLoading(false);
    };
    load();
  }, [params.id, storeId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading invoice...</div>;
  }

  if (notAllowed || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm text-gray-500 mb-4">This invoice isn't available, or doesn't include any of your products.</p>
        <button onClick={() => router.push("/vendor/orders")} className="text-sm text-brand font-semibold">
          Back to Orders
        </button>
      </div>
    );
  }

  const subtotal = myItems.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 print:py-0">
      <div className="print:hidden flex items-center justify-between mb-6">
        <button onClick={() => router.push("/vendor/orders")} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Orders
        </button>
        <button
          onClick={() => window.print()}
          className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print / Save PDF
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 print:bg-white rounded-xl print:rounded-none shadow-sm print:shadow-none border border-gray-100 dark:border-gray-800 print:border-0 p-8">
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-lg font-bold text-black dark:text-white print:text-black">Thomex Marketplace</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">Vendor Invoice</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-black dark:text-white print:text-black">INVOICE</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600 mt-1">{order.order_code}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
              {new Date(order.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Customer</p>
          <p className="text-sm font-semibold text-black dark:text-white print:text-black">{order.customer_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
            {order.county || order.country || ""}
          </p>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-800 print:border-gray-300 text-left text-xs text-gray-500 print:text-gray-600 uppercase">
              <th className="pb-2 font-semibold">Item</th>
              <th className="pb-2 font-semibold text-center">Qty</th>
              <th className="pb-2 font-semibold text-right">Price</th>
              <th className="pb-2 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {myItems.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800 print:border-gray-200">
                <td className="py-2.5 text-black dark:text-white print:text-black">{item.name}</td>
                <td className="py-2.5 text-center text-gray-600 dark:text-gray-300 print:text-gray-700">{item.qty}</td>
                <td className="py-2.5 text-right text-gray-600 dark:text-gray-300 print:text-gray-700">
                  ${(item.price || 0).toFixed(2)}
                </td>
                <td className="py-2.5 text-right font-medium text-black dark:text-white print:text-black">
                  ${((item.price || 0) * (item.qty || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-56">
            <div className="flex justify-between text-base font-bold text-black dark:text-white print:text-black border-t border-gray-200 dark:border-gray-800 print:border-gray-300 pt-2">
              <span>Your Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 print:text-gray-500 text-center pt-4 border-t border-gray-100 dark:border-gray-800 print:border-gray-200">
          This invoice reflects only your products within this order. Payouts follow Thomex's standard vendor payment schedule.
        </p>
      </div>
    </div>
  );
}

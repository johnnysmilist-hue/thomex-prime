"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

type OrderItem = { name?: string; price?: number; qty?: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  user_id: string | null;
  items: OrderItem[] | null;
  total: number;
  shipping_fee: number | null;
  discount_amount: number | null;
  coupon_code: string | null;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string;
};

const paymentLabel = (method: string | null, status: string | null) => {
  if (method === "mpesa") return status === "paid" ? "Paid via M-Pesa" : "M-Pesa (pending confirmation)";
  if (method === "cod") return "Cash on Delivery";
  return "—";
};

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/signin");
      return;
    }

    const load = async () => {
      const { data } = await supabase.from("orders").select("*").eq("id", params.id).single();
      if (!data || data.user_id !== user.id) {
        setNotAllowed(true);
        setLoading(false);
        return;
      }
      setOrder(data as Order);
      setLoading(false);
    };
    load();
  }, [params.id, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-gray-400">Loading receipt...</div>
        <Footer />
      </main>
    );
  }

  if (notAllowed || !order) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            We couldn't find that receipt, or it doesn't belong to your account.
          </p>
          <a href="/account/orders" className="inline-block bg-brand text-white px-5 py-2 rounded-md font-semibold">
            Back to My Orders
          </a>
        </div>
        <Footer />
      </main>
    );
  }

  const items = order.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);
  const shipping = order.shipping_fee || 0;
  const discount = order.discount_amount || 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 print:py-0">
        <div className="print:hidden flex items-center justify-between mb-6">
          <button onClick={() => router.push("/account/orders")} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to My Orders
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
          <div className="text-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-md bg-brand flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">T</div>
            <p className="text-lg font-bold text-black dark:text-white print:text-black">Thomex</p>
            <p className="text-xs text-green-600 font-semibold mt-2 flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Receipt
            </p>
          </div>

          <div className="flex justify-between text-sm mb-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Order Code</p>
              <p className="font-semibold text-black dark:text-white print:text-black">{order.order_code}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Date</p>
              <p className="text-black dark:text-white print:text-black">
                {new Date(order.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300 print:text-gray-700">
                  {item.name} × {item.qty}
                </span>
                <span className="text-black dark:text-white print:text-black font-medium">
                  KSh {((item.price || 0) * (item.qty || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 print:border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 print:text-gray-700">
              <span>Subtotal</span>
              <span>KSh {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 print:text-gray-700">
              <span>Shipping</span>
              <span>KSh {shipping.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 print:text-green-700">
                <span>Discount {order.coupon_code ? "(" + order.coupon_code + ")" : ""}</span>
                <span>-KSh {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-black dark:text-white print:text-black border-t border-gray-100 dark:border-gray-800 print:border-gray-200 pt-2 mt-2">
              <span>Total Paid</span>
              <span>KSh {order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 print:border-gray-200 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
              {paymentLabel(order.payment_method, order.payment_status)}
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 print:text-gray-500 mt-6">
            Thank you for shopping with Thomex.
          </p>
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
}

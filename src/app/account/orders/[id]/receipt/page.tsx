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
  if (method === "mpesa") return status === "paid" ? "PAID VIA M-PESA" : "M-PESA (PENDING)";
  if (method === "cod") return "CASH ON DELIVERY";
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
  const dateObj = new Date(order.created_at);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <div className="max-w-sm mx-auto px-4 py-10 print:py-0">
        <div className="print:hidden flex items-center justify-between mb-6">
          <button onClick={() => router.push("/account/orders")} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
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
            Print
          </button>
        </div>

        <div
          className="bg-white print:shadow-none shadow-lg rounded-sm p-6"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          <div className="text-center mb-4">
            <img src="/logo-light.png" alt="Thomex" className="h-8 w-auto mx-auto mb-2" />
            <p className="text-[11px] tracking-widest text-black font-bold">THOMEX ONLINE STORE</p>
            <p className="text-[10px] text-gray-500 mt-1">Nairobi, Kenya</p>
          </div>

          <div className="border-t border-dashed border-gray-400 my-3" />

          <div className="flex justify-between text-[11px] text-black mb-1">
            <span>{dateObj.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" })}</span>
            <span>{dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
          </div>

          <div className="border-t border-dashed border-gray-400 my-3" />

          <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 text-[11px] font-bold text-black mb-1.5">
            <span>Product</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Price</span>
          </div>

          <div className="border-t border-dashed border-gray-400 mb-2" />

          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-x-2 text-[11px] text-black mb-2">
              <span className="break-words">{item.name}</span>
              <span className="text-center">{item.qty}</span>
              <span className="text-right">KSh {((item.price || 0) * (item.qty || 0)).toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t border-dashed border-gray-400 my-3" />

          <div className="text-[11px] text-black space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>KSh {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>KSh {shipping.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span>Discount{order.coupon_code ? " (" + order.coupon_code + ")" : ""}</span>
                <span>-KSh {discount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-400 my-3" />

          <div className="flex justify-between text-sm font-bold text-black">
            <span>Grand Total:</span>
            <span>KSh {order.total.toFixed(2)}</span>
          </div>

          <div className="border-t border-dashed border-gray-400 my-3" />

          <div className="text-center">
            <span className="inline-block border-2 border-brand text-brand text-[10px] font-bold tracking-widest px-3 py-1 rotate-[-3deg]">
              {paymentLabel(order.payment_method, order.payment_status)}
            </span>
          </div>

          <div className="border-t border-dashed border-gray-400 my-3" />

          <p className="text-center text-[10px] text-gray-500 mb-1">Order Code</p>
          <p className="text-center text-xs font-bold text-black tracking-wider mb-3">{order.order_code}</p>

          <p className="text-center text-[10px] text-gray-500 leading-relaxed">
            Track this order anytime at thomex-prime-store.vercel.app/track-order
          </p>

          <div className="border-t border-dashed border-gray-400 my-3" />

          <p className="text-center text-[10px] text-gray-500">
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

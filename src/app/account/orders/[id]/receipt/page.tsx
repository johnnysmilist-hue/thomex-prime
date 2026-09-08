"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { fetchSettings } from "@/lib/supabaseSettings";
import { amountInWords } from "@/lib/amountInWords";

type OrderItem = { name?: string; price?: number; qty?: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
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
  const [storeName, setStoreName] = useState("Thomex");
  const [hotline, setHotline] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

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
    fetchSettings().then((r) => {
      if (r.data?.store_name) setStoreName(r.data.store_name);
      if (r.data?.hotline) setHotline(r.data.hotline);
      if (r.data?.whatsapp_number) setWhatsapp(r.data.whatsapp_number);
      if (r.data?.support_email) setSupportEmail(r.data.support_email);
      if (r.data?.address) setStoreAddress(r.data.address);
    });
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
  const orderDate = new Date(order.created_at);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 print:py-0">
        <div className="print:hidden flex items-center justify-between mb-6">
          <button onClick={() => router.push("/account/orders")} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to My Orders
          </button>
          <button onClick={() => window.print()} className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Save PDF
          </button>
        </div>

        <div className="bg-white print:bg-white rounded-none shadow-sm print:shadow-none border border-gray-200 print:border-0 overflow-hidden">
          {/* Header band */}
          <div className="bg-brand text-white px-8 py-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center font-black text-2xl shrink-0">T</div>
              <div>
                <p className="text-2xl font-black tracking-tight leading-none">{storeName.toUpperCase()}</p>
                <p className="text-[11px] text-white/80 font-semibold uppercase tracking-wide mt-1">Electronics &amp; Home Appliances</p>
              </div>
            </div>
            <div className="text-right text-xs text-white/90 space-y-1">
              {hotline && (
                <p className="flex items-center justify-end gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.01l-2.2 2.21Z"/></svg>
                  {hotline}
                </p>
              )}
              {whatsapp && (
                <p className="flex items-center justify-end gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.42-1.36a9.9 9.9 0 0 0 4.62 1.14h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Z"/></svg>
                  {whatsapp}
                </p>
              )}
              {supportEmail && <p>{supportEmail}</p>}
              {storeAddress && <p className="max-w-[200px]">{storeAddress}</p>}
            </div>
          </div>

          {/* Title bar */}
          <div className="bg-gray-900 text-white text-center py-3">
            <p className="text-lg font-black tracking-[0.2em]">RECEIPT</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 border border-gray-300 mb-0 text-xs">
              <div className="border-r border-gray-300 px-3 py-2">
                <p className="font-bold text-gray-500">ORDER NO.</p>
                <p className="text-black font-semibold">{order.order_code}</p>
              </div>
              <div className="px-3 py-2">
                <p className="font-bold text-gray-500">DATE</p>
                <p className="text-black font-semibold">{orderDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
            </div>
            <div className="border border-t-0 border-gray-300 px-3 py-2 text-xs">
              <p className="font-bold text-gray-500">NAME</p>
              <p className="text-black font-semibold">{order.customer_name}</p>
            </div>
            <div className="border border-t-0 border-gray-300 px-3 py-2 text-xs mb-6">
              <p className="font-bold text-gray-500">ADDRESS</p>
              <p className="text-black font-semibold">{order.address}</p>
            </div>

            <table className="w-full text-sm border-collapse mb-2">
              <thead>
                <tr className="bg-brand text-white text-xs uppercase">
                  <th className="border border-brand-dark py-2 px-2 text-left w-16">Qty</th>
                  <th className="border border-brand-dark py-2 px-2 text-left">Description</th>
                  <th className="border border-brand-dark py-2 px-2 text-right w-28">Price</th>
                  <th className="border border-brand-dark py-2 px-2 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 py-2 px-2 text-center">{item.qty}</td>
                    <td className="border border-gray-300 py-2 px-2">{item.name}</td>
                    <td className="border border-gray-300 py-2 px-2 text-right">KSh {(item.price || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 py-2 px-2 text-right font-medium">
                      KSh {((item.price || 0) * (item.qty || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between text-sm py-1 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-black">KSh {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b border-gray-200">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-black">KSh {shipping.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm py-1 border-b border-gray-200 text-green-700">
                    <span>Discount {order.coupon_code ? "(" + order.coupon_code + ")" : ""}</span>
                    <span>-KSh {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black py-2 bg-brand/5 px-2 mt-1">
                  <span className="text-black">TOTAL PAID</span>
                  <span className="text-brand">KSh {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-8">
              <span className="font-bold">Amount in Words:</span> {amountInWords(order.total)} Kenyan Shillings Only
            </p>

            <div className="bg-gray-50 border border-gray-200 text-xs text-gray-600 px-3 py-2 mb-8 text-center">
              {paymentLabel(order.payment_method, order.payment_status)} — Goods sold are covered by our Return, Refund &amp; Warranty Policy.
            </div>
          </div>

          <div className="bg-brand text-white text-center text-xs font-semibold py-2.5">
            Thank you for shopping with {storeName}
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
}

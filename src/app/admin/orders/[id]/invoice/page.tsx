"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/lib/supabaseClient";
import { fetchSettings } from "@/lib/supabaseSettings";

type OrderItem = { name?: string; price?: number; qty?: number };

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItem[] | null;
  total: number;
  notes: string | null;
  created_at: string;
  coupon_code: string | null;
  discount_amount: number | null;
  payment_method: string | null;
  payment_status: string | null;
};

const paymentLabel = (method: string | null, status: string | null) => {
  if (method === "mpesa") return status === "paid" ? "Paid via M-Pesa" : "M-Pesa (pending)";
  if (method === "cod") return "Cash on delivery";
  return "—";
};

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("Thomex");
  const [hotline, setHotline] = useState("+254 700 123 456");
  const [whatsapp, setWhatsapp] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("orders").select("*").eq("id", params.id).single();
      setOrder(data as Order);
      setLoading(false);
    };
    load();
    fetchSettings().then((r) => {
      if (r.data?.store_name) setStoreName(r.data.store_name);
      if (r.data?.hotline) setHotline(r.data.hotline);
      if (r.data?.whatsapp_number) setWhatsapp(r.data.whatsapp_number);
      if (r.data?.support_email) setSupportEmail(r.data.support_email);
    });
  }, [params.id]);

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Loading invoice...</div>
      </AdminGuard>
    );
  }

  if (!order) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-gray-500">Order not found.</p>
          <button onClick={() => router.push("/admin/orders")} className="text-sm text-brand font-semibold">
            Back to Orders
          </button>
        </div>
      </AdminGuard>
    );
  }

  const items = order.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);
  const discount = order.discount_amount || 0;
  const orderDate = new Date(order.created_at);

  return (
    <AdminGuard>
      <div className="min-h-screen print:min-h-0 bg-gray-100 dark:bg-gray-950 print:bg-white">
        <div className="print:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => router.push("/admin/orders")} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Orders
          </button>
          <button onClick={() => window.print()} className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Download PDF
          </button>
        </div>

        <div className="max-w-3xl mx-auto py-10 px-4 print:py-0 print:px-0">
          <div className="invoice-card relative bg-gradient-to-br from-gray-50 to-white print:bg-white rounded-2xl shadow-sm print:shadow-none overflow-hidden p-8 sm:p-10 print:p-8">
            {/* Decorative gradient blob, purely visual */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-brand-light to-brand-dark opacity-10 print:opacity-5"
            />

            {/* Header row: logo + INVOICE title */}
            <div className="relative flex items-start justify-between mb-10">
              <div className="flex items-center gap-3">
                <img src="/logo-dark.png" alt={storeName} className="h-10 w-auto shrink-0" />
                <div>
                  <p className="font-extrabold text-gray-900 leading-tight">{storeName}</p>
                  <p className="text-xs text-gray-500">Electronics &amp; Home Appliances</p>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">INVOICE</h1>
            </div>

            {/* Billed to / Payment details + Number & Date */}
            <div className="relative flex flex-col sm:flex-row justify-between gap-6 mb-10">
              <div>
                <p className="text-xs font-extrabold tracking-widest text-gray-900 mb-2">BILLED TO</p>
                <p className="text-sm text-gray-700">{order.customer_name}</p>
                <p className="text-sm text-gray-700">{order.phone}</p>
                <p className="text-sm text-gray-700">{order.address}</p>

                <p className="text-xs font-extrabold tracking-widest text-gray-900 mt-6 mb-2">PAYMENT DETAILS</p>
                <p className="text-sm text-gray-700">{paymentLabel(order.payment_method, order.payment_status)}</p>
              </div>
              <div className="text-sm text-gray-600 space-y-1 sm:text-right shrink-0">
                <p>Number: <span className="font-semibold text-gray-900">{order.order_code}</span></p>
                <p>Date: <span className="font-semibold text-gray-900">{orderDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}</span></p>
              </div>
            </div>

            {/* Item table */}
            <div className="relative mb-8">
              <div className="grid grid-cols-[1fr_50px_80px_90px] sm:grid-cols-[1fr_60px_100px_100px] gap-2 bg-gradient-to-r from-brand-dark to-brand-light text-white text-[11px] sm:text-xs font-bold uppercase tracking-wide rounded-full px-4 sm:px-6 py-3">
                <span>Item Description</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Price</span>
                <span className="text-right">Total</span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm mt-3 divide-y divide-gray-100 px-4 sm:px-6">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_50px_80px_90px] sm:grid-cols-[1fr_60px_100px_100px] gap-2 py-3 text-sm text-gray-700">
                    <span>{item.name}</span>
                    <span className="text-center">{item.qty}</span>
                    <span className="text-right">KSh {(item.price || 0).toFixed(2)}</span>
                    <span className="text-right font-semibold text-gray-900">
                      KSh {((item.price || 0) * (item.qty || 0)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes + totals */}
            <div className="relative flex flex-col sm:flex-row justify-between gap-6 mb-10">
              {order.notes ? (
                <div className="max-w-xs">
                  <p className="text-xs font-extrabold tracking-widest text-gray-900 mb-2">NOTES</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{order.notes}</p>
                </div>
              ) : (
                <div />
              )}

              <div className="bg-white rounded-xl shadow-sm px-6 py-4 w-full sm:w-72 space-y-2 shrink-0">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-900">SUB TOTAL</span>
                  <span className="text-gray-700">KSh {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span className="font-bold">DISCOUNT{order.coupon_code ? " (" + order.coupon_code + ")" : ""}</span>
                    <span>-KSh {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black pt-2 border-t border-gray-200">
                  <span className="text-gray-900">GRAND TOTAL</span>
                  <span className="text-brand-dark">KSh {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer contact bar */}
            <div className="relative bg-brand-dark text-white rounded-full flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4 text-xs font-medium">
              {hotline && (
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.01l-2.2 2.21Z"/>
                  </svg>
                  {hotline}
                </span>
              )}
              {whatsapp && (
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.42-1.36a9.9 9.9 0 0 0 4.62 1.14h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Z"/>
                  </svg>
                  {whatsapp}
                </span>
              )}
              {supportEmail && (
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  {supportEmail}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

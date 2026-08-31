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

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [hotline, setHotline] = useState("+254 700 123 456");
  const [supportEmail, setSupportEmail] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("orders").select("*").eq("id", params.id).single();
      setOrder(data as Order);
      setLoading(false);
    };
    load();
    fetchSettings().then((r) => {
      if (r.data?.hotline) setHotline(r.data.hotline);
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

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 print:bg-white">
        {/* Toolbar — hidden when printing */}
        <div className="print:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => router.push("/admin/orders")} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
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
            Print / Download PDF
          </button>
        </div>

        {/* Invoice sheet */}
        <div className="max-w-3xl mx-auto py-10 px-4 print:py-0 print:px-0">
          <div className="bg-white dark:bg-gray-900 print:bg-white rounded-xl print:rounded-none shadow-sm print:shadow-none border border-gray-100 dark:border-gray-800 print:border-0 p-8 print:p-10">
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-white font-bold text-sm">T</div>
                  <p className="text-lg font-bold text-black dark:text-white print:text-black">Thomex</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">{hotline}</p>
                {supportEmail && <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">{supportEmail}</p>}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-black dark:text-white print:text-black">INVOICE</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600 mt-1">{order.order_code}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                  {new Date(order.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Billed To</p>
                <p className="text-sm font-semibold text-black dark:text-white print:text-black">{order.customer_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">{order.address}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">{order.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Payment</p>
                <p className="text-sm text-black dark:text-white print:text-black capitalize">{order.payment_method || "—"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600 capitalize">{order.payment_status || ""}</p>
              </div>
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
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 print:border-gray-200">
                    <td className="py-2.5 text-black dark:text-white print:text-black">{item.name}</td>
                    <td className="py-2.5 text-center text-gray-600 dark:text-gray-300 print:text-gray-700">{item.qty}</td>
                    <td className="py-2.5 text-right text-gray-600 dark:text-gray-300 print:text-gray-700">
                      KSh {(item.price || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right font-medium text-black dark:text-white print:text-black">
                      KSh {((item.price || 0) * (item.qty || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-56 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 print:text-gray-700">
                  <span>Subtotal</span>
                  <span>KSh {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400 print:text-green-700">
                    <span>Discount {order.coupon_code ? "(" + order.coupon_code + ")" : ""}</span>
                    <span>-KSh {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-black dark:text-white print:text-black border-t border-gray-200 dark:border-gray-800 print:border-gray-300 pt-2 mt-2">
                  <span>Total</span>
                  <span>KSh {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="border-t border-gray-100 dark:border-gray-800 print:border-gray-200 pt-4 mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Notes</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">{order.notes}</p>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 print:text-gray-500 pt-6 border-t border-gray-100 dark:border-gray-800 print:border-gray-200">
              Thank you for shopping with Thomex.
            </p>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

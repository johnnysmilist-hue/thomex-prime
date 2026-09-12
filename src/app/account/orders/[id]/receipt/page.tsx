"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Caveat } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { "use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Caveat } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

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

// Deterministic "barcode" bar widths derived from the order code, so it
// looks consistent every time the same receipt is opened.
function Barcode({ code }: { code: string }) {
  const seed = (code || "THOMEX").split("").map((c) => c.charCodeAt(0));
  const bars = Array.from({ length: 46 }, (_, i) => {
    const v = seed[i % seed.length] + i * 7;
    return (v % 3) + 1; // width 1-3
  });
  return (
    <div className="flex items-end justify-center gap-[2px] h-12">
      {bars.map((w, i) => (
        <span key={i} className="bg-black" style={{ width: `${w}px`, height: "100%" }} />
      ))}
    </div>
  );
}

const Divider = () => <div className="border-t border-dashed border-gray-400 my-3" />;

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

      <div className="max-w-sm mx-auto px-4 py-10 print:p-0 print:max-w-none">
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
          {/* Top strip */}
          <div className="flex items-start justify-between mb-3">
            <span className="text-brand font-extrabold text-base tracking-wide">RECEIPT</span>
            <span className="text-black font-extrabold text-sm">No. {order.order_code}</span>
          </div>

          <div className="text-center mb-4">
            <img src="/logo-light.png" alt="Thomex" className="h-8 w-auto mx-auto mb-2" />
            <p className="text-[11px] tracking-widest text-black font-bold">THOMEX ONLINE STORE</p>
            <p className="text-[10px] text-gray-500 mt-1">Nairobi, Kenya</p>
          </div>

          <Divider />

          <p className="text-center text-xs font-bold tracking-wide text-black">
            DATE: {dateObj.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" })}{" "}
            {dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </p>

          <Divider />

          {items.map((item, i) => (
            <div key={i} className="flex items-baseline gap-1.5 text-[12px] text-black mb-2.5">
              <span className="whitespace-nowrap">
                {item.name}
                {(item.qty || 1) > 1 ? ` x${item.qty}` : ""}
              </span>
              <span className="flex-1 border-b border-dotted border-gray-500 translate-y-[-3px]" />
              <span className="font-semibold whitespace-nowrap">
                KSh {((item.price || 0) * (item.qty || 0)).toFixed(2)}
              </span>
            </div>
          ))}

          <Divider />

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

          <Divider />

          <div className="flex justify-between text-sm font-extrabold text-black">
            <span>TOTAL:</span>
            <span>KSh {order.total.toFixed(2)}</span>
          </div>

          <Divider />

          <div className="text-center">
            <span className="inline-block border-2 border-brand text-brand text-[10px] font-bold tracking-widest px-3 py-1 rotate-[-3deg]">
              {paymentLabel(order.payment_method, order.payment_status)}
            </span>
          </div>

          <Divider />

          <Barcode code={order.order_code} />
          <p className="text-center text-[10px] text-gray-500 tracking-wider mt-2">{order.order_code}</p>

          <p className={`${caveat.className} text-center text-brand text-4xl mt-2`}>Thank You!</p>

          <Divider />

          <p className="text-center text-[10px] text-gray-500 leading-relaxed">
            Track this order anytime at thomex-prime-store.vercel.app/track-order
          </p>
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
}seAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { fetchSettings } from "@/lib/supabaseSettings";

const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

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

// Deterministic "barcode" bar widths derived from the order code, so it
// looks consistent every time the same receipt is opened.
function Barcode({ code }: { code: string }) {
  const seed = (code || "THOMEX").split("").map((c) => c.charCodeAt(0));
  const bars = Array.from({ length: 46 }, (_, i) => {
    const v = seed[i % seed.length] + i * 7;
    return (v % 3) + 1; // width 1-3
  });
  return (
    <div className="flex items-end justify-center gap-[2px] h-12">
      {bars.map((w, i) => (
        <span key={i} className="bg-black" style={{ width: `${w}px`, height: "100%" }} />
      ))}
    </div>
  );
}

const Divider = () => <div className="border-t-2 border-dashed border-black/30 my-3" />;

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [storeName, setStoreName] = useState("Thomex");
  const [hotline, setHotline] = useState("");

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
  const dateObj = new Date(order.created_at);

  return (
    <main className="min-h-screen bg-[#c81e24] print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <div className="max-w-sm mx-auto px-4 py-10 print:py-0">
        <div className="print:hidden flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/account/orders")}
            className="text-sm text-white/90 flex items-center gap-1.5 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-white text-[#c81e24] text-sm font-bold px-4 py-2 rounded-md flex items-center gap-2"
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
          className="relative bg-[#f4ecdd] print:shadow-none shadow-2xl rounded-md p-7 overflow-hidden"
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "5px 5px",
          }}
        >
          {/* Top strip */}
          <div className="flex items-start justify-between mb-3">
            <span className="text-[#c81e24] font-extrabold text-lg tracking-wide">RECEIPT</span>
            <span className="text-black font-extrabold text-sm">No. {order.order_code}</span>
          </div>

          {/* Wordmark */}
          <div className="text-center mt-1">
            <p className={`${caveat.className} text-[#c81e24] text-5xl leading-none`}>{storeName}</p>
            <p className="text-[#c81e24] font-extrabold tracking-[0.35em] text-[11px] mt-0.5">ONLINE STORE</p>
          </div>

          <p className="text-center text-[11px] text-black/70 italic mt-3">
            /Latest Gadgets, Picked By The Spec/
          </p>

          <Divider />

          <p className="text-center text-xs font-bold tracking-wide text-black">
            DATE: {dateObj.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" })}{" "}
            {dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </p>

          <Divider />

          {items.map((item, i) => (
            <div key={i} className="flex items-baseline gap-1.5 text-[12px] text-black mb-2.5">
              <span className="whitespace-nowrap">
                {item.name}
                {(item.qty || 1) > 1 ? ` x${item.qty}` : ""}
              </span>
              <span className="flex-1 border-b border-dotted border-black/60 translate-y-[-3px]" />
              <span className="font-semibold whitespace-nowrap">
                KSh {((item.price || 0) * (item.qty || 0)).toFixed(2)}
              </span>
            </div>
          ))}

          <Divider />

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

          <Divider />

          <div className="flex justify-between text-base font-extrabold text-black">
            <span>TOTAL:</span>
            <span>KSh {order.total.toFixed(2)}</span>
          </div>

          <Divider />

          <div className="text-center">
            <span className="inline-block border-2 border-[#c81e24] text-[#c81e24] text-[10px] font-bold tracking-widest px-3 py-1 rotate-[-3deg]">
              {paymentLabel(order.payment_method, order.payment_status)}
            </span>
          </div>

          <Divider />

          <Barcode code={order.order_code} />
          <p className="text-center text-[10px] text-black/60 tracking-wider mt-2">{order.order_code}</p>

          <p className={`${caveat.className} text-center text-[#c81e24] text-4xl mt-2`}>Thank You!</p>

          <Divider />

          <div className="flex justify-between text-[10px] text-black/70">
            <span>{hotline ? `tel ${hotline}` : "Nairobi, Kenya"}</span>
            <span className="font-bold">{storeName.toUpperCase().replace(/\s+/g, "")}</span>
          </div>

          <p className="text-center text-[10px] text-black/60 leading-relaxed mt-3">
            Track this order anytime at thomex-prime-store.vercel.app/track-order
          </p>
        </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
}

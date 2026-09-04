"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchSettings } from "@/lib/supabaseSettings";

export default function ReturnsPage() {
  const [whatsapp, setWhatsapp] = useState("+254 700 123 456");
  const [supportEmail, setSupportEmail] = useState("support@thomex.co.ke");

  useEffect(() => {
    fetchSettings().then((r) => {
      if (r.data?.whatsapp_number) setWhatsapp(r.data.whatsapp_number);
      if (r.data?.support_email) setSupportEmail(r.data.support_email);
    });
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero banner */}
      <div className="relative bg-brand-dark py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">Returns & Refunds</h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            Straightforward, no-hassle policy for defective or incorrect items.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10 relative pb-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 space-y-8">
          {/* Quick facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand mx-auto mb-2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <p className="text-sm font-bold text-black dark:text-white">7 Days</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Return window from delivery</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand mx-auto mb-2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-sm font-bold text-black dark:text-white">Defective / Wrong Item</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Only qualifying reason</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand mx-auto mb-2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <p className="text-sm font-bold text-black dark:text-white">Full Refund or Replacement</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your choice, once approved</p>
            </div>
          </div>

          {/* Policy sections */}
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">Return Window</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              You have <strong>7 days from the date your order is marked Delivered</strong> to request a return.
              Requests made after this window cannot be accepted.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">What Qualifies</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              We currently accept returns only for:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                <span><strong>Defective items</strong> — the product doesn't work as expected out of the box, or develops a fault shortly after delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand mt-0.5 shrink-0"><path d="M20 6 9 17l-5-5" /></svg>
                <span><strong>Wrong item received</strong> — you were sent a different product, color, or variant than what you ordered.</span>
              </li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
              We're currently not able to accept returns for change-of-mind, incorrect sizing (where applicable), or buyer's remorse.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">How to Request a Return</h2>
            <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Contact us within 7 days of delivery via WhatsApp or the Contact form, including your order code and a photo of the issue.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Our team reviews your request and confirms whether it qualifies.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Once approved, we arrange pickup or return shipping, then process your refund or replacement.</span>
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">Refunds</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Approved refunds are issued to the original payment method (M-Pesa) or as store credit, depending on your preference.
              Refunds are typically processed within a few business days of us receiving the returned item.
            </p>
          </div>

          {/* CTA */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 text-center">
            <p className="text-sm font-semibold text-black dark:text-white mb-1">Need to start a return?</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Reach out with your order code and we'll take it from there.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              
              <a  href={"https://wa.me/" + whatsapp.replace(/\D/g, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                WhatsApp Us
              </a>
              
               <a href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 text-black dark:text-white px-5 py-2.5 rounded-md font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Contact Form
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">Or email us at {supportEmail}</p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

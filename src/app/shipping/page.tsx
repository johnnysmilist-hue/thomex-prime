"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const steps = [
  { title: "Order Placed", body: "As soon as you complete checkout, we start preparing your order for dispatch." },
  { title: "Processing", body: "Orders are typically processed and handed to our delivery partner within 1-2 business days." },
  { title: "On the Way", body: "You can track your order's status anytime using your order code on our Track Order page." },
  { title: "Delivered", body: "Your package arrives at the address you provided at checkout." },
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero banner */}
      <div className="relative bg-brand-dark py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">Shipping & Delivery</h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            Where we deliver, how long it takes, and what to expect.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10 relative pb-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 space-y-8">
          {/* Quick facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand mx-auto mb-2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-sm font-bold text-black dark:text-white">Nationwide</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">We deliver across Kenya</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand mx-auto mb-2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <p className="text-sm font-bold text-black dark:text-white">3-7 Days</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Typical delivery time</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand mx-auto mb-2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p className="text-sm font-bold text-black dark:text-white">Calculated at Checkout</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Based on your location</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">Where We Deliver</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              We deliver to all counties across Kenya. Delivery times can vary slightly depending on your location —
              major towns and cities are typically faster, while more remote areas may take a little longer.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">Delivery Timeframe</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Most orders arrive within <strong>3 to 7 business days</strong> of being placed, depending on your
              location and product availability. You'll see your order's real-time status on our{" "}
              <a href="/track-order" className="text-brand font-semibold">Track Order</a> page once it's confirmed.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">Shipping Fees</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Shipping costs are calculated based on your delivery location and shown clearly at checkout before
              you complete your order — there are no hidden fees added afterward.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-5">What Happens After You Order</h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.title} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-black dark:text-white">{step.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">Delivery Issues</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              If your order hasn't arrived within the expected timeframe, or arrives damaged, please reach out —
              see our <a href="/returns" className="text-brand font-semibold">Returns & Refunds</a> policy for
              what to do if an item arrives faulty or incorrect.
            </p>
          </div>

          {/* CTA */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 text-center">
            <p className="text-sm font-semibold text-black dark:text-white mb-1">Questions about your delivery?</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">We're happy to help track down your order.</p>
            
             <a href="/contact"
              className="inline-block bg-brand text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-brand-dark transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

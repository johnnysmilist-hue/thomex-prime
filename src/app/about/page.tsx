"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const trustPoints = [
  {
    title: "100% Authentic",
    subtitle: "Genuine products only",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
  },
  {
    title: "Trusted by Thousands",
    subtitle: "Happy customers across Kenya",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Honest Pricing",
    subtitle: "No inflated markups",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Fast Delivery",
    subtitle: "Wherever you are",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8Z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

const values = [
  {
    title: "We curate, not dump",
    body: "Every product on Thomex is picked by the spec — real capabilities, not just a catalog filled with anything that ships. If it's on the site, it's worth your money.",
  },
  {
    title: "Prices you can trust",
    body: "We keep our margins fair and our pricing transparent, so what you see is what you pay — no last-minute surprises at checkout.",
  },
  {
    title: "Delivery that actually shows up",
    body: "From order to doorstep, we track every step and keep you updated — because a great product means nothing if it doesn't arrive on time.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero banner */}
      <div className="relative bg-brand-dark py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">About Thomex</h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            Your one-stop shop for the latest tech and electronics — picked by the spec.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative pb-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 space-y-10">
          {/* Intro */}
          <div className="text-center max-w-xl mx-auto">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Thomex started with a simple idea: buying tech online shouldn't mean gambling on quality or
              getting quietly overcharged. We source genuine gadgets, price them honestly, and get them to
              you fast — wherever you are in Kenya.
            </p>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustPoints.map((point) => (
              <div key={point.title} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
                <span className="text-brand inline-flex mb-2">{point.icon}</span>
                <p className="text-sm font-bold text-black dark:text-white mb-1">{point.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{point.subtitle}</p>
              </div>
            ))}
          </div>

          {/* What we stand for */}
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white mb-5 text-center">What We Stand For</h2>
            <div className="space-y-5">
              {values.map((v) => (
                <div key={v.title} className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand mt-1 shrink-0">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-black dark:text-white mb-0.5">{v.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{v.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 text-center">
            <p className="text-sm font-semibold text-black dark:text-white mb-1">Have a question before you order?</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">We're happy to help you find the right product.</p>
            
             <a href="/contact"
              className="inline-block bg-brand text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-brand-dark transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

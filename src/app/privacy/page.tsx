"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "Information We Collect",
    body: (
      <>
        <p className="mb-3">When you use Thomex, we collect information you provide directly, including:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Your name, email address, and phone number</li>
          <li>Delivery address, county, and country</li>
          <li>Order history and items purchased</li>
          <li>Messages you send us via live chat or our contact form</li>
          <li>Product reviews and ratings you submit</li>
          <li>Wishlist and cart contents</li>
        </ul>
      </>
    ),
  },
  {
    title: "Payment Information",
    body: (
      <p>
        We do not store your M-Pesa PIN or full payment credentials. M-Pesa payments are processed directly through
        Safaricom's payment system. If you save a card for future reference, we only store the card brand, last 4
        digits, and expiry date — never the full card number or CVV, which are never transmitted to or stored on
        our servers.
      </p>
    ),
  },
  {
    title: "How We Use Your Information",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>To process and deliver your orders</li>
        <li>To send order confirmations and delivery updates via email or WhatsApp</li>
        <li>To respond to your questions through live chat or our contact form</li>
        <li>To improve our products and services based on reviews and feedback</li>
        <li>To notify you about your account activity, such as order status changes</li>
      </ul>
    ),
  },
  {
    title: "How We Store Your Information",
    body: (
      <p>
        Your data is stored securely using Supabase, our database and authentication provider. We take reasonable
        technical measures to protect your information from unauthorized access, but no method of electronic
        storage is 100% secure.
      </p>
    ),
  },
  {
    title: "Third-Party Services",
    body: (
      <>
        <p className="mb-3">We work with a small number of trusted third parties to operate our store:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Safaricom M-Pesa</strong> — to process mobile money payments</li>
          <li><strong>Supabase</strong> — to securely store and manage your account and order data</li>
          <li><strong>WhatsApp</strong> — to send order updates and communicate with our support team, if you choose to contact us that way</li>
        </ul>
        <p className="mt-3">
          These providers only receive the information necessary to perform their specific function and are not
          permitted to use your data for any other purpose.
        </p>
      </>
    ),
  },
  {
    title: "Cookies & Tracking",
    body: (
      <p>
        We currently use minimal tracking — mainly to keep you signed in and to remember items in your cart. We do
        not currently use third-party advertising cookies or sell your browsing data to advertisers.
      </p>
    ),
  },
  {
    title: "Your Rights",
    body: (
      <p>
        You can access, update, or request deletion of your personal information at any time by visiting your{" "}
        <a href="/account" className="text-brand font-semibold">Account</a> page or by{" "}
        <a href="/contact" className="text-brand font-semibold">contacting us</a> directly. We'll respond to
        reasonable requests within a reasonable timeframe.
      </p>
    ),
  },
  {
    title: "Changes to This Policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time as our services evolve. Continued use of Thomex after
        changes are posted means you accept the updated policy.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <div className="relative bg-brand-dark py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            How we collect, use, and protect your information.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10 relative pb-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 space-y-8">
          <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>

          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-black dark:text-white mb-2">{s.title}</h2>
              <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{s.body}</div>
            </div>
          ))}

          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 text-center">
            <p className="text-sm font-semibold text-black dark:text-white mb-1">Questions about your data?</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">We're happy to explain anything in more detail.</p>
            
            <a  href="/contact"
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

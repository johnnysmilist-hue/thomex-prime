"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: (
      <p>
        By accessing or placing an order on Thomex, you agree to be bound by these Terms & Conditions. If you do
        not agree with any part of these terms, please do not use our site or services.
      </p>
    ),
  },
  {
    title: "2. Products & Pricing",
    body: (
      <p>
        We make every effort to display accurate product information, pricing, and availability. However, errors
        may occasionally occur. If we discover a pricing or listing error after you've placed an order, we will
        contact you before processing the order to confirm whether you'd like to proceed at the correct price or
        cancel.
      </p>
    ),
  },
  {
    title: "3. Orders & Payment",
    body: (
      <>
        <p className="mb-3">We currently accept the following payment methods:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>M-Pesa</strong> — processed via STK push at checkout</li>
          <li><strong>Pay on Delivery</strong> — cash or M-Pesa paid when your order arrives</li>
        </ul>
        <p className="mt-3">
          An order is confirmed once payment is completed (for M-Pesa) or once submitted (for Pay on Delivery).
          We reserve the right to decline or cancel any order at our discretion, including in cases of suspected
          fraud, pricing errors, or stock unavailability.
        </p>
      </>
    ),
  },
  {
    title: "4. Shipping & Delivery",
    body: (
      <p>
        We deliver across Kenya and to a growing list of international destinations. Shipping fees are calculated
        based on your delivery location and shown at checkout before you complete your order. Estimated delivery
        times are outlined in our{" "}
        <a href="/shipping" className="text-brand font-semibold">Shipping & Delivery Policy</a>, but actual delivery
        times may vary due to factors outside our control.
      </p>
    ),
  },
  {
    title: "5. Returns & Refunds",
    body: (
      <p>
        Returns are accepted within 7 days of delivery for defective items or items received in error. Full details
        are available in our{" "}
        <a href="/returns" className="text-brand font-semibold">Returns & Refunds Policy</a>. We do not currently
        accept returns for change-of-mind purchases.
      </p>
    ),
  },
  {
    title: "6. Account Responsibilities",
    body: (
      <p>
        If you create an account with us, you're responsible for maintaining the confidentiality of your login
        credentials and for all activity that occurs under your account. Please notify us immediately if you
        suspect unauthorized use of your account.
      </p>
    ),
  },
  {
    title: "7. Product Reviews",
    body: (
      <p>
        When you leave a review, you agree that your feedback is honest and based on genuine experience with the
        product. We reserve the right to remove reviews that are abusive, fraudulent, or unrelated to the product.
      </p>
    ),
  },
  {
    title: "8. Limitation of Liability",
    body: (
      <p>
        Thomex is not liable for indirect, incidental, or consequential damages arising from the use of our site
        or products, to the fullest extent permitted by law. Our liability for any claim related to a purchase is
        limited to the amount you paid for that order.
      </p>
    ),
  },
  {
    title: "9. Changes to These Terms",
    body: (
      <p>
        We may update these Terms & Conditions from time to time. Continued use of Thomex after changes are posted
        means you accept the updated terms.
      </p>
    ),
  },
  {
    title: "10. Contact",
    body: (
      <p>
        If you have questions about these terms, please{" "}
        <a href="/contact" className="text-brand font-semibold">reach out to us</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <div className="relative bg-brand-dark py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">Terms & Conditions</h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            The rules that govern your use of Thomex.
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
            <p className="text-sm font-semibold text-black dark:text-white mb-1">Have a question about our terms?</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">We're happy to clarify anything.</p>
            
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

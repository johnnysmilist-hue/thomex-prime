"use client";

import { useState } from "react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqCategory = {
  id: string;
  label: string;
  items: FaqItem[];
};

const categories: FaqCategory[] = [
  {
    id: "general",
    label: "General Information",
    items: [
      {
        id: "place-order",
        question: "How can I place an order?",
        answer:
          "Browse our products, add items to your cart, and click Checkout. Follow the steps to enter your shipping details and payment method to complete your order.",
      },
      {
        id: "payment-methods",
        question: "What payment methods do you accept?",
        answer:
          "We accept PayPal, Visa, Google Pay, and Cash on Delivery. You can also save a card for faster checkout next time.",
      },
      {
        id: "track-order",
        question: "Can I track my order after it's been placed?",
        answer:
          "Yes. Once your order ships, you'll receive a tracking link by email. You can also track it anytime from the Track Order page using your order ID.",
      },
      {
        id: "customer-support",
        question: "Do you offer customer support?",
        answer:
          "Yes, our support team is available 24/7 through live chat. Click the chat icon in the bottom-right corner of any page to get started.",
      },
    ],
  },
  {
    id: "ordering-shipping",
    label: "Ordering & Shipping",
    items: [
      {
        id: "shipping-time",
        question: "How long does shipping take?",
        answer:
          "Standard shipping typically takes 3-7 business days depending on your location. Expedited options are available at checkout.",
      },
      {
        id: "shipping-cost",
        question: "Is shipping free?",
        answer:
          "Orders above a certain amount qualify for free shipping. The exact threshold is shown in your cart before checkout.",
      },
      {
        id: "change-address",
        question: "Can I change my shipping address after ordering?",
        answer:
          "If your order hasn't shipped yet, contact support as soon as possible and we'll do our best to update the address.",
      },
    ],
  },
  {
    id: "returns-exchanges",
    label: "Returns & Exchanges",
    items: [
      {
        id: "return-policy",
        question: "What is your return policy?",
        answer:
          "We accept returns within 30 days of delivery for items in their original condition. Visit the Returns page to start a request.",
      },
      {
        id: "exchange-item",
        question: "How do I exchange an item?",
        answer:
          "Start a return request and select 'Exchange' as the reason. Once we receive the original item, we'll ship the replacement.",
      },
    ],
  },
  {
    id: "payments-discounts",
    label: "Payments & Discounts",
    items: [
      {
        id: "coupon-codes",
        question: "How do I use a coupon code?",
        answer:
          "Enter your coupon code in the Order Summary section of your cart before checkout and click Apply.",
      },
      {
        id: "payment-security",
        question: "Is my payment information secure?",
        answer:
          "Yes, all payments are processed through encrypted, PCI-compliant payment providers. We never store your full card details.",
      },
    ],
  },
  {
    id: "account-profile",
    label: "Account & Profile",
    items: [
      {
        id: "create-account",
        question: "How do I create an account?",
        answer:
          "Click the account icon in the top navigation and select Sign Up. You'll need an email address and password to get started.",
      },
      {
        id: "reset-password",
        question: "How do I reset my password?",
        answer:
          "On the sign-in page, click 'Forgot password' and follow the instructions sent to your email.",
      },
    ],
  },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [openId, setOpenId] = useState<string | null>(null);

  const current = categories.find((c) => c.id === activeCategory) || categories[0];

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setOpenId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white">FAQs</h1>
        <p className="text-sm text-gray-400 mt-1">Home / FAQs</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Category sidebar */}
        <div className="md:w-56 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {categories.map((cat) => {
            const active = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={
                  "text-left px-4 py-3 rounded-md text-sm font-semibold whitespace-nowrap shrink-0 transition-colors " +
                  (active
                    ? "bg-brand text-white"
                    : "bg-gray-50 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700")
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Questions */}
        <div className="flex-1 space-y-3">
          {current.items.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={
                  "rounded-md border overflow-hidden transition-colors " +
                  (isOpen
                    ? "border-brand bg-brand/5"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900")
                }
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-black dark:text-white pr-4">
                    {faq.question}
                  </span>
                  <span
                    className={
                      "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold " +
                      (isOpen ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500")
                    }
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

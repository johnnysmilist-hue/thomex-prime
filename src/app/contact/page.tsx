"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const trustPoints = [
  { title: "100% Authentic", subtitle: "Genuine products only" },
  { title: "Trusted by Thousands", subtitle: "Happy customers across Kenya" },
  { title: "Price Match", subtitle: "Best prices, always" },
  { title: "Secure Checkout", subtitle: "Your data is protected" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold mb-3 text-black dark:text-white">About Thomex</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Thomex is your one-stop shop for the latest tech and electronics — picked by the spec.
            We source genuine gadgets at honest prices and get them to you fast, wherever you are.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {trustPoints.map((point) => (
            <div key={point.title} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-center">
              <p className="text-sm font-bold text-black dark:text-white mb-1">{point.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{point.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Get in Touch</h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>Hotline: +254 700 123 456</p>
              <p>Email: support@thomex.co.ke</p>
              <p>WhatsApp: +254 700 123 456</p>
              <p>Hours: Mon–Sat, 8am–7pm</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Send a Message</h2>

            {sent ? (
              <p className="text-sm text-green-600 dark:text-green-400">
                Thanks! We've received your message and will get back to you shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand"
                />
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand"
                />
                <textarea
                  required
                  placeholder="Your message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand resize-none"
                />
                <button
                  type="submit"
                  className="bg-brand text-white px-6 py-2 rounded-md font-semibold hover:bg-brand-dark transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

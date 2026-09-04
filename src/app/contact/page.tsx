"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchSettings } from "@/lib/supabaseSettings";
import { submitContactMessage } from "@/lib/supabaseContactMessages";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [hotline, setHotline] = useState("+254 700 123 456");
  const [supportEmail, setSupportEmail] = useState("support@thomex.co.ke");
  const [whatsapp, setWhatsapp] = useState("+254 700 123 456");

  useEffect(() => {
    fetchSettings().then((r) => {
      if (r.data?.hotline) setHotline(r.data.hotline);
      if (r.data?.support_email) setSupportEmail(r.data.support_email);
      if (r.data?.whatsapp_number) setWhatsapp(r.data.whatsapp_number);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);

    const { error: dbError } = await submitContactMessage({
      name,
      email,
      company: company || undefined,
      phone: phone || undefined,
      subject: subject || undefined,
      message,
    });

    setSending(false);

    if (dbError) {
      setError("Something went wrong sending your message. Please try again.");
      return;
    }

    setSent(true);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero banner */}
      <div className="relative bg-brand-dark py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
          <p className="text-white/80 text-sm max-w-md mx-auto">
            Thomex is ready to help with orders, products, or anything else you need.
          </p>
        </div>
      </div>

      {/* Card: Get in touch + Send message */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Get in touch */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-8">
            <h2 className="text-xl font-bold text-black dark:text-white mb-2">Get in Touch</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Have a question about an order or product? Reach out any way that works for you.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-bold text-black dark:text-white">Call Us</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{hotline}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 5L2 7" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-bold text-black dark:text-white">Email Us</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{supportEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-bold text-black dark:text-white">WhatsApp</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{whatsapp}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-5">
              <p className="text-sm font-bold text-black dark:text-white mb-3">Follow Us</p>
              <div className="flex gap-2">
                {["facebook", "instagram", "twitter", "youtube"].map((platform) => (
                  <a
                    key={platform}
                    href="#"
                    aria-label={platform}
                    className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center hover:opacity-90"
                  >
                    {platform === "facebook" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6v1.9h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" /></svg>
                    )}
                    {platform === "instagram" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    )}
                    {platform === "twitter" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.9c-.7.3-1.5.6-2.4.7.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.7 1a4.2 4.2 0 0 0-7.2 3.9A12 12 0 0 1 2.9 4.7a4.3 4.3 0 0 0 1.3 5.7c-.7 0-1.3-.2-1.9-.5v.1c0 2 1.5 3.7 3.4 4.1-.6.2-1.2.2-1.8.1.5 1.7 2.1 2.9 4 2.9A8.4 8.4 0 0 1 2 18.6a11.9 11.9 0 0 0 6.5 1.9c7.8 0 12-6.4 12-12v-.6c.8-.6 1.5-1.3 2-2Z" /></svg>
                    )}
                    {platform === "youtube" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.6-.5-5.3c-.3-1-1-1.7-2-2C18.9 4.2 12 4.2 12 4.2s-6.9 0-8.5.5c-1 .3-1.7 1-2 2C1 8.4 1 12 1 12s0 3.6.5 5.3c.3 1 1 1.7 2 2 1.6.5 8.5.5 8.5.5s6.9 0 8.5-.5c1-.3 1.7-1 2-2 .5-1.7.5-5.3.5-5.3ZM9.8 15.5V8.5L15.8 12Z" /></svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Send message form */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-black dark:text-white mb-6">Send Us a Message</h2>

            {sent ? (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-5 text-center">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Thanks! We've received your message and will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Company (optional)</label>
                    <input
                      type="text"
                      placeholder="Company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    required
                    placeholder="Your message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-brand resize-none"
                  />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-brand text-white py-3 rounded-full font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="h-14" />
      <Footer />
    </main>
  );
}

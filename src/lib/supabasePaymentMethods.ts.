import { supabase } from "./supabaseClient";

// SECURITY NOTE: This table must never store a full card number (PAN), CVV, or
// any other sensitive authentication data. Only the non-sensitive fields below
// are safe to persist in a normal database. Real card charging requires a
// PCI-compliant processor (e.g. Stripe, Flutterwave, Paystack) that tokenizes
// the card in the browser and returns a token — that token (not the card
// itself) is what a production version of this table should store.

export type PaymentMethod = {
  id: string;
  user_id: string;
  type: "card" | "paypal" | "google_pay";
  brand: string | null;
  last4: string | null;
  expiry_month: number | null;
  expiry_year: number | null;
  cardholder_name: string | null;
  linked: boolean;
  created_at: string;
};

export async function fetchPaymentMethods(userId: string) {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data as PaymentMethod[] | null, error };
}

export async function addCardPaymentMethod(params: {
  user_id: string;
  brand: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name: string;
}) {
  const { data, error } = await supabase
    .from("payment_methods")
    .insert({ ...params, type: "card", linked: true })
    .select()
    .single();
  return { data: data as PaymentMethod | null, error };
}

export async function deletePaymentMethod(id: string) {
  const { error } = await supabase.from("payment_methods").delete().eq("id", id);
  return { error };
}

export function detectCardBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\s/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  return "Card";
}

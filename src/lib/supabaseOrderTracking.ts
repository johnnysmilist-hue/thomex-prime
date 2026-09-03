import { supabase } from "@/lib/supabaseClient";

export type StatusHistoryRow = {
  id: string;
  order_id: string;
  status: string;
  changed_at: string;
};

export type DeliveryFeedback = {
  id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export async function fetchStatusHistory(orderId: string) {
  return supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", orderId)
    .order("changed_at", { ascending: true });
}

export async function fetchDeliveryFeedback(orderId: string) {
  return supabase
    .from("delivery_feedback")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
}

export async function submitDeliveryFeedback(orderId: string, rating: number, comment: string) {
  return supabase
    .from("delivery_feedback")
    .insert({ order_id: orderId, rating, comment: comment || null })
    .select()
    .single();
}

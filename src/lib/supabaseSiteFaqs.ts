import { supabase } from "@/lib/supabaseClient";

export type SiteFaq = {
  id: string;
  category_id: string;
  category_label: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
};

export async function fetchSiteFaqs() {
  return supabase
    .from("site_faqs")
    .select("*")
    .order("category_label", { ascending: true })
    .order("sort_order", { ascending: true });
}

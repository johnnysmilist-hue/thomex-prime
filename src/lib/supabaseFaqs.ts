import { supabase } from "@/lib/supabaseClient";

export type ProductFaq = {
  id: string;
  product_id: string;
  question: string;
  answer: string;
  sort_order: number;
};

export async function fetchProductFaqs(productId: string) {
  const { data, error } = await supabase
    .from("product_faqs")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return { data: data as ProductFaq[] | null, error };
}

export async function addProductFaq(faq: Omit<ProductFaq, "id">) {
  const { data, error } = await supabase.from("product_faqs").insert(faq).select().single();
  return { data: data as ProductFaq | null, error };
}

export async function deleteProductFaq(id: string) {
  const { error } = await supabase.from("product_faqs").delete().eq("id", id);
  return { error };
}

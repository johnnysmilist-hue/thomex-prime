import { supabase } from "@/lib/supabaseClient";

export type ProductSpec = {
  id: string;
  product_id: string;
  label: string;
  value: string;
  sort_order: number;
};

export async function fetchProductSpecs(productId: string) {
  return supabase
    .from("product_specs")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
}

export async function addProductSpec(productId: string, label: string, value: string, sortOrder: number) {
  return supabase
    .from("product_specs")
    .insert({ product_id: productId, label, value, sort_order: sortOrder })
    .select()
    .single();
}

export async function updateProductSpec(id: string, label: string, value: string) {
  return supabase.from("product_specs").update({ label, value }).eq("id", id);
}

export async function deleteProductSpec(id: string) {
  return supabase.from("product_specs").delete().eq("id", id);
}

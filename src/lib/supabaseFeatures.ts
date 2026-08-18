import { supabase } from "@/lib/supabaseClient";

export type ProductFeature = {
  id: string;
  product_id: string;
  icon: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export async function fetchProductFeatures(productId: string) {
  const { data, error } = await supabase
    .from("product_features")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return { data: data as ProductFeature[] | null, error };
}

export async function addProductFeature(feature: Omit<ProductFeature, "id">) {
  const { data, error } = await supabase.from("product_features").insert(feature).select().single();
  return { data: data as ProductFeature | null, error };
}

export async function deleteProductFeature(id: string) {
  const { error } = await supabase.from("product_features").delete().eq("id", id);
  return { error };
}

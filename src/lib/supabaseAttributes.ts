import { supabase } from "@/lib/supabaseClient";

export type Attribute = {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_modifier: number;
  stock: number;
  image_url: string | null;
};

export async function fetchAttributes(productId: string) {
  const { data, error } = await supabase
    .from("product_attributes")
    .select("*")
    .eq("product_id", productId);
  return { data: data as Attribute[] | null, error };
}

export async function addAttribute(attribute: Omit<Attribute, "id">) {
  const { data, error } = await supabase.from("product_attributes").insert(attribute).select().single();
  return { data: data as Attribute | null, error };
}

export async function deleteAttribute(id: string) {
  const { error } = await supabase.from("product_attributes").delete().eq("id", id);
  return { error };
}

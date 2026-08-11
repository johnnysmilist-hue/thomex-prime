import { supabase } from "@/lib/supabaseClient";

export type DbProduct = {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  rating: number;
  review_count: number;
  discount_percent: number | null;
  category: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data as DbProduct[] | null, error };
}

export async function addProduct(product: Omit<DbProduct, "id" | "created_at">) {
  const { data, error } = await supabase.from("products").insert(product).select().single();
  return { data: data as DbProduct | null, error };
}

export async function updateProduct(id: string, product: Partial<Omit<DbProduct, "id" | "created_at">>) {
  const { data, error } = await supabase.from("products").update(product).eq("id", id).select().single();
  return { data: data as DbProduct | null, error };
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return { error };
}

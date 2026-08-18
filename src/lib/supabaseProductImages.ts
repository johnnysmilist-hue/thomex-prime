import { supabase } from "@/lib/supabaseClient";

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
};

export async function fetchProductImages(productId: string) {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return { data: data as ProductImage[] | null, error };
}

export async function addProductImage(productId: string, imageUrl: string, sortOrder: number) {
  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, image_url: imageUrl, sort_order: sortOrder })
    .select()
    .single();
  return { data: data as ProductImage | null, error };
}

export async function deleteProductImage(id: string) {
  const { error } = await supabase.from("product_images").delete().eq("id", id);
  return { error };
}

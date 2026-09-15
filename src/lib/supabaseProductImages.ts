import { supabase } from "@/lib/supabaseClient";

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  media_type: string;
};

export async function fetchProductImages(productId: string) {
  return supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
}

export async function addProductImage(productId: string, imageUrl: string, sortOrder: number, mediaType: string = "image") {
  return supabase
    .from("product_images")
    .insert({ product_id: productId, image_url: imageUrl, sort_order: sortOrder, media_type: mediaType })
    .select()
    .single();
}

export async function deleteProductImage(id: string) {
  return supabase.from("product_images").delete().eq("id", id);
}

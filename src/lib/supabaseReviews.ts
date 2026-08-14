import { supabase } from "@/lib/supabaseClient";

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  username: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export async function fetchReviews(productId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return { data: data as Review[] | null, error };
}

export async function fetchUserReview(productId: string, userId: string) {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();
  return { data: data as Review | null };
}

async function recomputeProductRating(productId: string) {
  const { data } = await supabase.from("reviews").select("rating").eq("product_id", productId);
  if (!data) return;

  const count = data.length;
  const avg = count > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  await supabase
    .from("products")
    .update({ rating: Math.round(avg * 10) / 10, review_count: count })
    .eq("id", productId);
}

export async function upsertReview(review: { product_id: string; user_id: string; username: string; rating: number; comment: string }) {
  const { error } = await supabase.from("reviews").upsert(review, { onConflict: "product_id,user_id" });
  if (!error) {
    await recomputeProductRating(review.product_id);
  }
  return { error };
}

export async function deleteReview(id: string, productId: string) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (!error) {
    await recomputeProductRating(productId);
  }
  return { error };
}

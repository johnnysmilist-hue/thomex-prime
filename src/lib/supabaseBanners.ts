import { supabase } from "@/lib/supabaseClient";

export type Banner = {
  id: string;
  slot: string;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

export async function fetchBanners() {
  const { data, error } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
  return { data: data as Banner[] | null, error };
}

export async function fetchBannerBySlot(slot: string) {
  const { data, error } = await supabase.from("banners").select("*").eq("slot", slot).single();
  return { data: data as Banner | null, error };
}

export async function fetchActiveSlides(slot: string) {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("slot", slot)
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return { data: data as Banner[] | null, error };
}

export async function updateBanner(id: string, banner: Partial<Omit<Banner, "id" | "slot">>) {
  const { data, error } = await supabase.from("banners").update(banner).eq("id", id).select().single();
  return { data: data as Banner | null, error };
}

export async function addBanner(banner: Omit<Banner, "id">) {
  const { data, error } = await supabase.from("banners").insert(banner).select().single();
  return { data: data as Banner | null, error };
}

export async function deleteBanner(id: string) {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  return { error };
}

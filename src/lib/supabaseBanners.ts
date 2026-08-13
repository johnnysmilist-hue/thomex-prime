import { supabase } from "@/lib/supabaseClient";

export type Banner = {
  id: string;
  slot: string;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string | null;
};

export async function fetchBanners() {
  const { data, error } = await supabase.from("banners").select("*");
  return { data: data as Banner[] | null, error };
}

export async function fetchBannerBySlot(slot: string) {
  const { data, error } = await supabase.from("banners").select("*").eq("slot", slot).single();
  return { data: data as Banner | null, error };
}

export async function updateBanner(id: string, banner: Partial<Omit<Banner, "id" | "slot">>) {
  const { data, error } = await supabase.from("banners").update(banner).eq("id", id).select().single();
  return { data: data as Banner | null, error };
}

import { supabase } from "@/lib/supabaseClient";

export type ShippingRate = {
  id: string;
  county: string;
  fee: number;
};

export async function fetchShippingRates() {
  return supabase.from("shipping_rates").select("*").order("county", { ascending: true });
}

export async function fetchShippingRateForCounty(county: string) {
  return supabase.from("shipping_rates").select("*").eq("county", county).maybeSingle();
}

export async function updateShippingRate(id: string, fee: number) {
  return supabase.from("shipping_rates").update({ fee }).eq("id", id);
}

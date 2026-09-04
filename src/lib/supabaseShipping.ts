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
export type CountryRate = {
  id: string;
  country: string;
  fee: number;
};

export async function fetchCountryRates() {
  return supabase.from("country_shipping_rates").select("*").order("country", { ascending: true });
}

export async function updateCountryRate(id: string, fee: number) {
  return supabase.from("country_shipping_rates").update({ fee }).eq("id", id);
}

export async function addCountryRate(country: string, fee: number) {
  return supabase.from("country_shipping_rates").insert({ country, fee }).select().single();
}

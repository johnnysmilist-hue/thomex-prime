import { supabase } from "@/lib/supabaseClient";

export type StoreSettings = {
  id: string;
  store_name: string;
  support_email: string | null;
  whatsapp_number: string | null;
  hotline: string | null;
  address: string | null;
  currency: string;
  free_shipping_threshold: number;
};

export async function fetchSettings() {
  const { data, error } = await supabase.from("store_settings").select("*").limit(1).single();
  return { data: data as StoreSettings | null, error };
}

export async function updateSettings(id: string, settings: Partial<Omit<StoreSettings, "id">>) {
  const { data, error } = await supabase.from("store_settings").update(settings).eq("id", id).select().single();
  return { data: data as StoreSettings | null, error };
}

import { supabase } from "./supabaseClient";

export type Station = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  active: boolean;
  created_at: string;
};

export async function fetchStations() {
  const { data, error } = await supabase.from("stations").select("*").order("name", { ascending: true });
  return { data: data as Station[] | null, error };
}

export async function fetchStationById(id: string) {
  const { data, error } = await supabase.from("stations").select("*").eq("id", id).maybeSingle();
  return { data: data as Station | null, error };
}

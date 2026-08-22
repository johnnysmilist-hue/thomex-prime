import { supabase } from "./supabaseClient";

export type Brand = {
  id: string;
  name: string;
  logo_url: string;
  created_at: string;
};

export async function fetchBrands() {
  const { data, error } = await supabase.from("brands").select("*").order("name", { ascending: true });
  return { data: data as Brand[] | null, error };
}

export async function addBrand(name: string, logoUrl: string) {
  const { data, error } = await supabase
    .from("brands")
    .insert({ name: name.trim(), logo_url: logoUrl })
    .select()
    .single();
  return { data: data as Brand | null, error };
}

export async function deleteBrand(id: string) {
  const { error } = await supabase.from("brands").delete().eq("id", id);
  return { error };
}

export async function uploadBrandLogo(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = "brand-" + Math.random().toString(36).substring(2) + "." + fileExt;

  const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, file);

  if (uploadError) {
    return { url: null, error: uploadError };
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  return { url: data.publicUrl, error: null };
}

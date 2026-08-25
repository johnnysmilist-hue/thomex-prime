import { supabase } from "@/lib/supabaseClient";

export type SiteCategory = {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
};

export type SiteSubcategory = {
  id: string;
  category_id: string;
  name: string;
  image_url: string | null;
  sort_order: number;
};

export async function fetchCategories() {
  const { data, error } = await supabase.from("site_categories").select("*").order("sort_order", { ascending: true });
  return { data: data as SiteCategory[] | null, error };
}

export async function fetchSubcategories(categoryId: string) {
  const { data, error } = await supabase.from("site_subcategories").select("*").eq("category_id", categoryId).order("sort_order", { ascending: true });
  return { data: data as SiteSubcategory[] | null, error };
}

export async function fetchAllSubcategories() {
  const { data, error } = await supabase.from("site_subcategories").select("*").order("sort_order", { ascending: true });
  return { data: data as SiteSubcategory[] | null, error };
}

export async function addCategory(category: Omit<SiteCategory, "id">) {
  const { data, error } = await supabase.from("site_categories").insert(category).select().single();
  return { data: data as SiteCategory | null, error };
}

export async function updateCategory(id: string, category: Partial<Omit<SiteCategory, "id">>) {
  const { data, error } = await supabase.from("site_categories").update(category).eq("id", id).select().single();
  return { data: data as SiteCategory | null, error };
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("site_categories").delete().eq("id", id);
  return { error };
}

export async function addSubcategory(subcategory: Omit<SiteSubcategory, "id">) {
  const { data, error } = await supabase.from("site_subcategories").insert(subcategory).select().single();
  return { data: data as SiteSubcategory | null, error };
}

export async function updateSubcategory(id: string, subcategory: Partial<Omit<SiteSubcategory, "id">>) {
  const { data, error } = await supabase.from("site_subcategories").update(subcategory).eq("id", id).select().single();
  return { data: data as SiteSubcategory | null, error };
}

export async function deleteSubcategory(id: string) {
  const { error } = await supabase.from("site_subcategories").delete().eq("id", id);
  return { error };
}

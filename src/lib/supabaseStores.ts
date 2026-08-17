import { supabase } from "@/lib/supabaseClient";

export type Store = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  id_document_url: string | null;
  business_document_url: string | null;
  status: string;
  created_at: string;
};

export async function fetchStoreByOwner(ownerId: string) {
  const { data, error } = await supabase.from("stores").select("*").eq("owner_id", ownerId).maybeSingle();
  return { data: data as Store | null, error };
}

export async function fetchStoreById(id: string) {
  const { data, error } = await supabase.from("stores").select("*").eq("id", id).single();
  return { data: data as Store | null, error };
}

export async function fetchAllStores() {
  const { data, error } = await supabase.from("stores").select("*").order("created_at", { ascending: false });
  return { data: data as Store[] | null, error };
}

export async function fetchApprovedStores() {
  const { data, error } = await supabase.from("stores").select("*").eq("status", "Approved").order("created_at", { ascending: false });
  return { data: data as Store[] | null, error };
}

export async function applyAsStore(store: Omit<Store, "id" | "created_at" | "status">) {
  const { data, error } = await supabase.from("stores").insert({ ...store, status: "Pending" }).select().single();
  return { data: data as Store | null, error };
}

export async function updateStoreStatus(id: string, status: string) {
  const { error } = await supabase.from("stores").update({ status }).eq("id", id);
  return { error };
}

export async function uploadStoreDocument(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = Math.random().toString(36).substring(2) + "." + fileExt;

  const { error: uploadError } = await supabase.storage
    .from("store-documents")
    .upload(fileName, file);

  if (uploadError) {
    return { url: null, error: uploadError };
  }

  const { data } = supabase.storage.from("store-documents").getPublicUrl(fileName);
  return { url: data.publicUrl, error: null };
}

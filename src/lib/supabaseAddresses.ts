import { supabase } from "./supabaseClient";

export type Address = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  is_default: boolean;
  created_at: string;
};

export async function fetchAddresses(userId: string) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  return { data: data as Address[] | null, error };
}

export async function addAddress(address: Omit<Address, "id" | "created_at">) {
  const { data, error } = await supabase.from("addresses").insert(address).select().single();
  return { data: data as Address | null, error };
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  return { error };
}

export async function setDefaultAddress(userId: string, id: string) {
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
  const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
  return { error };
}

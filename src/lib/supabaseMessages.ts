import { supabase } from "./supabaseClient";

export type VendorMessage = {
  id: string;
  store_id: string;
  sender: "admin" | "vendor";
  body: string;
  created_at: string;
  read_by_admin: boolean;
  read_by_vendor: boolean;
};

export async function fetchVendorMessages(storeId: string) {
  const { data, error } = await supabase
    .from("vendor_messages")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });
  return { data: data as VendorMessage[] | null, error };
}

export async function sendVendorMessage(storeId: string, sender: "admin" | "vendor", body: string) {
  const { data, error } = await supabase
    .from("vendor_messages")
    .insert({
      store_id: storeId,
      sender,
      body,
      read_by_admin: sender === "admin",
      read_by_vendor: sender === "vendor",
    })
    .select()
    .single();
  return { data: data as VendorMessage | null, error };
}

export async function markMessagesRead(storeId: string, reader: "admin" | "vendor") {
  const field = reader === "admin" ? "read_by_admin" : "read_by_vendor";
  await supabase.from("vendor_messages").update({ [field]: true }).eq("store_id", storeId);
}

export async function countUnreadMessages(storeId: string, reader: "admin" | "vendor") {
  const field = reader === "admin" ? "read_by_admin" : "read_by_vendor";
  const otherSender = reader === "admin" ? "vendor" : "admin";
  const { count } = await supabase
    .from("vendor_messages")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId)
    .eq("sender", otherSender)
    .eq(field, false);
  return count || 0;
}

// For the admin side: unread counts across every vendor thread at once.
export async function fetchUnreadCountsByStore() {
  const { data } = await supabase
    .from("vendor_messages")
    .select("store_id")
    .eq("sender", "vendor")
    .eq("read_by_admin", false);

  const counts: Record<string, number> = {};
  (data || []).forEach((row: { store_id: string }) => {
    counts[row.store_id] = (counts[row.store_id] || 0) + 1;
  });
  return counts;
}

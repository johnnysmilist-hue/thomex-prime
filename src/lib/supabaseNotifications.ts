import { supabase } from "./supabaseClient";

export type Notification = {
  id: string;
  recipient_type: "customer" | "vendor" | "admin";
  recipient_id: string;
  title: string;
  body: string;
  order_id: string | null;
  read: boolean;
  created_at: string;
};

export const ADMIN_RECIPIENT_ID = "admin";
export async function fetchNotifications(recipientType: "customer" | "vendor" | "admin", recipientId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_type", recipientType)
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(30);
  return { data: data as Notification[] | null, error };
}

export async function createNotification(notification: {
  recipient_type: "customer" | "vendor" | "admin";
  recipient_id: string;
  title: string;
  body: string;
  order_id?: string | null;
}) {
  const { error } = await supabase.from("notifications").insert({ ...notification, read: false });
  return { error };
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  return { error };
}

export async function markAllNotificationsRead(recipientType: "customer" | "vendor" | "admin", recipientId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("recipient_type", recipientType)
    .eq("recipient_id", recipientId)
    .eq("read", false);
  return { error };
}

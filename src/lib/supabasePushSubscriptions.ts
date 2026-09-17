import { supabase } from "./supabaseClient";

type RecipientType = "customer" | "vendor" | "admin";

export async function savePushSubscription(recipientType: RecipientType, recipientId: string, sub: PushSubscriptionJSON) {
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return { error: new Error("Invalid push subscription") };
  }
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      recipient_type: recipientType,
      recipient_id: recipientId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    { onConflict: "endpoint" }
  );
  return { error };
}

export async function deletePushSubscription(endpoint: string) {
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return { error };
}

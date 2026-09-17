import { supabase } from "./supabaseClient";
import { createNotification } from "./supabaseNotifications";

export type DeliveryOfficer = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  active: boolean;
  station_id: string | null;
  created_at: string;
};

export async function setOfficerStation(id: string, stationId: string | null) {
  const { error } = await supabase.from("delivery_officers").update({ station_id: stationId }).eq("id", id);
  return { error };
}

export async function fetchOfficers() {
  const { data, error } = await supabase.from("delivery_officers").select("*").order("created_at", { ascending: false });
  return { data: data as DeliveryOfficer[] | null, error };
}

export async function fetchOfficerByUserId(userId: string) {
  const { data, error } = await supabase.from("delivery_officers").select("*").eq("user_id", userId).maybeSingle();
  return { data: data as DeliveryOfficer | null, error };
}

// Promotes an existing registered account to a delivery officer. userId must
// be a real Supabase Auth user id (picked from the registered-users list).
export async function createOfficerFromUser(userId: string, name: string, phone: string) {
  const { data, error } = await supabase
    .from("delivery_officers")
    .insert({ user_id: userId, name, phone, active: true })
    .select()
    .single();
  return { data: data as DeliveryOfficer | null, error };
}

export async function updateOfficerPhone(id: string, phone: string) {
  const { error } = await supabase.from("delivery_officers").update({ phone }).eq("id", id);
  return { error };
}

export async function toggleOfficerActive(id: string, active: boolean) {
  const { error } = await supabase.from("delivery_officers").update({ active }).eq("id", id);
  return { error };
}

export async function deleteOfficer(id: string) {
  const { error } = await supabase.from("delivery_officers").delete().eq("id", id);
  return { error };
}

export async function assignOfficerToOrder(orderId: string, officerId: string | null) {
  const { data: order } = await supabase.from("orders").select("order_code, user_id").eq("id", orderId).maybeSingle();

  const { error } = await supabase
    .from("orders")
    .update({ assigned_officer_id: officerId, status: officerId ? "Assigned" : "Pending" })
    .eq("id", orderId);

  if (!error && officerId && order?.user_id) {
    await createNotification({
      recipient_type: "customer",
      recipient_id: order.user_id,
      title: "Order " + order.order_code + " assigned for delivery",
      body: "A delivery officer has been assigned to your order.",
      order_id: orderId,
    });
  }

  return { error };
}

export async function markPickedUp(orderId: string, orderCode: string, userId: string | null) {
  const { error } = await supabase
    .from("orders")
    .update({ status: "Out for Delivery", picked_up_at: new Date().toISOString() })
    .eq("id", orderId);

  if (!error && userId) {
    await createNotification({
      recipient_type: "customer",
      recipient_id: userId,
      title: "Order " + orderCode + " is on its way",
      body: "Your order has been picked up from the store and is out for delivery.",
      order_id: orderId,
    });
  }

  return { error };
}

export async function markDelivered(orderId: string, orderCode: string, userId: string | null) {
  const { error } = await supabase
    .from("orders")
    .update({ status: "Delivered", delivered_at: new Date().toISOString() })
    .eq("id", orderId);

  if (!error && userId) {
    await createNotification({
      recipient_type: "customer",
      recipient_id: userId,
      title: "Order " + orderCode + " delivered",
      body: "Your order has been marked as delivered. Thanks for shopping with us!",
      order_id: orderId,
    });
  }

  return { error };
}

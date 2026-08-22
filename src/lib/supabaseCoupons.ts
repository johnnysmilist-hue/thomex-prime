import { supabase } from "./supabaseClient";

export type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
};

export async function fetchCoupons() {
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  return { data: data as Coupon[] | null, error };
}

export async function addCoupon(coupon: {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number | null;
  max_uses: number | null;
  expires_at: string | null;
}) {
  const { data, error } = await supabase
    .from("coupons")
    .insert({ ...coupon, code: coupon.code.trim().toUpperCase(), active: true, uses_count: 0 })
    .select()
    .single();
  return { data: data as Coupon | null, error };
}

export async function toggleCoupon(id: string, active: boolean) {
  const { error } = await supabase.from("coupons").update({ active }).eq("id", id);
  return { error };
}

export async function deleteCoupon(id: string) {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  return { error };
}

export type CouponValidationResult =
  | { valid: true; coupon: Coupon; discountAmount: number }
  | { valid: false; message: string };

export async function validateCoupon(code: string, orderTotal: number): Promise<CouponValidationResult> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (error || !data) {
    return { valid: false, message: "Coupon code not found." };
  }

  const coupon = data as Coupon;

  if (!coupon.active) {
    return { valid: false, message: "This coupon is no longer active." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, message: "This coupon has expired." };
  }
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return { valid: false, message: "This coupon has reached its usage limit." };
  }
  if (coupon.min_order !== null && orderTotal < coupon.min_order) {
    return { valid: false, message: "Minimum order of $" + coupon.min_order.toFixed(2) + " required for this coupon." };
  }

  const discountAmount =
    coupon.discount_type === "percent" ? (orderTotal * coupon.discount_value) / 100 : Math.min(coupon.discount_value, orderTotal);

  return { valid: true, coupon, discountAmount };
}

export async function incrementCouponUsage(id: string, currentUses: number) {
  await supabase.from("coupons").update({ uses_count: currentUses + 1 }).eq("id", id);
}

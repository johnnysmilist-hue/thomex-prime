import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { queryStkStatus } from "@/lib/mpesa";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("payment_status, mpesa_checkout_request_id, mpesa_receipt_number")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If the callback hasn't landed yet, fall back to asking Safaricom directly.
  if (order.payment_status === "pending" && order.mpesa_checkout_request_id) {
    try {
      const result = await queryStkStatus(order.mpesa_checkout_request_id);
      if (result?.ResultCode === "0" || result?.ResultCode === 0) {
        await supabaseAdmin.from("orders").update({ payment_status: "paid" }).eq("id", orderId);
        return NextResponse.json({ status: "paid" });
      }
      if (result?.ResultCode && result.ResultCode !== "1032" && result.ResultCode !== 1032) {
        // 1032 = request still pending / cancelled by user check pending; anything else final = failed
        await supabaseAdmin.from("orders").update({ payment_status: "failed" }).eq("id", orderId);
        return NextResponse.json({ status: "failed" });
      }
    } catch {
      // Query failed (e.g. still processing) — just report current DB status below.
    }
  }

  return NextResponse.json({
    status: order.payment_status,
    receiptNumber: order.mpesa_receipt_number || null,
  });
}

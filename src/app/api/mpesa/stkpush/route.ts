import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { initiateStkPush, normalizeMpesaPhone } from "@/lib/mpesa";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, phone, amount, orderCode } = body;

    if (!orderId || !phone || !amount) {
      return NextResponse.json({ error: "Missing orderId, phone, or amount." }, { status: 400 });
    }

    const normalizedPhone = normalizeMpesaPhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json({ error: "Enter a valid Safaricom number, e.g. 07XXXXXXXX." }, { status: 400 });
    }

    const stk = await initiateStkPush({
      phone: normalizedPhone,
      amount,
      accountReference: orderCode || orderId,
      transactionDesc: "Thomex order " + (orderCode || orderId),
    });

    await getSupabaseAdmin()
      .from("orders")
      .update({
        mpesa_checkout_request_id: stk.CheckoutRequestID,
        payment_status: "pending",
      })
      .eq("id", orderId);

    return NextResponse.json({
      success: true,
      checkoutRequestId: stk.CheckoutRequestID,
      message: stk.CustomerMessage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start M-Pesa payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

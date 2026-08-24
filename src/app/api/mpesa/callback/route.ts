import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type CallbackMetadataItem = { Name: string; Value?: string | number };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Ignored — no stkCallback payload" });
    }

    const checkoutRequestId = stkCallback.CheckoutRequestID as string;
    const resultCode = stkCallback.ResultCode as number;
    const supabaseAdmin = getSupabaseAdmin();

    if (resultCode === 0) {
      const items: CallbackMetadataItem[] = stkCallback.CallbackMetadata?.Item || [];
      const getVal = (name: string) => items.find((i) => i.Name === name)?.Value;

      const mpesaReceiptNumber = getVal("MpesaReceiptNumber");

      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          mpesa_receipt_number: mpesaReceiptNumber || null,
        })
        .eq("mpesa_checkout_request_id", checkoutRequestId);
    } else {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("mpesa_checkout_request_id", checkoutRequestId);
    }

    // Safaricom expects a fast 200 response with this exact shape, regardless of outcome.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Received" });
  } catch {
    // Still acknowledge — Safaricom retries aggressively on non-200 responses.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Received" });
  }
}

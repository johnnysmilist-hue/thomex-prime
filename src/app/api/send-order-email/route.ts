import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing from environment");
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await request.json();
       const { to, orderCode, customerName, items, total, address, phone } = body;
    console.log("Received 'to' value:", JSON.stringify(to));

    if (!to || !orderCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const itemsHtml = items
      .map(
        (item: { name: string; qty: number; price: number }) =>
          "<tr><td style='padding:6px 0;'>" + item.name + " x" + item.qty + "</td><td style='padding:6px 0;text-align:right;'>KSh " + (item.price * item.qty).toFixed(2) + "</td></tr>"
      )
      .join("");

    const html =
      "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;'>" +
      "<h2>Order Confirmed - " + orderCode + "</h2>" +
      "<p>Hi " + customerName + ", thanks for your order! Here's a summary:</p>" +
      "<table style='width:100%;border-collapse:collapse;'>" + itemsHtml + "</table>" +
      "<p style='font-weight:bold;margin-top:12px;'>Total: KSh " + total.toFixed(2) + "</p>" +
      "<p style='color:#555;font-size:13px;'>Delivery to: " + address + "<br/>Phone: " + phone + "</p>" +
      "<p style='color:#555;font-size:13px;'>Track your order anytime using code <strong>" + orderCode + "</strong> at our website.</p>" +
      "</div>";

    const { data, error } = await resend.emails.send({
      from: "Thomex <onboarding@resend.dev>",
      to,
      subject: "Your Thomex Order " + orderCode,
      html,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Email sent successfully:", JSON.stringify(data));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in send-order-email:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@example.com";

export async function POST(request: Request) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      // Push isn't configured — this is expected until VAPID keys are set,
      // and shouldn't break the notification-creation flow that calls this.
      return NextResponse.json({ skipped: true, reason: "VAPID keys not configured" });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const { recipient_type, recipient_id, title, body, url, tag } = await request.json();
    if (!recipient_type || !recipient_id || !title) {
      return NextResponse.json({ error: "recipient_type, recipient_id and title are required." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: subs, error } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("recipient_type", recipient_type)
      .eq("recipient_id", recipient_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const payload = JSON.stringify({ title, body: body || "", url: url || "/", tag: tag || undefined });

    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
      )
    );

    // A 404/410 from the push service means that subscription is dead — remove it.
    const deadIds: string[] = [];
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const statusCode = (r.reason as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) deadIds.push(subs[i].id);
      }
    });
    if (deadIds.length > 0) {
      await admin.from("push_subscriptions").delete().in("id", deadIds);
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ sent, pruned: deadIds.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

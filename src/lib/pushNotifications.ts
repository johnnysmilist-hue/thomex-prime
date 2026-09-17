import { savePushSubscription, deletePushSubscription } from "./supabasePushSubscriptions";

type RecipientType = "customer" | "vendor" | "admin";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function pushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export async function getPushPermissionState(): Promise<NotificationPermission | "unsupported"> {
  if (!pushSupported()) return "unsupported";
  return Notification.permission;
}

export async function subscribeToPush(recipientType: RecipientType, recipientId: string) {
  if (!pushSupported()) return { error: new Error("Push notifications aren't supported in this browser.") };

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return { error: new Error("Push isn't configured yet (missing VAPID key).") };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { error: new Error("Notification permission was not granted.") };

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let sub = await registration.pushManager.getSubscription();
  if (!sub) {
    sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
  }

  const { error } = await savePushSubscription(recipientType, recipientId, sub.toJSON());
  return { error };
}

export async function unsubscribeFromPush() {
  if (!pushSupported()) return { error: null };
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const sub = await registration?.pushManager.getSubscription();
  if (!sub) return { error: null };

  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  const { error } = await deletePushSubscription(endpoint);
  return { error };
}

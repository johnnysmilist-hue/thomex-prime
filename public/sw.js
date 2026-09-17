// Thomex push notification service worker.
// This file must live at the site root (/sw.js) so its scope covers the whole app.

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Thomex", body: event.data.text() };
  }

  const { title, body, url, tag } = payload;

  event.waitUntil(
    (async () => {
      // If the user already has a Thomex tab open and focused, the in-app
      // toast handles it — skip the OS notification so they don't see both.
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const hasFocusedClient = clientList.some((client) => client.focused);
      if (hasFocusedClient) return;

      await self.registration.showNotification(title || "Thomex", {
        body: body || "",
        icon: "/logo-dark.png",
        badge: "/logo-dark.png",
        tag: tag || undefined,
        data: { url: url || "/" },
      });
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) await client.navigate(targetUrl);
          return;
        }
      }
      await self.clients.openWindow(targetUrl);
    })()
  );
});

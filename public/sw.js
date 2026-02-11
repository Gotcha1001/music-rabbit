// Helper: VAPID key converter
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Install
self.addEventListener("install", () => {
  self.skipWaiting();
  console.log("Service Worker installed");
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  console.log("Service Worker activated");
});

// Push → show notification
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const title = data.title || "Music Rabbit Reminder";

  const options = {
    body: data.body || "You have an upcoming lesson!",
    icon: "/logo.png",
    badge: "/badge-icon.png",
    tag: data.tag || "lesson-reminder",
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || "/",
    },
    actions: [
      { action: "join", title: "🎵 Join Lesson" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        if (clients.openWindow) {
          clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Push subscription change
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    Promise.resolve().then(async () => {
      try {
        const subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            "BK4UGpcqHCSzrf-044ltdEXMPI5_bl4aemCQeMasImMRu7QX-0DAAZHKk0g__P7Kiinh5PwsAH7KqsOpsXRyXBY",
          ),
        });

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });
      } catch (err) {
        console.error("Push subscription change failed:", err);
      }
    }),
  );
});

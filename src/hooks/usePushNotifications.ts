// hooks/usePushNotifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const { user, isSignedIn } = useUser();

  const [permission, setPermission] = useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission as PermissionState);

      navigator.serviceWorker.ready
        .then((reg) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (reg as any).pushManager.getSubscription();
        })
        .then((sub) => setIsSubscribed(!!sub))
        .catch((err) => console.error("Error checking subscription:", err));
    } else {
      setIsSupported(false);
      setPermission("unsupported");
    }
  }, []);

  useEffect(() => {
    if (!isSupported || !isSignedIn) return;

    const registerSW = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered");
      } catch (err) {
        console.error("Service Worker registration failed:", err);
        setError("Failed to register service worker");
      }
    };

    registerSW();
  }, [isSupported, isSignedIn]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !isSignedIn || !user) {
      setError("Push not supported or not signed in");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm as PermissionState);

      if (perm !== "granted") {
        setError("Notification permission denied");
        setIsLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) throw new Error("Failed to save subscription");

      setIsSubscribed(true);
      console.log("Successfully subscribed to push notifications");
    } catch (err) {
      console.error("Push subscription failed:", err);
      setError("Failed to subscribe to notifications");
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isSignedIn, user]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported || !isSubscribed) return;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription =
        await // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (registration as any).pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      const res = await fetch("/api/push/subscribe", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove subscription");

      setIsSubscribed(false);
      console.log("Successfully unsubscribed from push");
    } catch (err) {
      console.error("Unsubscribe failed:", err);
      setError("Failed to unsubscribe");
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isSubscribed]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

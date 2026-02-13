// import { NextRequest, NextResponse } from "next/server";
// import webpush from "web-push";

// // Define the exact shape of the payload we expect from Convex
// interface PushPayload {
//   subscription: string; // JSON string of the push subscription
//   title: string;
//   body: string;
//   url?: string;
//   tag?: string;
// }

// // Type for the parsed subscription object (what web-push expects)
// interface PushSubscriptionJSON {
//   endpoint: string;
//   keys: {
//     p256dh: string;
//     auth: string;
//   };
// }

// export async function POST(req: NextRequest) {
//   console.log("════════════════════════════════════════════════════════");
//   console.log("🔔 PUSH SEND ENDPOINT CALLED");
//   console.log(`   Time: ${new Date().toISOString()}`);
//   console.log(`   URL: ${req.url}`);

//   const authHeader = req.headers.get("authorization");
//   const cronSecret = process.env.CRON_SECRET;

//   console.log(`   Auth header: ${authHeader ? "present" : "MISSING"}`);
//   console.log(`   CRON_SECRET: ${cronSecret ? "present" : "MISSING"}`);

//   // Auth check
//   if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
//     console.error("❌ AUTH CHECK FAILED");
//     return NextResponse.json(
//       { error: "Forbidden - Invalid or missing Authorization header" },
//       { status: 403 },
//     );
//   }

//   console.log("✅ Auth check passed");

//   // VAPID setup
//   try {
//     webpush.setVapidDetails(
//       `mailto:${process.env.VAPID_EMAIL}`,
//       process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
//       process.env.VAPID_PRIVATE_KEY!,
//     );
//     console.log("✅ VAPID configured");
//   } catch (vapidErr: unknown) {
//     console.error("❌ VAPID setup failed:", vapidErr);
//     return NextResponse.json({ error: "VAPID config error" }, { status: 500 });
//   }

//   // Parse request body
//   let payload: PushPayload;
//   try {
//     payload = await req.json();
//     console.log("📦 Payload received:");
//     console.log(`   Title: ${payload.title}`);
//     console.log(`   Body: ${payload.body}`);
//     console.log(`   URL: ${payload.url || "none"}`);
//   } catch (err) {
//     console.error("❌ Failed to parse request body:", err);
//     return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
//   }

//   // Parse subscription
//   let subscription: PushSubscriptionJSON;
//   try {
//     subscription = JSON.parse(payload.subscription);
//     console.log(
//       `✅ Subscription parsed (endpoint: ${subscription.endpoint.substring(0, 50)}...)`,
//     );
//   } catch (err) {
//     console.error("❌ Failed to parse subscription:", err);
//     return NextResponse.json(
//       { error: "Invalid subscription format" },
//       { status: 400 },
//     );
//   }

//   // Send the push notification
//   try {
//     const notificationPayload = JSON.stringify({
//       title: payload.title,
//       body: payload.body,
//       url: payload.url || "/dashboard",
//       tag: payload.tag || "lesson-reminder",
//       icon: "/logo.png",
//       badge: "/badge-icon.png",
//     });

//     console.log("📤 Sending push notification...");

//     await webpush.sendNotification(subscription, notificationPayload);

//     console.log("✅ Push notification sent successfully");
//     console.log("════════════════════════════════════════════════════════\n");

//     return NextResponse.json({ success: true });
//   } catch (err: unknown) {
//     console.error("❌ Push send failed:", err);

//     let statusCode = 500;
//     let errorMessage = "Internal server error";

//     if (err instanceof Error) {
//       errorMessage = err.message;

//       // Safe statusCode check
//       if (
//         err &&
//         typeof err === "object" &&
//         "statusCode" in err &&
//         typeof err.statusCode === "number"
//       ) {
//         statusCode = err.statusCode;
//       }
//     }

//     if (statusCode === 410 || statusCode === 404) {
//       console.log("🗑️  Subscription expired/gone (410/404)");
//       return NextResponse.json(
//         { error: "Subscription expired or gone" },
//         { status: 410 },
//       );
//     }

//     console.log("════════════════════════════════════════════════════════\n");
//     return NextResponse.json(
//       { error: "Push send failed", details: errorMessage },
//       { status: statusCode },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// Define the exact shape of the incoming JSON payload
interface PushPayload {
  subscription: string; // JSON string of the PushSubscription
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

// The shape that web-push expects for the subscription object
interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(req: NextRequest) {
  // 1. Auth check
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 2. Configure VAPID (safe non-null assertion since they're required env vars)
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL!}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );

    // 3. Parse incoming body with type assertion
    const body = (await req.json()) as PushPayload;

    const { subscription, title, body: messageBody, url, tag } = body;

    // 4. Parse the stored subscription string into the object web-push needs
    const subObj: PushSubscriptionJSON = JSON.parse(subscription);

    // 5. Send the actual push notification
    await webpush.sendNotification(
      subObj,
      JSON.stringify({
        title,
        body: messageBody,
        url,
        tag,
      }),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    // Better typing: web-push errors often have statusCode
    console.error("Push send error:", err);

    let statusCode = 500;
    let errorMessage = "Internal server error";

    if (err && typeof err === "object") {
      if ("statusCode" in err && typeof err.statusCode === "number") {
        statusCode = err.statusCode;
      }
      if ("message" in err && typeof err.message === "string") {
        errorMessage = err.message;
      }
    }

    // Special handling for gone/expired subscriptions (common with web push)
    if (statusCode === 410 || statusCode === 404) {
      return NextResponse.json(
        { error: "Subscription expired or gone" },
        { status: 410 },
      );
    }

    return NextResponse.json(
      { error: "Push failed", details: errorMessage },
      { status: statusCode },
    );
  }
}

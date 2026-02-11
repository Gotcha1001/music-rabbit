import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// Set VAPID details once (global)
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function POST(req: NextRequest) {
  // Security: only Convex cron can call this
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Rename to avoid conflict with destructured body
    const requestBody = await req.json();

    const {
      subscription, // stringified PushSubscriptionJSON
      title,
      body: messageBody, // ← renamed to avoid conflict
      url,
      tag,
    } = requestBody;

    if (!subscription || !title || !messageBody) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Parse subscription
    const parsedSubscription = JSON.parse(subscription);

    // Prepare payload for the notification
    const payload = JSON.stringify({
      title,
      body: messageBody, // use renamed variable
      url,
      tag: tag || "lesson-reminder",
    });

    const options = {
      TTL: 60, // seconds
    };

    // Send it!
    await webpush.sendNotification(parsedSubscription, payload, options);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push send error:", error);

    // Better typing + error handling
    const statusCode = (error as { statusCode?: number })?.statusCode;

    if (statusCode === 410 || statusCode === 404) {
      return NextResponse.json(
        { error: "Subscription expired or gone" },
        { status: 410 },
      );
    }

    return NextResponse.json(
      { error: "Failed to send push notification" },
      { status: 500 },
    );
  }
}

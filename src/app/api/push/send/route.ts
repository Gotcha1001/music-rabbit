import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

export async function POST(req: NextRequest) {
  // Security: only Convex cron can call this
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Moved inside handler — env vars are only read at request time, not build time
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  try {
    const requestBody = await req.json();

    const { subscription, title, body: messageBody, url, tag } = requestBody;

    if (!subscription || !title || !messageBody) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const parsedSubscription = JSON.parse(subscription);

    const payload = JSON.stringify({
      title,
      body: messageBody,
      url,
      tag: tag || "lesson-reminder",
    });

    await webpush.sendNotification(parsedSubscription, payload, { TTL: 60 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push send error:", error);

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

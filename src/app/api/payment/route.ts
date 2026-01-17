// app/api/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  generateSignature,
  getPayFastUrl,
  getPayFastCredentials,
} from "@/lib/payfastUtils";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("\n" + "=".repeat(80));
  console.log("🚀 PAYMENT API CALLED");
  console.log("📅 Timestamp:", new Date().toISOString());
  console.log("=".repeat(80));

  try {
    const body = await req.json();
    console.log("📦 Received body:", JSON.stringify(body, null, 2));

    const { name, email, amount, packageName, packageId, studentId } = body;

    // ✅ Enhanced Validation
    const missingFields: string[] = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!amount) missingFields.push("amount");
    if (!packageId) missingFields.push("packageId");
    if (!studentId) missingFields.push("studentId");

    if (missingFields.length > 0) {
      console.error("❌ VALIDATION FAILED - Missing fields:", missingFields);
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 }
      );
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ Invalid email format:", email);
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // ✅ Validate amount is a valid number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error("❌ Invalid amount:", amount);
      return NextResponse.json(
        { error: "Invalid amount - must be a positive number" },
        { status: 400 }
      );
    }

    // Get credentials and URL
    const credentials = getPayFastCredentials();
    const payfastUrl = getPayFastUrl();

    console.log("🔐 Credentials loaded:");
    console.log("  - Merchant ID:", credentials.merchantId);
    console.log(
      "  - Merchant Key:",
      credentials.merchantKey ? "✓ Present" : "✗ Missing"
    );
    console.log(
      "  - Passphrase:",
      credentials.passphrase
        ? `✓ Present (${credentials.passphrase.length} chars)`
        : "✗ Missing"
    );
    console.log("  - PayFast URL:", payfastUrl);

    // Generate unique payment ID
    const timestamp = Date.now();
    const paymentId = `${studentId}_${packageId}_${timestamp}`;

    console.log("🆔 Generated payment ID:", paymentId);
    console.log("  - Student ID:", studentId);
    console.log("  - Package ID:", packageId);
    console.log("  - Timestamp:", timestamp);

    // Get base URL with fallback
    const baseUrl = process.env.NEXT_PUBLIC_URL || req.nextUrl.origin;
    console.log("🌐 Base URL:", baseUrl);

    // Split name into first/last
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || name;
    const lastName = nameParts.slice(1).join(" ") || name;

    console.log("👤 Name parsed:");
    console.log("  - First:", firstName);
    console.log("  - Last:", lastName);

    // Build payment data
    const paymentData: Record<string, string | number> = {
      merchant_id: credentials.merchantId,
      merchant_key: credentials.merchantKey,
      return_url: `${baseUrl}/payment-success`,
      cancel_url: `${baseUrl}/payment-cancel`,
      notify_url: `${baseUrl}/api/payment/notify`,
      name_first: firstName,
      name_last: lastName,
      email_address: email,
      amount: parsedAmount.toFixed(2),
      item_name: packageName || "Music Lesson Package",
      item_description: `${packageName || "Music Package"} - Monthly Subscription`,
      m_payment_id: paymentId,
      custom_str1: packageId,
      custom_str2: studentId,
    };

    console.log("📋 Payment data prepared:");
    console.log(JSON.stringify(paymentData, null, 2));

    // Generate signature
    console.log("🔒 Generating signature...");
    const signature = generateSignature(
      paymentData,
      credentials.passphrase || null
    );

    paymentData.signature = signature;
    console.log("✅ Signature generated:", signature);

    // Build query string
    const queryString = Object.entries(paymentData)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&");

    const paymentUrl = `${payfastUrl}?${queryString}`;

    console.log("📍 Final payment URL length:", paymentUrl.length);
    console.log(
      "📍 Payment URL preview:",
      paymentUrl.substring(0, 200) + "..."
    );

    // Log URL breakdown for debugging
    console.log("\n🔍 URL BREAKDOWN:");
    console.log("  - Base:", payfastUrl);
    console.log("  - Query params:", Object.keys(paymentData).length);
    console.log("  - Signature:", signature);

    const elapsed = Date.now() - startTime;
    console.log(`\n✅ Payment URL generated successfully in ${elapsed}ms`);
    console.log("=".repeat(80) + "\n");

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error("\n" + "=".repeat(80));
    console.error("❌ PAYMENT API ERROR");
    console.error("⏱️ Failed after:", elapsed + "ms");
    console.error("📍 Error details:", error);
    console.error("=".repeat(80) + "\n");

    return NextResponse.json(
      {
        error: "Failed to create payment session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

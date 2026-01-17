// import { NextRequest, NextResponse } from "next/server";
// import { validateSignature, getPayFastCredentials } from "@/lib/payfastUtils";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../../../../../convex/_generated/api";
// import { Id } from "../../../../../convex/_generated/dataModel";

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// // GET handler for testing/debugging
// export async function GET(req: NextRequest) {
//   console.log("🔍 GET request to /api/payment/notify - Route is accessible!");
//   console.log("📍 URL:", req.url);
//   console.log("📍 Method:", req.method);

//   return new NextResponse(
//     JSON.stringify({
//       message: "ITN endpoint is accessible",
//       timestamp: new Date().toISOString(),
//       url: req.url,
//     }),
//     {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     }
//   );
// }

// export async function POST(req: NextRequest) {
//   // Log immediately when route is hit
//   console.log("=".repeat(80));
//   console.log("🚀 ITN ENDPOINT HIT - POST /api/payment/notify");
//   console.log("📍 URL:", req.url);
//   console.log("📍 Method:", req.method);
//   console.log("📍 Timestamp:", new Date().toISOString());
//   console.log("=".repeat(80));

//   try {
//     // Log headers for debugging
//     console.log("📋 Request Headers:");
//     req.headers.forEach((value, key) => {
//       console.log(`  ${key}: ${value}`);
//     });

//     const body = await req.formData();
//     const params: Record<string, string> = {};

//     for (const [key, value] of body.entries()) {
//       params[key] = value as string;
//     }

//     console.log(
//       "📨 Received ITN from PayFast - Params count:",
//       Object.keys(params).length
//     );
//     console.log("📨 Full ITN params:", JSON.stringify(params, null, 2));

//     // Additional debugging logs
//     const clientIP =
//       req.headers.get("x-forwarded-for")?.split(",")[0] ||
//       req.headers.get("x-real-ip") ||
//       "unknown";
//     console.log("🌐 Client IP:", clientIP);
//     console.log("🔑 Sorted param keys:", Object.keys(params).sort());

//     // ============================================
//     // STEP 1: VALIDATE SIGNATURE
//     // ============================================
//     const credentials = getPayFastCredentials();
//     console.log(
//       "🔐 Using passphrase:",
//       credentials.passphrase
//         ? "YES (length: " + credentials.passphrase.length + ")"
//         : "NO"
//     );

//     const isValidSignature = validateSignature(
//       params,
//       credentials.passphrase || null
//     );

//     if (!isValidSignature) {
//       console.error("❌ Invalid PayFast signature");
//       // PayFast expects plain text response, not JSON
//       return new NextResponse("INVALID", {
//         status: 400,
//         headers: { "Content-Type": "text/plain" },
//       });
//     }

//     console.log("✅ PayFast signature validated");

//     // ============================================
//     // STEP 2: VERIFY IP ADDRESS
//     // ============================================
//     const validIPs = [
//       "197.97.145.144",
//       "197.97.145.145",
//       "197.97.145.146",
//       "197.97.145.147",
//       "197.97.145.148",
//       // Sandbox IPs
//       "41.74.179.194",
//       "41.74.179.195",
//       "41.74.179.196",
//       "41.74.179.197",
//       "41.74.179.198",
//     ];

//     if (process.env.NODE_ENV === "production" && !validIPs.includes(clientIP)) {
//       console.warn(`⚠️ Suspicious IP: ${clientIP}`);
//       // In production, reject invalid IPs
//       // return NextResponse.json({ status: "INVALID_IP" }, { status: 403 });
//     } else {
//       console.log("✅ IP check passed (or skipped in dev)");
//     }

//     // ============================================
//     // STEP 3: SERVER-TO-SERVER CONFIRMATION
//     // ============================================
//     const payfastHost =
//       process.env.NODE_ENV === "production"
//         ? "www.payfast.co.za"
//         : "sandbox.payfast.co.za";

//     try {
//       const confirmResponse = await fetch(
//         `https://${payfastHost}/eng/query/validate`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/x-www-form-urlencoded" },
//           body: new URLSearchParams(params).toString(),
//         }
//       );

//       const confirmText = await confirmResponse.text();

//       console.log(
//         "🔄 PayFast server confirmation response:",
//         confirmText.trim()
//       );

//       if (confirmText.trim() !== "VALID") {
//         console.error("❌ PayFast server confirmation failed:", confirmText);
//         // PayFast expects plain text response
//         return new NextResponse("INVALID", {
//           status: 400,
//           headers: { "Content-Type": "text/plain" },
//         });
//       }

//       console.log("✅ PayFast server-to-server validation passed");
//     } catch (confirmError) {
//       console.error("❌ Failed to confirm with PayFast:", confirmError);
//       // PayFast expects plain text response
//       return new NextResponse("INVALID", {
//         status: 500,
//         headers: { "Content-Type": "text/plain" },
//       });
//     }

//     // ============================================
//     // STEP 4: EXTRACT PAYMENT DATA
//     // ============================================
//     const { payment_status, amount_gross, m_payment_id, email_address } =
//       params; // Removed unused item_name

//     console.log(
//       `💰 Payment Status: ${payment_status} | Gross Amount: ${amount_gross} | Email: ${email_address} | m_payment_id: ${m_payment_id}`
//     );

//     // Parse m_payment_id
//     const paymentIdParts = m_payment_id.split("_");
//     if (paymentIdParts.length < 3) {
//       console.error("❌ Invalid m_payment_id format:", m_payment_id);
//       // PayFast expects plain text response
//       return new NextResponse("INVALID", {
//         status: 400,
//         headers: { "Content-Type": "text/plain" },
//       });
//     }

//     const [studentId, packageId] = paymentIdParts;

//     console.log(`🧑 Student ID: ${studentId} | 📦 Package ID: ${packageId}`);

//     // ============================================
//     // STEP 5: CHECK FOR DUPLICATE ITN
//     // ============================================
//     try {
//       const existingPackage = await convex.query(
//         api.studentPackages.getByPaymentId,
//         { paymentId: m_payment_id }
//       );

//       if (existingPackage) {
//         console.log("✅ Payment already processed (duplicate ITN)");
//         // PayFast expects plain text "VALID" response
//         return new NextResponse("VALID", {
//           status: 200,
//           headers: { "Content-Type": "text/plain" },
//         });
//       }
//     } catch (error) {
//       console.warn("⚠️ Could not check for duplicates:", error);
//     }

//     // ============================================
//     // STEP 6: VALIDATE PAYMENT STATUS
//     // ============================================
//     if (payment_status !== "COMPLETE") {
//       console.warn(`⚠️ Non-complete payment status: ${payment_status}`);

//       try {
//         await convex.mutation(api.payments.logFailedPayment, {
//           paymentId: m_payment_id,
//           studentId: studentId as Id<"users">,
//           status: payment_status,
//           amount: parseFloat(amount_gross),
//           reason: `Payment status: ${payment_status}`,
//         });
//       } catch (logError) {
//         console.error("Failed to log failed payment:", logError);
//       }

//       // PayFast expects plain text response
//       return new NextResponse("VALID", {
//         status: 200,
//         headers: { "Content-Type": "text/plain" },
//       });
//     }

//     // ============================================
//     // STEP 7: VALIDATE AMOUNT
//     // ============================================
//     const { PACKAGE_DEFINITIONS } = await import("@/lib/packages");
//     const packageDef = PACKAGE_DEFINITIONS.find((p) => p.id === packageId);

//     if (!packageDef) {
//       console.error(`❌ Package ${packageId} not found`);
//       // PayFast expects plain text response
//       return new NextResponse("INVALID", {
//         status: 400,
//         headers: { "Content-Type": "text/plain" },
//       });
//     }

//     const expectedAmount = packageDef.monthlyPrice;
//     const receivedAmount = parseFloat(amount_gross);

//     if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
//       console.error(
//         `❌ Amount mismatch! Expected: ${expectedAmount}, Received: ${receivedAmount}`
//       );

//       await convex.mutation(api.payments.logFailedPayment, {
//         paymentId: m_payment_id,
//         studentId: studentId as Id<"users">,
//         status: "AMOUNT_MISMATCH",
//         amount: receivedAmount,
//         reason: `Expected ${expectedAmount}, got ${receivedAmount}`,
//       });

//       // PayFast expects plain text response
//       return new NextResponse("INVALID", {
//         status: 400,
//         headers: { "Content-Type": "text/plain" },
//       });
//     }

//     console.log("✅ Amount validated:", receivedAmount);

//     // ============================================
//     // STEP 8: CREATE PACKAGE IN CONVEX
//     // ============================================
//     try {
//       const newPackageId = await convex.mutation(
//         api.studentPackages.createPackage,
//         {
//           studentId: studentId as Id<"users">,
//           packageType: packageDef.id,
//           minutesPerLesson: packageDef.minutesPerLesson,
//           lessonsPerWeek: packageDef.lessonsPerWeek,
//           totalMinutesPerMonth: packageDef.totalMinutesPerMonth,
//           monthlyPrice: packageDef.monthlyPrice,
//           paymentId: m_payment_id,
//         }
//       );

//       console.log(`✅ Package created for student ${studentId}:`, newPackageId);

//       // SUCCESS! PayFast expects plain text "VALID" response
//       return new NextResponse("VALID", {
//         status: 200,
//         headers: { "Content-Type": "text/plain" },
//       });
//     } catch (convexError) {
//       console.error("❌ Failed to create package:", convexError);

//       await convex.mutation(api.payments.logFailedPayment, {
//         paymentId: m_payment_id,
//         studentId: studentId as Id<"users">,
//         status: "DB_ERROR",
//         amount: parseFloat(amount_gross),
//         reason:
//           convexError instanceof Error ? convexError.message : "Unknown error",
//       });

//       // PayFast expects plain text response
//       return new NextResponse("INVALID", {
//         status: 500,
//         headers: { "Content-Type": "text/plain" },
//       });
//     }
//   } catch (error) {
//     console.error("=".repeat(80));
//     console.error("❌ ITN Handler Error - Top level catch:");
//     console.error(
//       "Error type:",
//       error instanceof Error ? error.constructor.name : typeof error
//     );
//     console.error(
//       "Error message:",
//       error instanceof Error ? error.message : String(error)
//     );
//     console.error(
//       "Error stack:",
//       error instanceof Error ? error.stack : "No stack trace"
//     );
//     console.error("=".repeat(80));

//     // PayFast expects plain text response
//     return new NextResponse("INVALID", {
//       status: 500,
//       headers: { "Content-Type": "text/plain" },
//     });
//   }
// }

// app/api/payment/notify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateSignature, getPayFastCredentials } from "@/lib/payfastUtils";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  console.log("\n".repeat(3));
  console.log("=".repeat(80));
  console.log("🚀 ITN ENDPOINT HIT");
  console.log("📍 Timestamp:", new Date().toISOString());
  console.log("=".repeat(80));

  try {
    // ✅ Parse form data
    const body = await req.formData();
    const params: Record<string, string> = {};

    for (const [key, value] of body.entries()) {
      params[key] = value as string;
    }

    console.log("📨 Received ITN params count:", Object.keys(params).length);
    console.log("📨 Full ITN params:", JSON.stringify(params, null, 2));

    // Extract client IP
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";
    console.log("🌐 Client IP:", clientIP);

    // ============================================
    // STEP 1: VALIDATE SIGNATURE (FIXED)
    // ============================================
    const credentials = getPayFastCredentials();
    console.log(
      "🔐 Using passphrase:",
      credentials.passphrase
        ? `YES (length: ${credentials.passphrase.length})`
        : "NO"
    );

    // ✅ CRITICAL FIX: validateSignature now handles signature removal internally
    const isValidSignature = validateSignature(params, credentials.passphrase);

    if (!isValidSignature) {
      console.error("❌ Invalid PayFast signature");
      return NextResponse.json(
        { status: "INVALID_SIGNATURE" },
        { status: 400 }
      );
    }

    console.log("✅ PayFast signature validated");

    // ============================================
    // STEP 2: VERIFY IP ADDRESS
    // ============================================
    const validIPs = [
      "197.97.145.144",
      "197.97.145.145",
      "197.97.145.146",
      "197.97.145.147",
      "197.97.145.148",
      // Sandbox IPs
      "41.74.179.194",
      "41.74.179.195",
      "41.74.179.196",
      "41.74.179.197",
      "41.74.179.198",
    ];

    if (process.env.NODE_ENV === "production" && !validIPs.includes(clientIP)) {
      console.warn(`⚠️ Suspicious IP: ${clientIP}`);
      // In production, uncomment to reject:
      // return NextResponse.json({ status: "INVALID_IP" }, { status: 403 });
    } else {
      console.log("✅ IP check passed (or skipped in dev)");
    }

    // ============================================
    // STEP 3: SERVER-TO-SERVER CONFIRMATION
    // ============================================
    const payfastHost =
      process.env.NODE_ENV === "production"
        ? "www.payfast.co.za"
        : "sandbox.payfast.co.za";

    try {
      const confirmResponse = await fetch(
        `https://${payfastHost}/eng/query/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(params).toString(),
        }
      );

      const confirmText = await confirmResponse.text();
      console.log("🔄 PayFast server confirmation:", confirmText.trim());

      if (confirmText.trim() !== "VALID") {
        console.error("❌ PayFast server confirmation failed:", confirmText);
        return NextResponse.json(
          { status: "INVALID_CONFIRMATION" },
          { status: 400 }
        );
      }

      console.log("✅ PayFast server-to-server validation passed");
    } catch (confirmError) {
      console.error("❌ Failed to confirm with PayFast:", confirmError);
      return NextResponse.json(
        { status: "CONFIRMATION_ERROR" },
        { status: 500 }
      );
    }

    // ============================================
    // STEP 4: EXTRACT PAYMENT DATA
    // ============================================
    const { payment_status, amount_gross, m_payment_id, email_address } =
      params;

    console.log(
      `💰 Payment Status: ${payment_status} | Amount: ${amount_gross} | Email: ${email_address}`
    );

    // Parse m_payment_id (format: studentId_packageId_timestamp)
    const paymentIdParts = m_payment_id.split("_");
    if (paymentIdParts.length < 3) {
      console.error("❌ Invalid m_payment_id format:", m_payment_id);
      return NextResponse.json(
        { status: "INVALID_PAYMENT_ID" },
        { status: 400 }
      );
    }

    const [studentId, packageId] = paymentIdParts;
    console.log(`🧑 Student ID: ${studentId} | 📦 Package ID: ${packageId}`);

    // ============================================
    // STEP 5: CHECK FOR DUPLICATE ITN
    // ============================================
    try {
      const existingPackage = await convex.query(
        api.studentPackages.getByPaymentId,
        { paymentId: m_payment_id }
      );

      if (existingPackage) {
        console.log("✅ Payment already processed (duplicate ITN)");
        return NextResponse.json({ status: "OK" }, { status: 200 });
      }
    } catch (error) {
      console.warn("⚠️ Could not check for duplicates:", error);
    }

    // ============================================
    // STEP 6: VALIDATE PAYMENT STATUS
    // ============================================
    if (payment_status !== "COMPLETE") {
      console.warn(`⚠️ Non-complete payment status: ${payment_status}`);

      try {
        await convex.mutation(api.payments.logFailedPayment, {
          paymentId: m_payment_id,
          studentId: studentId as Id<"users">,
          status: payment_status,
          amount: parseFloat(amount_gross),
          reason: `Payment status: ${payment_status}`,
        });
      } catch (logError) {
        console.error("Failed to log failed payment:", logError);
      }

      return NextResponse.json({ status: "OK" }, { status: 200 });
    }

    // ============================================
    // STEP 7: VALIDATE AMOUNT
    // ============================================
    const { PACKAGE_DEFINITIONS } = await import("@/lib/packages");
    const packageDef = PACKAGE_DEFINITIONS.find((p) => p.id === packageId);

    if (!packageDef) {
      console.error(`❌ Package ${packageId} not found`);
      return NextResponse.json({ status: "INVALID_PACKAGE" }, { status: 400 });
    }

    const expectedAmount = packageDef.monthlyPrice;
    const receivedAmount = parseFloat(amount_gross);

    if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
      console.error(
        `❌ Amount mismatch! Expected: ${expectedAmount}, Received: ${receivedAmount}`
      );

      await convex.mutation(api.payments.logFailedPayment, {
        paymentId: m_payment_id,
        studentId: studentId as Id<"users">,
        status: "AMOUNT_MISMATCH",
        amount: receivedAmount,
        reason: `Expected ${expectedAmount}, got ${receivedAmount}`,
      });

      return NextResponse.json({ status: "AMOUNT_MISMATCH" }, { status: 400 });
    }

    console.log("✅ Amount validated:", receivedAmount);

    // ============================================
    // STEP 8: CREATE PACKAGE IN CONVEX
    // ============================================
    try {
      const newPackageId = await convex.mutation(
        api.studentPackages.createPackage,
        {
          studentId: studentId as Id<"users">,
          packageType: packageDef.id,
          minutesPerLesson: packageDef.minutesPerLesson,
          lessonsPerWeek: packageDef.lessonsPerWeek,
          totalMinutesPerMonth: packageDef.totalMinutesPerMonth,
          monthlyPrice: packageDef.monthlyPrice,
          paymentId: m_payment_id,
        }
      );

      console.log(`✅ Package created for student ${studentId}:`, newPackageId);
      console.log("=".repeat(80));
      console.log("🎉 ITN PROCESSING COMPLETE - SUCCESS");
      console.log("=".repeat(80));

      return NextResponse.json({ status: "OK" }, { status: 200 });
    } catch (convexError) {
      console.error("❌ Failed to create package:", convexError);

      await convex.mutation(api.payments.logFailedPayment, {
        paymentId: m_payment_id,
        studentId: studentId as Id<"users">,
        status: "DB_ERROR",
        amount: parseFloat(amount_gross),
        reason:
          convexError instanceof Error ? convexError.message : "Unknown error",
      });

      return NextResponse.json({ status: "DB_ERROR" }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ ITN Handler Error:", error);
    return NextResponse.json({ status: "ERROR" }, { status: 500 });
  }
}

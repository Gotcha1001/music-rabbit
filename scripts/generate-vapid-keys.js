#!/usr/bin/env node
// scripts/generate-vapid-keys.js
// Run once: node scripts/generate-vapid-keys.js
// Then copy the output into your .env.local file

const webpush = require("web-push");

console.log("\n" + "=".repeat(50));
console.log("Generating VAPID keys for Music Rabbit Web Push...");
console.log("=".repeat(50) + "\n");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("✅ VAPID Keys Generated!\n");

console.log(
  "Add the following lines to your .env.local (and Vercel env vars):",
);
console.log("\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=" + vapidKeys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + vapidKeys.privateKey);
console.log(
  "VAPID_EMAIL=your-email@example.com   # e.g. wesleyolivier443@gmail.com",
);
console.log(
  "CRON_SECRET=" +
    require("crypto").randomBytes(32).toString("base64") +
    "   # random secret for cron protection",
);
console.log(
  "\nNEXT_PUBLIC_APP_URL=http://localhost:3000   # change to production URL later",
);
console.log("\n" + "=".repeat(50));

console.log("\n⚠️  IMPORTANT SECURITY NOTES:");
console.log("• NEVER commit VAPID_PRIVATE_KEY or CRON_SECRET to git");
console.log("• Keep them secret – anyone with the private key can send pushes");
console.log(
  "• NEXT_PUBLIC_VAPID_PUBLIC_KEY is safe to expose (used in browser)",
);
console.log(
  "• Regenerate keys only if you suspect a leak – existing subscriptions will break",
);

console.log("\nDone! Copy the values above and restart your app.");

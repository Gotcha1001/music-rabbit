// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// // Public routes that don't require authentication
// const isPublicRoute = createRouteMatcher([
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/",
//   "/api/payment/notify(.*)",
//   "/api/push/send", // ← this is now public / excluded from protect()
//   "/api/push/subscribe",
// ]);

// export default clerkMiddleware(async (auth, req) => {
//   // Log here — req is now defined
//   console.log("[MIDDLEWARE] Request path:", req.nextUrl.pathname);
//   console.log("[MIDDLEWARE] Auth header:", req.headers.get("authorization"));

//   // Skip protection for push endpoint (and other public routes)
//   if (!isPublicRoute(req)) {
//     await auth.protect();
//   }
// });

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/api/payment/notify(.*)",
  "/api/push/send",
  "/api/push/subscribe",
]);

export default clerkMiddleware((auth, req) => {
  // Don't protect public routes
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

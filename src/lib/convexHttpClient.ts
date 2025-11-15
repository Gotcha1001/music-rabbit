import { ConvexHttpClient } from "convex/browser";

export const convexHttpClient = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

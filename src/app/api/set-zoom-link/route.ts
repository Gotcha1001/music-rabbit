import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { convexHttpClient } from "../../../lib/convexHttpClient"; // see step 4
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { zoomLink } = await req.json();

  const user = await convexHttpClient.query(api.users.get);
  if (user?.role !== "teacher")
    return new Response("Forbidden", { status: 403 });

  await convexHttpClient.mutation(api.users.setZoomLink, { zoomLink });
  return new Response("OK");
}

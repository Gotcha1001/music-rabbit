// // app/api/books/delete/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { deleteFromDrive } from "@/lib/googleDrive";
// import { convexHttpClient } from "@/lib/convexHttpClient";
// import { api } from "../../../../../convex/_generated/api";

// export async function POST(req: NextRequest) {
//   const { userId } = await auth();
//   if (!userId)
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const user = await convexHttpClient.query(api.users.get);
//   if (user?.role !== "admin")
//     return NextResponse.json({ error: "Admin only" }, { status: 403 });

//   const { bookId, driveFileId } = await req.json();

//   try {
//     // Delete from Google Drive
//     await deleteFromDrive(driveFileId);
//     // Delete metadata from Convex
//     await convexHttpClient.setAuth(
//       await auth().getToken({ template: "convex" })
//     );
//     await convexHttpClient.mutation(api.books.remove, { bookId });
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
//   }
// }

// app/api/books/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { deleteFromDrive } from "@/lib/googleDrive";
import { convexHttpClient } from "@/lib/convexHttpClient";
import { api } from "../../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  // 1. Get Clerk auth (this version of Clerk makes auth() async in route handlers)
  const authResult = await auth();

  const { userId } = authResult;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get Convex token and authenticate the client
  const token = await authResult.getToken({ template: "convex" });
  if (!token) {
    return NextResponse.json({ error: "No Convex token" }, { status: 401 });
  }
  convexHttpClient.setAuth(token);

  // 3. Now we can safely query the current user (role check)
  const user = await convexHttpClient.query(api.users.get);
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  // 4. Parse request body
  const { bookId, driveFileId } = await req.json();

  if (!bookId || !driveFileId) {
    return NextResponse.json(
      { error: "Missing bookId or driveFileId" },
      { status: 400 }
    );
  }

  try {
    // Delete file from Google Drive (service-account, no token needed)
    await deleteFromDrive(driveFileId);

    // Delete metadata from Convex (token already set)
    await convexHttpClient.mutation(api.books.remove, { bookId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete book error:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}

// // app/api/upload-book/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { uploadToDrive } from "@/lib/googleDrive";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../../../../convex/_generated/api";

// const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// export async function POST(req: NextRequest) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const formData = await req.formData();
//     const file = formData.get("file") as File;
//     const title = formData.get("title") as string;
//     const level = formData.get("level") as string;
//     const instrument = formData.get("instrument") as string;

//     if (!file || !title || !level || !instrument) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Upload to Google Drive
//     console.log("Uploading to Google Drive:", title);
//     const driveResponse = await uploadToDrive(file);

//     // Store metadata in Convex
//     console.log("Saving metadata to Convex");
//     await convexClient.mutation(api.books.upload, {
//       title,
//       level,
//       instrument,
//       driveFileId: driveResponse.fileId,
//       driveViewLink: driveResponse.webViewLink,
//       driveDownloadLink: driveResponse.webContentLink,
//     });

//     return NextResponse.json({
//       success: true,
//       fileId: driveResponse.fileId,
//       viewLink: driveResponse.webViewLink,
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "Upload failed" },
//       { status: 500 }
//     );
//   }
// }
// app/api/upload-book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadToDrive } from "@/lib/googleDrive";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth(); // Await the promise
    const { userId } = authResult; // Now safe to destructure

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Convex token from Clerk
    const token = await authResult.getToken({ template: "convex" }); // Use authResult (awaited)
    if (!token) {
      return NextResponse.json({ error: "No Convex token" }, { status: 401 });
    }
    convexClient.setAuth(token);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const level = formData.get("level") as string;
    const instrument = formData.get("instrument") as string;

    if (!file || !title || !level || !instrument) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upload to Google Drive
    console.log("Uploading to Google Drive:", title);
    const driveResponse = await uploadToDrive(file);

    // Store metadata in Convex
    console.log("Saving metadata to Convex");
    await convexClient.mutation(api.books.upload, {
      title,
      level,
      instrument,
      driveFileId: driveResponse.fileId,
      driveViewLink: driveResponse.webViewLink,
      driveDownloadLink: driveResponse.webContentLink,
    });

    return NextResponse.json({
      success: true,
      fileId: driveResponse.fileId,
      viewLink: driveResponse.webViewLink,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

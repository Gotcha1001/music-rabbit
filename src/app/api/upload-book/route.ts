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
// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { uploadToDrive } from "@/lib/googleDrive";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../../../../convex/_generated/api";

// const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// export async function POST(req: NextRequest) {
//   try {
//     const authResult = await auth(); // Await the promise
//     const { userId } = authResult; // Now safe to destructure

//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Get Convex token from Clerk
//     const token = await authResult.getToken({ template: "convex" }); // Use authResult (awaited)
//     if (!token) {
//       return NextResponse.json({ error: "No Convex token" }, { status: 401 });
//     }
//     convexClient.setAuth(token);

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
import { Id } from "../../../../convex/_generated/dataModel";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const { userId } = authResult;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await authResult.getToken({ template: "convex" });
    if (!token) {
      return NextResponse.json({ error: "No Convex token" }, { status: 401 });
    }
    convexClient.setAuth(token);

    const formData = await req.formData();

    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const instrument = formData.get("instrument") as string;
    const categoryId = formData.get("categoryId") as string;
    const levelNumberStr = formData.get("levelNumber") as string | null;

    const subcategory = formData.get("subcategory") as string | null;
    const description = formData.get("description") as string | null;
    const tagsString = formData.get("tags") as string | null;

    // Validation
    if (!file || !title || !instrument || !categoryId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: file, title, instrument, or categoryId",
        },
        { status: 400 }
      );
    }

    // Upload to Google Drive
    console.log("Uploading to Google Drive:", title);
    const driveResponse = await uploadToDrive(file);

    // Parse level number
    const levelNumber = levelNumberStr
      ? parseInt(levelNumberStr, 10)
      : undefined;
    if (levelNumberStr && (isNaN(levelNumber!) || levelNumber! < 1)) {
      return NextResponse.json(
        { error: "Invalid level number" },
        { status: 400 }
      );
    }

    // Parse tags safely
    let tags: string[] | undefined;
    if (tagsString) {
      try {
        tags = JSON.parse(tagsString);
        if (!Array.isArray(tags)) tags = undefined;
      } catch {
        console.warn("Invalid tags JSON provided, ignoring tags");
        tags = undefined;
      }
    }

    // Save to Convex
    await convexClient.mutation(api.books.upload, {
      title,
      instrument,
      categoryId: categoryId as Id<"bookCategories">,
      levelNumber,
      subcategory: subcategory || undefined,
      description: description || undefined,
      tags,
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

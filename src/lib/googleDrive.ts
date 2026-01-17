// src/lib/googleDrive.ts (updated with stream fix)
import { google, drive_v3 } from "googleapis";
import { Readable } from "stream"; // Add this import for Readable stream

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

export async function uploadToDrive(
  file: File,
  folderId?: string
): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> {
  const buffer = await file.arrayBuffer();
  const media = {
    mimeType: file.type,
    body: Readable.from(Buffer.from(buffer)), // Convert to Readable stream
  };

  const fileMetadata: drive_v3.Schema$File = {
    name: file.name,
    mimeType: file.type,
  };

  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id, webViewLink, webContentLink",
  });

  // Make file publicly accessible
  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    fileId: response.data.id!,
    webViewLink: response.data.webViewLink!,
    webContentLink: response.data.webContentLink!,
  };
}

export async function deleteFromDrive(fileId: string): Promise<void> {
  await drive.files.delete({
    fileId: fileId,
  });
}

export async function getFileUrl(fileId: string): Promise<string> {
  const response = await drive.files.get({
    fileId: fileId,
    fields: "webViewLink",
  });
  return response.data.webViewLink!;
}

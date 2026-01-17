import { google } from "googleapis";
import { NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
const SCOPES = ["https://www.googleapis.com/auth/drive"];

// Generate auth URL
export async function GET() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Ensures refresh_token is issued
  });
  return NextResponse.redirect(authUrl);
}

import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Handle the callback (Google redirects here with ?code=...)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Full Tokens:", tokens); // Log to your terminal for copying
    oauth2Client.setCredentials(tokens);

    // IMPORTANT: Copy the 'refresh_token' from the console log and paste it into .env as GOOGLE_REFRESH_TOKEN
    // In production, store securely (e.g., in Convex DB or a vault)

    // Redirect to a success page or dashboard after success
    return NextResponse.redirect(new URL("/", req.url)); // Or wherever you want to go after auth
  } catch (error) {
    console.error("Error getting tokens:", error);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

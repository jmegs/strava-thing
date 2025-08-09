import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const code = req.nextUrl.searchParams.get("code");

	if (!code) {
		return NextResponse.json({ error: "Missing code" }, { status: 400 });
	}

	const response = await fetch("https://www.strava.com/oauth/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
			client_secret: process.env.STRAVA_CLIENT_SECRET!,
			code,
			grant_type: "authorization_code",
		}),
		cache: "no-store",
	});

	const data = await response.json();
	const cookieStore = await cookies();

	// Store refresh token in a secure cookie
	cookieStore.set("strava_refresh_token", data.refresh_token, {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 365, // 1 year
	});

	// Redirect into app
	return NextResponse.redirect(new URL("/", req.url));
}

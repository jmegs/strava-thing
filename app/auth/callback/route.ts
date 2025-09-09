import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const {
		nextUrl: { searchParams },
	} = request;

	const code = searchParams.get("code");

	if (!code) {
		return new Response("Missing code", { status: 400 });
	}

	const res = await fetch("https://www.strava.com/oauth/token", {
		method: "POST",
		body: new URLSearchParams({
			client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
			client_secret: process.env.STRAVA_CLIENT_SECRET!,
			code: code,
			grant_type: "authorization_code",
		}),
	});

	const data = await res.json();
	request.cookies.set("strava_refresh_token", data.refresh_token);

	return redirect("/");
}

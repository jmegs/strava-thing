import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const { url: origin } = request;
	console.log("Origin:", origin);
	const clientID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!;
	const redirectURI = new URL("/auth/callback", origin).href;
	console.log("Redirect URI:", redirectURI);
	const authURL =
		`https://www.strava.com/oauth/authorize?client_id=${clientID}` +
		`&response_type=code&redirect_uri=${encodeURIComponent(redirectURI)}` +
		`&scope=read,activity:read_all&approval_prompt=force`;

	return Response.redirect(authURL);
}

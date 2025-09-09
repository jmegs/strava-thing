"use server";

import { cookies } from "next/headers";
import { Strava, type AccessToken } from "strava";

let cached: AccessToken | undefined;
let client: Strava | null = null;

export async function requireStravaClient() {
	const cookieStore = await cookies();
	const refresh = cookieStore.get("strava_refresh_token");

	if (!refresh) {
		throw new Error("No Strava refresh token found");
	}

	if (client) return client;

	client = new Strava(
		{
			client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
			client_secret: process.env.STRAVA_CLIENT_SECRET!,
			on_token_refresh(token) {
				cached = token;
				if (token.refresh_token && token.refresh_token !== refresh.value) {
					cookieStore.set("strava_refresh_token", token.refresh_token);
				}
			},
		},
		cached ?? { refresh_token: refresh.value, access_token: "", expires_at: 0 },
	);

	return client;
}

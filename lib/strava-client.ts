"use server";
import { cache } from "react";
import { cookies } from "next/headers";
import { Strava, type AccessToken } from "strava";
import { redirect } from "next/navigation";

// in-memory cache for the access token
let cachedToken: AccessToken | undefined;

export const getStravaClient = cache(async () => {
	const cookieStore = await cookies();
	const refreshToken = cookieStore.get("strava_refresh_token")?.value;

	if (!refreshToken) return null;

	const strava = new Strava(
		{
			client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!,
			client_secret: process.env.STRAVA_CLIENT_SECRET!,
			on_token_refresh: (newToken) => {
				if (newToken.refresh_token && newToken.refresh_token !== refreshToken) {
					cookieStore.set("strava_refresh_token", newToken.refresh_token, {
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
						sameSite: "lax",
						maxAge: 60 * 60 * 24 * 365,
					});
				}
			},
		},
		cachedToken ?? {
			refresh_token: refreshToken,
			access_token: "",
			expires_at: 0,
		}
	);
	return strava;
});

export async function requireStravaClient() {
	const strava = await getStravaClient();
	if (!strava) redirect("/login");
	return strava;
}

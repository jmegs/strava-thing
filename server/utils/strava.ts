import { Strava, type AccessToken } from "strava";
import type { H3Event } from "h3";

const cfg = useRuntimeConfig();

let cached: AccessToken | undefined;
let client: Strava | null = null;

export async function requireStravaClient(event: H3Event) {
	const refresh = getCookie(event, "strava_refresh_token");
	if (!refresh) {
		throw createError({
			statusCode: 401,
			statusMessage: "Strava not connected",
		});
	}

	if (client) return client;

	client = new Strava(
		{
			client_id: cfg.public.stravaClientId,
			client_secret: cfg.stravaClientSecret,
			on_token_refresh(token) {
				cached = token;
				if (token.refresh_token && token.refresh_token !== refresh) {
					setCookie(event, "strava_refresh_token", token.refresh_token, {
						maxAge: 60 * 60 * 24 * 365,
						sameSite: "lax",
						secure: process.env.NODE_ENV === "production",
					});
				}
			},
		},
		cached ?? { refresh_token: refresh, access_token: "", expires_at: 0 },
	);

	return client;
}

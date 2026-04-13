import { env } from "cloudflare:workers"
import { Strava } from "strava"
import type { AstroSession } from "astro"
import type { SessionData } from "../shared/types"
import { THIRTY_DAYS, MCP_TOKENS_KEY } from "./session"

function makeClient(
	auth: SessionData,
	onTokenRefresh: (token: {
		access_token: string
		expires_at: number
		refresh_token?: string
	}) => void | Promise<void>,
) {
	return new Strava(
		{
			client_id: env.STRAVA_CLIENT_ID,
			client_secret: env.STRAVA_CLIENT_SECRET,
			on_token_refresh: onTokenRefresh,
		},
		{
			access_token: auth.accessToken,
			refresh_token: auth.refreshToken,
			expires_at: auth.expiresAt,
		},
	)
}

export function createStravaClient(auth: SessionData, session: AstroSession) {
	return makeClient(auth, (token) => {
		session.set("auth", {
			athleteId: auth.athleteId,
			accessToken: token.access_token,
			expiresAt: token.expires_at,
			refreshToken: token.refresh_token || auth.refreshToken,
		})
	})
}

export function createMcpStravaClient(auth: SessionData) {
	return makeClient(auth, async (token) => {
		await env.SESSIONS.put(
			MCP_TOKENS_KEY,
			JSON.stringify({
				athleteId: auth.athleteId,
				accessToken: token.access_token,
				expiresAt: token.expires_at,
				refreshToken: token.refresh_token || auth.refreshToken,
			}),
			{ expirationTtl: THIRTY_DAYS },
		)
	})
}

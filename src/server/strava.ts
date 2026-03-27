import { env } from "cloudflare:workers"
import { Strava } from "strava"
import type { SessionData } from "@/shared/types"
import { sessions, THIRTY_DAYS, MCP_TOKENS_KEY } from "./session"
import { requestInfo } from "rwsdk/worker"

function makeClient(
	session: SessionData,
	onTokenRefresh: (token: {
		access_token: string
		expires_at: number
		refresh_token?: string
	}) => Promise<void>,
) {
	return new Strava(
		{
			client_id: env.STRAVA_CLIENT_ID,
			client_secret: env.STRAVA_CLIENT_SECRET,
			on_token_refresh: onTokenRefresh,
		},
		{
			access_token: session.accessToken,
			refresh_token: session.refreshToken,
			expires_at: session.expiresAt,
		},
	)
}

export function createStravaClient(session: SessionData) {
	return makeClient(session, async (token) => {
		const { response } = requestInfo
		await sessions.save(response.headers, {
			athleteId: session.athleteId,
			accessToken: token.access_token,
			expiresAt: token.expires_at,
			refreshToken: token.refresh_token || session.refreshToken,
		})
	})
}

export function createMcpStravaClient(session: SessionData) {
	return makeClient(session, async (token) => {
		await env.SESSIONS.put(
			MCP_TOKENS_KEY,
			JSON.stringify({
				athleteId: session.athleteId,
				accessToken: token.access_token,
				expiresAt: token.expires_at,
				refreshToken: token.refresh_token || session.refreshToken,
			}),
			{ expirationTtl: THIRTY_DAYS },
		)
	})
}

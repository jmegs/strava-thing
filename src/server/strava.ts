import { env } from "cloudflare:workers"
import { Strava } from "strava"
import type { SessionData } from "@/shared/types"
import { sessions } from "./session"
import { requestInfo } from "rwsdk/worker"

export function createStravaClient(session: SessionData) {
	const { accessToken, refreshToken, expiresAt } = session

	return new Strava(
		{
			client_id: env.STRAVA_CLIENT_ID,
			client_secret: env.STRAVA_CLIENT_SECRET,
			on_token_refresh: async (token) => {
				console.log("Refreshing Strava tokens...")
				const { response } = requestInfo
				await sessions.save(response.headers, {
					athleteId: session.athleteId,
					accessToken: token.access_token,
					expiresAt: token.expires_at,
					refreshToken: token.refresh_token || refreshToken,
				})
			},
		},
		{
			access_token: accessToken,
			refresh_token: refreshToken,
			expires_at: expiresAt,
		},
	)
}

import { Strava } from "strava"
import { getEnv } from "@/lib/cf"
import { loadStravaTokens, saveStravaTokens } from "@/lib/auth/strava-tokens"

export async function createStravaClientForAthlete(athleteId: number) {
	const auth = await loadStravaTokens(athleteId)
	if (!auth) {
		throw new Error(`No Strava tokens found for athlete ${athleteId}`)
	}

	const env = await getEnv()

	return new Strava(
		{
			client_id: env.STRAVA_CLIENT_ID,
			client_secret: env.STRAVA_CLIENT_SECRET,
			on_token_refresh: async (token: {
				access_token: string
				expires_at: number
				refresh_token?: string
			}) => {
				await saveStravaTokens(athleteId, {
					athleteId,
					accessToken: token.access_token,
					expiresAt: token.expires_at,
					refreshToken: token.refresh_token || auth.refreshToken,
				})
			},
		},
		{
			access_token: auth.accessToken,
			refresh_token: auth.refreshToken,
			expires_at: auth.expiresAt,
		},
	)
}

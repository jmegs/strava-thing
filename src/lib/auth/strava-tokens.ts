import { env } from "cloudflare:workers"

export interface StoredStravaAuth {
	athleteId: number
	accessToken: string
	refreshToken: string
	expiresAt: number
}

function keyForAthlete(athleteId: number) {
	return `strava:user:${athleteId}`
}

export async function saveStravaTokens(
	athleteId: number,
	auth: StoredStravaAuth,
) {
	await env.SESSIONS.put(keyForAthlete(athleteId), JSON.stringify(auth))
}

export async function loadStravaTokens(athleteId: number) {
	return env.SESSIONS.get<StoredStravaAuth>(keyForAthlete(athleteId), "json")
}

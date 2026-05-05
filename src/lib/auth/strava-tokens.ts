import { getEnv } from "@/lib/cf"

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
	const env = await getEnv()
	await env.SESSIONS.put(keyForAthlete(athleteId), JSON.stringify(auth))
}

export async function loadStravaTokens(athleteId: number) {
	const env = await getEnv()
	return env.SESSIONS.get<StoredStravaAuth>(keyForAthlete(athleteId), "json")
}

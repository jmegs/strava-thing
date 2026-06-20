import "server-only"

import { z } from "zod"

const envSchema = z.object({
	STRAVA_CLIENT_ID: z.string().min(1),
	STRAVA_CLIENT_SECRET: z.string().min(1),
	AUTH_SECRET_KEY: z.string().min(32),
})

export function getServerEnv() {
	return envSchema.parse(process.env)
}

export function getStravaConfig() {
	const env = getServerEnv()
	return {
		clientId: env.STRAVA_CLIENT_ID,
		clientSecret: env.STRAVA_CLIENT_SECRET,
	}
}

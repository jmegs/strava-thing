import "server-only"

import { Strava } from "strava"
import { z } from "zod"

import { getStravaConfig } from "@/server/env"
import type { SessionData } from "@/shared/types"

const tokenSchema = z.object({
	athlete: z.object({ id: z.number() }).optional(),
	access_token: z.string().min(1),
	expires_at: z.number(),
	refresh_token: z.string().min(1),
})

export function createStravaClient(session: SessionData) {
	const { clientId, clientSecret } = getStravaConfig()
	return new Strava(
		{
			client_id: clientId,
			client_secret: clientSecret,
		},
		{
			access_token: session.accessToken,
			expires_at: session.expiresAt,
			refresh_token: session.refreshToken,
		},
	)
}

export async function exchangeAuthorizationCode(
	code: string,
): Promise<SessionData> {
	const token = await requestTokens({
		code,
		grant_type: "authorization_code",
	})
	if (!token.athlete) {
		throw new Error("Strava did not return an athlete")
	}

	return {
		athleteId: token.athlete.id,
		accessToken: token.access_token,
		expiresAt: token.expires_at,
		refreshToken: token.refresh_token,
	}
}

export async function refreshStravaSession(
	session: SessionData,
): Promise<SessionData> {
	const token = await requestTokens({
		refresh_token: session.refreshToken,
		grant_type: "refresh_token",
	})

	return {
		athleteId: session.athleteId,
		accessToken: token.access_token,
		expiresAt: token.expires_at,
		refreshToken: token.refresh_token,
	}
}

async function requestTokens(
	params:
		| { code: string; grant_type: "authorization_code" }
		| { refresh_token: string; grant_type: "refresh_token" },
) {
	const { clientId, clientSecret } = getStravaConfig()
	const response = await fetch("https://www.strava.com/oauth/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			...params,
		}),
		cache: "no-store",
	})

	if (!response.ok) {
		throw new Error(`Strava token request failed: ${response.status}`)
	}

	return tokenSchema.parse(await response.json())
}

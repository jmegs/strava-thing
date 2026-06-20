import { randomBytes } from "node:crypto"

import { NextResponse } from "next/server"
import { connection } from "next/server"

import { getStravaConfig } from "@/server/env"
import { getSession } from "@/server/session"

export async function GET(request: Request) {
	await connection()

	const { clientId } = getStravaConfig()
	const state = randomBytes(32).toString("base64url")
	const session = await getSession()
	session.oauthState = state
	await session.save()

	const origin = new URL(request.url).origin
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: `${origin}/auth/strava/callback`,
		response_type: "code",
		approval_prompt: "auto",
		scope: "read,activity:read_all",
		state,
	})

	return NextResponse.redirect(
		`https://www.strava.com/oauth/authorize?${params}`,
	)
}

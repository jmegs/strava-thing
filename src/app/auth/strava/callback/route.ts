import { timingSafeEqual } from "node:crypto"

import { type NextRequest, NextResponse } from "next/server"

import { exchangeAuthorizationCode } from "@/server/strava"
import { getSession } from "@/server/session"

export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get("code")
	const state = request.nextUrl.searchParams.get("state")
	const session = await getSession()
	const storedState = session.oauthState

	if (!code || !state || !storedState || !statesMatch(state, storedState)) {
		session.destroy()
		return NextResponse.redirect(new URL("/login", request.url))
	}

	try {
		const tokens = await exchangeAuthorizationCode(code)
		Object.assign(session, tokens)
		delete session.oauthState
		await session.save()
		return NextResponse.redirect(new URL("/", request.url))
	} catch (error) {
		console.error("Strava OAuth error:", error)
		session.destroy()
		return NextResponse.redirect(new URL("/login?error=oauth", request.url))
	}
}

function statesMatch(actual: string, expected: string) {
	const actualBuffer = Buffer.from(actual)
	const expectedBuffer = Buffer.from(expected)
	return (
		actualBuffer.length === expectedBuffer.length &&
		timingSafeEqual(actualBuffer, expectedBuffer)
	)
}

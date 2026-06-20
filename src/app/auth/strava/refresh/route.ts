import { type NextRequest, NextResponse } from "next/server"

import { readSession, writeSession } from "@/server/session"
import { refreshStravaSession } from "@/server/strava"

export async function GET(request: NextRequest) {
	const session = await readSession()
	if (!session) {
		return NextResponse.redirect(new URL("/login", request.url))
	}

	try {
		const refreshed = await refreshStravaSession(session)
		const destination = safeDestination(
			request.nextUrl.searchParams.get("next"),
		)
		await writeSession(refreshed)
		return NextResponse.redirect(new URL(destination, request.url))
	} catch (error) {
		console.error("Strava token refresh failed:", error)
		return NextResponse.redirect(new URL("/login", request.url))
	}
}

function safeDestination(destination: string | null) {
	return destination?.startsWith("/") && !destination.startsWith("//")
		? destination
		: "/"
}

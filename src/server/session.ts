import "server-only"

import { getIronSession, type IronSession, type SessionOptions } from "iron-session"
import { cookies } from "next/headers"
import { z } from "zod"

import { getServerEnv } from "@/server/env"
import type { SessionData } from "@/shared/types"

const THIRTY_DAYS = 30 * 24 * 60 * 60
const TOKEN_REFRESH_BUFFER_SECONDS = 5 * 60

interface AppSession {
	athleteId?: number
	accessToken?: string
	expiresAt?: number
	refreshToken?: string
	oauthState?: string
}

const sessionSchema = z.object({
	athleteId: z.number(),
	accessToken: z.string().min(1),
	expiresAt: z.number(),
	refreshToken: z.string().min(1),
})

function sessionOptions(): SessionOptions {
	return {
		password: getServerEnv().AUTH_SECRET_KEY,
		cookieName: "strava_session",
		ttl: THIRTY_DAYS,
		cookieOptions: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
		},
	}
}

export async function getSession(): Promise<IronSession<AppSession>> {
	return getIronSession<AppSession>(await cookies(), sessionOptions())
}

export async function readSession(): Promise<SessionData | null> {
	const session = await getSession()
	const parsed = sessionSchema.safeParse(session)
	return parsed.success ? parsed.data : null
}

export async function writeSession(data: SessionData) {
	const session = await getSession()
	Object.assign(session, data)
	await session.save()
}

export function sessionNeedsRefresh(session: SessionData) {
	const now = Math.floor(Date.now() / 1000)
	return session.expiresAt <= now + TOKEN_REFRESH_BUFFER_SECONDS
}

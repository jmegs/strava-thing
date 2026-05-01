import { cookies } from "next/headers"
import type { SessionData } from "@/shared/types"
import { getEnv } from "@/lib/cf"

const COOKIE_NAME = "session"
const SESSION_TTL = 30 * 24 * 60 * 60

function sessionKey(sid: string) {
	return `session:${sid}`
}

function newSessionId() {
	const bytes = crypto.getRandomValues(new Uint8Array(32))
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

export async function getSession(): Promise<SessionData | null> {
	const sid = (await cookies()).get(COOKIE_NAME)?.value
	if (!sid) return null
	const env = await getEnv()
	return env.SESSIONS.get<SessionData>(sessionKey(sid), "json")
}

export async function setSession(data: SessionData) {
	const sid = newSessionId()
	const env = await getEnv()
	await env.SESSIONS.put(sessionKey(sid), JSON.stringify(data), {
		expirationTtl: SESSION_TTL,
	})
	;(await cookies()).set(COOKIE_NAME, sid, {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		maxAge: SESSION_TTL,
		path: "/",
	})
}

export async function destroySession() {
	const sid = (await cookies()).get(COOKIE_NAME)?.value
	if (sid) {
		const env = await getEnv()
		await env.SESSIONS.delete(sessionKey(sid))
	}
	;(await cookies()).delete(COOKIE_NAME)
}

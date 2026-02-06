import { env } from "cloudflare:workers"
import { defineSessionStore } from "rwsdk/auth"
import type { SessionData } from "@/shared/types"

const THIRTY_DAYS = 30 * 24 * 60 * 60

export const sessions = defineSessionStore<SessionData | null, SessionData>({
	async get(sessionId) {
		return env.SESSIONS.get<SessionData>(sessionId, "json")
	},
	async set(sessionId, data) {
		await env.SESSIONS.put(sessionId, JSON.stringify(data), {
			expirationTtl: THIRTY_DAYS,
		})
	},
	async unset(sessionId) {
		await env.SESSIONS.delete(sessionId)
	},
})

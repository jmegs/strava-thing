import type { AstroSession } from "astro"
import type { SessionData } from "@/shared/types"
import {
	isTokenExpired,
	loadApiTokenByRawToken,
	updateApiToken,
} from "./api-tokens"

export interface ApiPrincipal {
	athleteId: number
	authType: "session" | "bearer"
	tokenId?: string
	scopes?: string[]
}

export type ApiAuthResult =
	| { ok: true; principal: ApiPrincipal }
	| { ok: false; response: Response }

function unauthorized(message = "Unauthorized") {
	return Response.json({ error: message }, { status: 401 })
}

function getBearerToken(request: Request) {
	const header = request.headers.get("Authorization")
	if (!header) return null
	const match = /^Bearer\s+(.+)$/i.exec(header.trim())
	return match?.[1] ?? ""
}

export async function requireApiAuth(
	request: Request,
	session: AstroSession | undefined,
): Promise<ApiAuthResult> {
	const bearerToken = getBearerToken(request)

	if (bearerToken !== null) {
		const stored = await loadApiTokenByRawToken(bearerToken)
		if (!stored) return { ok: false, response: unauthorized("Invalid bearer token") }

		if (isTokenExpired(stored.token)) {
			return { ok: false, response: unauthorized("Expired bearer token") }
		}

		const nextToken = {
			...stored.token,
			lastUsedAt: new Date().toISOString(),
		}
		await updateApiToken(stored.key, nextToken)

		return {
			ok: true,
			principal: {
				athleteId: stored.token.athleteId,
				authType: "bearer",
				tokenId: stored.token.id,
				scopes: stored.token.scopes,
			},
		}
	}

	const auth = (await session?.get("auth")) as SessionData | null | undefined
	if (!auth?.athleteId) {
		return { ok: false, response: unauthorized() }
	}

	return {
		ok: true,
		principal: {
			athleteId: auth.athleteId,
			authType: "session",
		},
	}
}

export async function requireSessionAuth(session: AstroSession | undefined) {
	const auth = (await session?.get("auth")) as SessionData | null | undefined
	if (!auth?.athleteId) {
		return { ok: false as const, response: unauthorized() }
	}
	return {
		ok: true as const,
		principal: { athleteId: auth.athleteId, authType: "session" as const },
	}
}

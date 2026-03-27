import { env } from "cloudflare:workers"
import { render, route } from "rwsdk/router"
import { defineApp } from "rwsdk/worker"
import { z } from "zod"

import { Document } from "@/app/Document"
import { setCommonHeaders } from "@/app/headers"
import { LoginPage } from "@/app/pages/LoginPage"
import { HomePage } from "@/app/pages/HomePage"
import { sessions, THIRTY_DAYS, MCP_TOKENS_KEY } from "@/server/session"
import { createStravaClient } from "@/server/strava"
import { getWeather } from "@/server/weather"
import { handleMcp } from "@/server/mcp"
import { formatRunDetail } from "@/shared/format"
import type { SessionData } from "@/shared/types"

export type AppContext = {
	session: SessionData | null
}

// --- Auth interruptors ---

const requireAuth = ({ ctx }: { ctx: AppContext }) => {
	if (!ctx.session) {
		return new Response(null, {
			status: 302,
			headers: { Location: "/login" },
		})
	}
}

const publicOnly = ({ ctx }: { ctx: AppContext }) => {
	if (ctx.session) {
		return new Response(null, {
			status: 302,
			headers: { Location: "/" },
		})
	}
}

// --- Auth route handlers ---

const handleStravaRedirect = ({ request }: { request: Request }) => {
	const origin = new URL(request.url).origin
	const params = new URLSearchParams({
		client_id: env.STRAVA_CLIENT_ID,
		redirect_uri: `${origin}/auth/strava/callback`,
		response_type: "code",
		scope: "read,activity:read_all",
	})
	return new Response(null, {
		status: 302,
		headers: {
			Location: `https://www.strava.com/oauth/authorize?${params}`,
		},
	})
}

const handleStravaCallback = async ({
	request,
	response,
}: {
	request: Request
	response: { headers: Headers }
}) => {
	const url = new URL(request.url)
	const code = url.searchParams.get("code")

	if (!code) {
		return new Response(null, {
			status: 302,
			headers: { Location: "/login" },
		})
	}

	try {
		const tokenRes = await fetch("https://www.strava.com/oauth/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				client_id: env.STRAVA_CLIENT_ID,
				client_secret: env.STRAVA_CLIENT_SECRET,
				code,
				grant_type: "authorization_code",
			}),
		})

		if (!tokenRes.ok) {
			console.error("Strava token exchange failed:", await tokenRes.text())
			return new Response(null, {
				status: 302,
				headers: { Location: "/login" },
			})
		}

		const tokens = (await tokenRes.json()) as {
			athlete: { id: number }
			access_token: string
			expires_at: number
			refresh_token: string
		}

		const headers = new Headers()
		await sessions.save(headers, {
			athleteId: tokens.athlete.id,
			accessToken: tokens.access_token,
			expiresAt: tokens.expires_at,
			refreshToken: tokens.refresh_token,
		})

		await env.SESSIONS.put(
			MCP_TOKENS_KEY,
			JSON.stringify({
				athleteId: tokens.athlete.id,
				accessToken: tokens.access_token,
				expiresAt: tokens.expires_at,
				refreshToken: tokens.refresh_token,
			}),
			{ expirationTtl: THIRTY_DAYS },
		)

		headers.set("Location", "/")
		return new Response(null, { status: 302, headers })
	} catch (e) {
		console.error("Strava OAuth error:", e)
		return new Response(null, {
			status: 302,
			headers: { Location: "/login" },
		})
	}
}

// --- Run detail API handler ---

const handleRunDetail = async ({
	params,
	ctx,
}: {
	params: { id: string }
	ctx: AppContext
}) => {
	if (!ctx.session) {
		return new Response("Unauthorized", { status: 401 })
	}

	const schema = z.object({ id: z.coerce.number() })
	const parsed = schema.safeParse(params)
	if (!parsed.success) {
		return Response.json({ error: "Invalid ID" }, { status: 400 })
	}

	const strava = createStravaClient(ctx.session)

	let act
	try {
		act = await strava.activities.getActivityById({ id: parsed.data.id })
	} catch {
		return Response.json({ error: "Activity not found" }, { status: 404 })
	}

	const [lat, lng] = act.start_latlng ?? [null, null]
	const isoUTC = act.start_date
	const weather = lat && lng ? await getWeather({ lat, lng, isoUTC }) : null

	return Response.json(formatRunDetail(act, weather))
}

// --- App ---

export default defineApp([
	setCommonHeaders(),
	route("/mcp", handleMcp),
	async ({ ctx, request }) => {
		try {
			ctx.session = await sessions.load(request)
		} catch {
			ctx.session = null
		}
	},
	route("/auth/strava", handleStravaRedirect),
	route("/auth/strava/callback", handleStravaCallback),
	route("/api/run/:id", handleRunDetail),
	render(Document, [
		route("/login", [publicOnly, LoginPage]),
		route("/", [requireAuth, HomePage]),
	]),
])

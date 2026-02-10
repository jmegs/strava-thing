import { env } from "cloudflare:workers"
import { render, route } from "rwsdk/router"
import { defineApp } from "rwsdk/worker"
import { z } from "zod"

import { Document } from "@/app/Document"
import { setCommonHeaders } from "@/app/headers"
import { LoginPage } from "@/app/pages/LoginPage"
import { HomePage } from "@/app/pages/HomePage"
import { sessions } from "@/server/session"
import { createStravaClient } from "@/server/strava"
import { getWeather } from "@/server/weather"
import { handleMcp } from "@/server/mcp"
import {
	mToMi,
	mToFt,
	msToMin,
	round2,
	getTag,
	isWorkout,
	buildLaps,
} from "@/shared/format"
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
			"mcp-tokens",
			JSON.stringify({
				athleteId: tokens.athlete.id,
				accessToken: tokens.access_token,
				expiresAt: tokens.expires_at,
				refreshToken: tokens.refresh_token,
			}),
			{ expirationTtl: 30 * 24 * 60 * 60 },
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

	return Response.json({
		name: act.name,
		strava_activity_id: act.id,
		date: act.start_date,
		date_local: act.start_date_local,
		distance_mi: round2(mToMi(act.distance)),
		moving_time_s: act.moving_time,
		elapsed_time_s: act.elapsed_time,
		avg_pace_s_per_mi: Math.round(act.moving_time / mToMi(act.distance)),
		avg_pace_min_per_mile: msToMin(act.average_speed),
		avg_hr: Math.round(act.average_heartrate),
		cadence_spm: round2(act.average_cadence * 2),
		max_hr: act.max_heartrate,
		elev_gain_ft: round2(mToFt(act.total_elevation_gain)),
		route_start_latlng: act.start_latlng,
		workout_type_tag: getTag(act.workout_type),
		splits: act.splits_standard.map(
			(split: {
				split: number
				distance: number
				moving_time: number
				average_speed: number
				average_heartrate: number
				elevation_difference: number
			}) => ({
				split: split.split,
				distance_mi: round2(mToMi(split.distance)),
				moving_time_s: split.moving_time,
				pace_s: round2(split.moving_time / mToMi(split.distance)),
				pace_min_per_mile: msToMin(split.average_speed),
				avg_hr: Math.round(split.average_heartrate),
				elev_gain_ft: round2(mToFt(split.elevation_difference)),
			}),
		),
		...(isWorkout(act) && { laps: buildLaps(act) }),
		rpe: act.perceived_exertion || null,
		shoes: act.gear?.name,
		notes: act.description,
		private_notes: act.private_note || null,
		weather,
	})
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

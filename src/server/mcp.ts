import { env } from "cloudflare:workers"
import { z } from "zod"
import type { SummaryActivity } from "strava"
import type { SessionData } from "@/shared/types"
import { createMcpStravaClient } from "@/server/strava"
import { getWeather } from "@/server/weather"
import { computeStats } from "@/shared/stats"
import {
	mToMi,
	mToFt,
	msToMin,
	round2,
	getTag,
	isWorkout,
	buildLaps,
} from "@/shared/format"

// --- JSON-RPC helpers ---

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, mcp-session-id",
	"Access-Control-Expose-Headers": "mcp-session-id",
}

function jsonRpcResponse(id: string | number, result: unknown) {
	return Response.json(
		{ jsonrpc: "2.0", id, result },
		{ headers: CORS_HEADERS },
	)
}

function jsonRpcError(
	id: string | number | null,
	code: number,
	message: string,
) {
	return Response.json(
		{ jsonrpc: "2.0", id, error: { code, message } },
		{ headers: CORS_HEADERS },
	)
}

// --- Token loading ---

async function loadMcpTokens(): Promise<SessionData | null> {
	return env.SESSIONS.get<SessionData>("mcp-tokens", "json")
}

// --- Strava data fetching ---

async function fetchRuns(session: SessionData): Promise<SummaryActivity[]> {
	const strava = createMcpStravaClient(session)
	const after = Math.floor(Date.now() / 1000) - 90 * 86400
	const list: SummaryActivity[] =
		await strava.activities.getLoggedInAthleteActivities({
			after,
			per_page: 200,
		})
	return list
		.filter((a) => a.type === "Run")
		.sort((a, b) => b.start_date.localeCompare(a.start_date))
}

// --- Tool definitions ---

const TOOLS = [
	{
		name: "get_stats",
		description:
			"Get running statistics for the last 7 and 28 days: weekly mileage, easy pace, easy HR, longest run.",
		inputSchema: { type: "object" as const, properties: {} },
	},
	{
		name: "get_runs",
		description:
			"Get a list of recent runs with distance, pace, HR, and workout tag.",
		inputSchema: {
			type: "object" as const,
			properties: {
				limit: {
					type: "number",
					description: "Max runs to return (default 20)",
				},
			},
		},
	},
	{
		name: "get_run_detail",
		description:
			"Get full details for a specific run including splits, weather, laps, and notes.",
		inputSchema: {
			type: "object" as const,
			properties: {
				run_id: { type: "number", description: "Strava activity ID" },
			},
			required: ["run_id"],
		},
	},
]

// --- Tool handlers ---

async function handleGetStats() {
	const session = await loadMcpTokens()
	if (!session)
		return { error: "Not authenticated. Log in at strava.john.zone first." }
	const runs = await fetchRuns(session)
	return computeStats(runs)
}

async function handleGetRuns(args: { limit?: number }) {
	const session = await loadMcpTokens()
	if (!session)
		return { error: "Not authenticated. Log in at strava.john.zone first." }
	const runs = await fetchRuns(session)
	const limit = args.limit ?? 20
	return runs.slice(0, limit).map((r) => ({
		id: r.id,
		name: r.name,
		date: r.start_date_local,
		distance_mi: round2(mToMi(r.distance ?? 0)),
		pace: msToMin(r.average_speed ?? 0),
		avg_hr: r.average_heartrate ? Math.round(r.average_heartrate) : null,
		tag: getTag(r.workout_type),
	}))
}

async function handleGetRunDetail(args: { run_id: number }) {
	const session = await loadMcpTokens()
	if (!session)
		return { error: "Not authenticated. Log in at strava.john.zone first." }

	const schema = z.object({ run_id: z.number() })
	const parsed = schema.safeParse(args)
	if (!parsed.success) return { error: "Invalid run_id" }

	const strava = createMcpStravaClient(session)
	const act = await strava.activities.getActivityById({
		id: parsed.data.run_id,
	})

	const [lat, lng] = act.start_latlng ?? [null, null]
	const isoUTC = act.start_date
	const weather = lat && lng ? await getWeather({ lat, lng, isoUTC }) : null

	return {
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
	}
}

// --- MCP protocol dispatch ---

export async function handleMcp({ request }: { request: Request }) {
	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: CORS_HEADERS })
	}

	if (request.method === "GET") {
		return new Response("Method Not Allowed", {
			status: 405,
			headers: CORS_HEADERS,
		})
	}

	if (request.method === "DELETE") {
		return new Response(null, { status: 202, headers: CORS_HEADERS })
	}

	if (request.method !== "POST") {
		return new Response("Method Not Allowed", {
			status: 405,
			headers: CORS_HEADERS,
		})
	}

	let body: { jsonrpc: string; id?: string | number; method: string; params?: Record<string, unknown> }
	try {
		body = await request.json()
	} catch {
		return jsonRpcError(null, -32700, "Parse error")
	}

	// Notifications (no id) return 202
	if (body.id === undefined) {
		return new Response(null, { status: 202, headers: CORS_HEADERS })
	}

	const { id, method, params } = body

	switch (method) {
		case "initialize":
			return jsonRpcResponse(id, {
				protocolVersion: "2025-03-26",
				capabilities: { tools: {} },
				serverInfo: {
					name: "strava-running",
					version: "1.0.0",
				},
			})

		case "ping":
			return jsonRpcResponse(id, {})

		case "tools/list":
			return jsonRpcResponse(id, { tools: TOOLS })

		case "tools/call": {
			const toolName = (params as { name: string })?.name
			const toolArgs = (params as { arguments?: Record<string, unknown> })?.arguments ?? {}

			try {
				let result: unknown
				switch (toolName) {
					case "get_stats":
						result = await handleGetStats()
						break
					case "get_runs":
						result = await handleGetRuns(toolArgs as { limit?: number })
						break
					case "get_run_detail":
						result = await handleGetRunDetail(
							toolArgs as { run_id: number },
						)
						break
					default:
						return jsonRpcError(id, -32602, `Unknown tool: ${toolName}`)
				}
				return jsonRpcResponse(id, {
					content: [
						{ type: "text", text: JSON.stringify(result, null, 2) },
					],
				})
			} catch (e) {
				const message =
					e instanceof Error ? e.message : "Internal error"
				return jsonRpcResponse(id, {
					content: [{ type: "text", text: `Error: ${message}` }],
					isError: true,
				})
			}
		}

		default:
			return jsonRpcError(id, -32601, `Method not found: ${method}`)
	}
}

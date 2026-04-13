import { env } from "cloudflare:workers"
import { z } from "zod"
import type { SessionData } from "../shared/types"
import { createMcpStravaClient } from "./strava"
import { fetchRecentRuns } from "./runs"
import { getWeather } from "./weather"
import { computeStats } from "../shared/stats"
import { MCP_TOKENS_KEY } from "./session"
import {
	mToMi,
	msToMin,
	round2,
	getTag,
	formatRunDetail,
} from "../shared/format"

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
	return env.SESSIONS.get<SessionData>(MCP_TOKENS_KEY, "json")
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
				page: {
					type: "number",
					description:
						"Page number for older runs (default 1, 200 runs per page)",
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
	{
		name: "get_activity_streams",
		description:
			"Get time-series stream data for a run (heart rate, pace, distance, etc). Returns arrays of values at each recorded point.",
		inputSchema: {
			type: "object" as const,
			properties: {
				run_id: { type: "number", description: "Strava activity ID" },
				keys: {
					type: "array",
					items: {
						type: "string",
						enum: [
							"heartrate",
							"time",
							"distance",
							"velocity_smooth",
							"altitude",
							"cadence",
							"latlng",
							"grade_smooth",
						],
					},
					description:
						"Stream types to fetch (default: heartrate, time, distance)",
				},
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
	const strava = createMcpStravaClient(session)
	const runs = await fetchRecentRuns(strava)
	return computeStats(runs)
}

async function handleGetRuns(args: { limit?: number; page?: number }) {
	const session = await loadMcpTokens()
	if (!session)
		return { error: "Not authenticated. Log in at strava.john.zone first." }
	const strava = createMcpStravaClient(session)
	const runs = await fetchRecentRuns(strava, args.page ?? 1)
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

	return formatRunDetail(act, weather)
}

async function handleGetActivityStreams(args: {
	run_id: number
	keys?: string[]
}) {
	const session = await loadMcpTokens()
	if (!session)
		return { error: "Not authenticated. Log in at strava.john.zone first." }

	const schema = z.object({
		run_id: z.number(),
		keys: z
			.array(z.string())
			.optional()
			.default(["heartrate", "time", "distance"]),
	})
	const parsed = schema.safeParse(args)
	if (!parsed.success) return { error: "Invalid arguments" }

	const strava = createMcpStravaClient(session)
	const streams = await strava.streams.getActivityStreams({
		id: parsed.data.run_id,
		keys: parsed.data.keys as import("strava").StreamKeys[],
	})

	return streams
}

// --- MCP protocol dispatch ---

export async function handleMcp(request: Request) {
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
					case "get_activity_streams":
						result = await handleGetActivityStreams(
							toolArgs as { run_id: number; keys?: string[] },
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

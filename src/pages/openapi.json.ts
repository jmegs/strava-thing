import type { APIRoute } from "astro"

const runSummarySchema = {
	type: "object",
	required: [
		"id",
		"name",
		"date",
		"date_local",
		"distance_mi",
		"moving_time_s",
		"elapsed_time_s",
		"avg_pace_s_per_mi",
		"avg_pace",
		"avg_hr",
		"max_hr",
		"elevation_gain_ft",
		"workout_type_tag",
	],
	properties: {
		id: { type: "integer" },
		name: { type: "string" },
		date: { type: ["string", "null"], format: "date-time" },
		date_local: { type: ["string", "null"] },
		distance_mi: { type: "number" },
		moving_time_s: { type: "integer" },
		elapsed_time_s: { type: ["integer", "null"] },
		avg_pace_s_per_mi: { type: ["integer", "null"] },
		avg_pace: { type: ["string", "null"] },
		avg_hr: { type: ["integer", "null"] },
		max_hr: { type: ["integer", "null"] },
		elevation_gain_ft: { type: ["number", "null"] },
		workout_type_tag: { type: ["string", "null"] },
	},
}

const runAggregateStatsSchema = {
	type: "object",
	required: [
		"run_count",
		"distance_mi",
		"moving_time_s",
		"longest_run_mi",
		"avg_pace_s_per_mi",
		"avg_pace",
		"avg_hr",
	],
	properties: {
		run_count: { type: "integer" },
		distance_mi: { type: "number" },
		moving_time_s: { type: "integer" },
		longest_run_mi: { type: "number" },
		avg_pace_s_per_mi: { type: ["integer", "null"] },
		avg_pace: { type: ["string", "null"] },
		avg_hr: { type: ["integer", "null"] },
	},
}

const spec = {
	openapi: "3.1.0",
	info: {
		title: "Strava Thing Running API",
		version: "1.0.0",
		description:
			"Read-only running data API for Strava Thing dashboard and GPT Actions.",
	},
	servers: [{ url: "https://strava.john.zone" }],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "API token",
			},
		},
		schemas: {
			RunSummary: runSummarySchema,
			RunDetail: {
				allOf: [
					runSummarySchema,
					{
						type: "object",
						properties: {
							description: { type: ["string", "null"] },
							splits: { type: "array", items: { type: "object" } },
							laps: { type: "array", items: { type: "object" } },
							weather: { type: ["object", "null"] },
						},
					},
				],
			},
			RunAggregateStats: runAggregateStatsSchema,
			StatsWindow: {
				type: "object",
				required: ["window_days", "all", "easy"],
				properties: {
					window_days: { type: "integer" },
					all: { $ref: "#/components/schemas/RunAggregateStats" },
					easy: { $ref: "#/components/schemas/RunAggregateStats" },
				},
			},
		},
	},
	security: [{ bearerAuth: [] }],
	paths: {
		"/api/me": {
			get: {
				operationId: "getCurrentAthlete",
				summary: "Get the authenticated athlete",
				responses: {
					"200": {
						description: "Authenticated athlete basics",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										data: {
											type: "object",
											properties: {
												athlete_id: { type: "integer" },
												firstname: { type: ["string", "null"] },
												lastname: { type: ["string", "null"] },
												city: { type: ["string", "null"] },
												state: { type: ["string", "null"] },
												country: { type: ["string", "null"] },
											},
											required: ["athlete_id"],
										},
									},
								},
							},
						},
					},
				},
			},
		},
		"/api/stats": {
			get: {
				operationId: "getRunningStats",
				summary: "Get running stats for rolling windows",
				parameters: [
					{
						name: "windows",
						in: "query",
						required: false,
						schema: { type: "string", default: "7,28" },
						description: "Comma-separated rolling windows in days.",
					},
				],
				responses: {
					"200": {
						description: "Running stats",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										data: {
											type: "object",
											required: ["windows"],
											properties: {
												windows: {
													type: "array",
													items: { $ref: "#/components/schemas/StatsWindow" },
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
		"/api/runs": {
			get: {
				operationId: "listRuns",
				summary: "List recent runs",
				parameters: [
					{ name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100, minimum: 1 } },
					{ name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
					{ name: "after", in: "query", schema: { type: "string", format: "date-time" } },
					{ name: "before", in: "query", schema: { type: "string", format: "date-time" } },
				],
				responses: {
					"200": {
						description: "Run summaries",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										data: {
											type: "array",
											items: { $ref: "#/components/schemas/RunSummary" },
										},
									},
								},
							},
						},
					},
				},
			},
		},
		"/api/runs/{run_id}": {
			get: {
				operationId: "getRunDetail",
				summary: "Get one run with splits, laps, and weather",
				parameters: [
					{
						name: "run_id",
						in: "path",
						required: true,
						schema: { type: "integer" },
					},
				],
				responses: {
					"200": {
						description: "Run detail",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										data: { $ref: "#/components/schemas/RunDetail" },
									},
								},
							},
						},
					},
				},
			},
		},
		"/api/runs/{run_id}/streams": {
			get: {
				operationId: "getRunStreams",
				summary: "Get Strava stream data for a run",
				parameters: [
					{
						name: "run_id",
						in: "path",
						required: true,
						schema: { type: "integer" },
					},
					{
						name: "keys",
						in: "query",
						required: false,
						schema: {
							type: "string",
							default: "heartrate,time,distance",
						},
						description:
							"Comma-separated stream keys: heartrate,time,distance,velocity_smooth,altitude,cadence,latlng,grade_smooth.",
					},
				],
				responses: {
					"200": {
						description: "Stream data keyed by stream type",
						content: {
							"application/json": {
								schema: { type: "object", properties: { data: { type: "object" } } },
							},
						},
					},
				},
			},
		},
	},
}

export const GET: APIRoute = async () => {
	return Response.json(spec)
}

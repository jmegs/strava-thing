import type { StreamKeys } from "strava"
import { z } from "zod"
import { formatRunDetail, formatRunSummary } from "@/lib/format/runs"
import type { RunDetail, RunSummary } from "@/lib/format/runs"
import { createStravaClientForAthlete } from "@/lib/strava/client"
import { fetchRecentRuns } from "@/lib/strava/runs"
import { getWeatherForActivity } from "@/lib/services/weather-service"

export const ALLOWED_STREAM_KEYS = [
	"heartrate",
	"time",
	"distance",
	"velocity_smooth",
	"altitude",
	"cadence",
	"latlng",
	"grade_smooth",
] as const

export const DEFAULT_STREAM_KEYS = ["heartrate", "time", "distance"] as const

export type AllowedStreamKey = (typeof ALLOWED_STREAM_KEYS)[number]

export interface ListRunsOptions {
	limit?: number
	page?: number
	after?: string | null
	before?: string | null
}

export interface ListRunsResult {
	runs: RunSummary[]
	limit: number
	page: number
}

export function parsePositiveInt(
	value: string | null,
	defaultValue: number,
	max?: number,
) {
	const parsed = value ? Number.parseInt(value, 10) : defaultValue
	if (!Number.isFinite(parsed) || parsed < 1) return defaultValue
	return max ? Math.min(parsed, max) : parsed
}

export async function listRunsForAthlete(
	athleteId: number,
	options: ListRunsOptions = {},
): Promise<ListRunsResult> {
	const limit = Math.min(Math.max(options.limit ?? 20, 1), 100)
	const page = Math.max(options.page ?? 1, 1)
	const strava = await createStravaClientForAthlete(athleteId)
	const runs = await fetchRecentRuns(strava, page, {
		limit,
		after: options.after ?? undefined,
		before: options.before ?? undefined,
	})

	return {
		runs: runs.map(formatRunSummary),
		limit,
		page,
	}
}

export async function getRunDetailForAthlete(
	athleteId: number,
	runId: number,
): Promise<RunDetail | null> {
	const strava = await createStravaClientForAthlete(athleteId)
	const activity = await strava.activities.getActivityById({ id: runId })
	if (activity.type !== "Run") return null

	const weather = await getWeatherForActivity(activity)

	return formatRunDetail(activity, weather)
}

export function parseStreamKeys(value: string | null) {
	if (!value) return [...DEFAULT_STREAM_KEYS]
	return value
		.split(",")
		.map((key) => key.trim())
		.filter(Boolean)
}

export function validateStreamKeys(keys: string[]) {
	const schema = z.array(z.enum(ALLOWED_STREAM_KEYS))
	return schema.safeParse(keys)
}

export async function getRunStreamsForAthlete(
	athleteId: number,
	runId: number,
	keys: AllowedStreamKey[],
) {
	const strava = await createStravaClientForAthlete(athleteId)
	return strava.streams.getActivityStreams({
		id: runId,
		keys: keys as StreamKeys[],
	})
}

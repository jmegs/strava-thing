import type { DetailedActivity, Lap, SummaryActivity } from "strava"
import type { WeatherData } from "@/shared/types"
import { getTag, mToFt, mToMi, msToMin, round2 } from "@/shared/format"

export interface RunSummary {
	id: number
	name: string
	date: string | null
	date_local: string | null
	distance_mi: number
	moving_time_s: number
	elapsed_time_s: number | null
	avg_pace_s_per_mi: number | null
	avg_pace: string | null
	avg_hr: number | null
	max_hr: number | null
	elevation_gain_ft: number | null
	workout_type_tag: string | null
	summary_polyline?: string | null
}

export interface Split {
	split: number
	distance_mi: number
	moving_time_s: number
	elapsed_time_s: number | null
	pace_s_per_mi: number | null
	avg_pace: string | null
	avg_hr: number | null
	elev_gain_ft: number | null
}

export interface NormalizedLap extends Split {
	lap_index: number
}

export interface RunDetail extends RunSummary {
	description?: string | null
	splits?: Split[]
	laps?: NormalizedLap[]
	weather?: WeatherData | null
}

function paceSecondsPerMile(distanceMeters: number, movingTimeSeconds: number) {
	const miles = mToMi(distanceMeters)
	if (!Number.isFinite(miles) || miles <= 0 || movingTimeSeconds <= 0) return null
	return Math.round(movingTimeSeconds / miles)
}

function paceString(averageSpeedMetersPerSecond: number | null | undefined) {
	if (!averageSpeedMetersPerSecond || averageSpeedMetersPerSecond <= 0) return null
	return msToMin(averageSpeedMetersPerSecond)
}

export function formatRunSummary(run: SummaryActivity | DetailedActivity): RunSummary {
	return {
		id: run.id,
		name: run.name,
		date: run.start_date ?? null,
		date_local: run.start_date_local ?? null,
		distance_mi: round2(mToMi(run.distance ?? 0)),
		moving_time_s: run.moving_time ?? 0,
		elapsed_time_s: run.elapsed_time ?? null,
		avg_pace_s_per_mi: paceSecondsPerMile(run.distance ?? 0, run.moving_time ?? 0),
		avg_pace: paceString(run.average_speed),
		avg_hr: run.average_heartrate ? Math.round(run.average_heartrate) : null,
		max_hr: run.max_heartrate ? Math.round(run.max_heartrate) : null,
		elevation_gain_ft:
			typeof run.total_elevation_gain === "number"
				? round2(mToFt(run.total_elevation_gain))
				: null,
		workout_type_tag: getTag(run.workout_type),
		summary_polyline: run.map?.summary_polyline ?? null,
	}
}

function formatSplit(split: {
	split: number
	distance: number
	moving_time: number
	elapsed_time?: number
	average_speed: number
	average_heartrate?: number
	elevation_difference?: number
}): Split {
	return {
		split: split.split,
		distance_mi: round2(mToMi(split.distance)),
		moving_time_s: split.moving_time,
		elapsed_time_s: split.elapsed_time ?? null,
		pace_s_per_mi: paceSecondsPerMile(split.distance, split.moving_time),
		avg_pace: paceString(split.average_speed),
		avg_hr: split.average_heartrate
			? Math.round(split.average_heartrate)
			: null,
		elev_gain_ft:
			typeof split.elevation_difference === "number"
				? round2(mToFt(split.elevation_difference))
				: null,
	}
}

function formatLap(lap: Lap): NormalizedLap {
	return {
		...formatSplit(lap),
		lap_index: lap.lap_index,
	}
}

export function formatRunDetail(
	run: DetailedActivity,
	weather: WeatherData | null,
): RunDetail {
	return {
		...formatRunSummary(run),
		description: run.description ?? null,
		splits: run.splits_standard?.map(formatSplit) ?? [],
		laps: run.laps?.map(formatLap) ?? [],
		weather,
	}
}

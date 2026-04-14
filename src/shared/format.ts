import type { DetailedActivity, Lap } from "strava"
import type { WeatherData } from "@/shared/types"

export function mToMi(meters: number) {
	const miles = meters * 0.000621371
	return miles
}

export function secToHMS(total: number) {
	const h = Math.floor(total / 3600)
	const m = Math.floor((total % 3600) / 60)
	const s = total % 60

	const pad = (num: number) => num.toString().padStart(2, "0")

	return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function msToMin(mps: number) {
	if (!Number.isFinite(mps) || mps <= 0) return "—"
	const paceSeconds = 1609.344 / mps // exact sec/mi
	const total = Math.round(paceSeconds) // one rounding only
	const minutes = Math.floor(total / 60)
	const seconds = total - minutes * 60 // 0..59, no 60s
	return `${minutes}:${String(seconds).padStart(2, "0")}/mi`
}

export function mToFt(meters: number) {
	const feet = meters * 3.28084
	return feet
}

export function round2(num: number) {
	return Math.round(num * 100) / 100
}

export function getTag(workoutType: number | null | undefined) {
	if (workoutType === 2) return "L"
	if (workoutType === 3) return "Q"
	return null // 0 or any other value returns null (no tag)
}

export function isWorkout(act: DetailedActivity) {
	return getTag(act.workout_type) === "Q"
}

export function formatDelta(num: number, decimals = 0) {
	const formatted = num.toFixed(decimals)
	return num > 0 ? `+${formatted}` : formatted
}

export function buildLaps(act: DetailedActivity) {
	if (!act.laps) return []
	return act.laps.map((lap: Lap) => ({
		lap_index: lap.lap_index,
		split: lap.split,
		distance_mi: round2(mToMi(lap.distance)),
		moving_time: lap.moving_time,
		pace_s_per_mi: round2(lap.moving_time / mToMi(lap.distance)),
		pace_min_per_mile: msToMin(lap.average_speed),
		avg_hr: lap.average_heartrate ? Math.round(lap.average_heartrate) : null,
		max_hr: lap.max_heartrate ? Math.round(lap.max_heartrate) : null,
		elev_gain_ft: round2(mToFt(lap.total_elevation_gain)),
	}))
}

export function formatRunDetail(
	act: DetailedActivity,
	weather: WeatherData | null,
) {
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
		avg_hr: act.average_heartrate ? Math.round(act.average_heartrate) : null,
		cadence_spm: act.average_cadence ? round2(act.average_cadence * 2) : null,
		max_hr: act.max_heartrate ?? null,
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

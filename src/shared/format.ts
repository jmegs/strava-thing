import type { DetailedActivity, Lap } from "strava"

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
		avg_hr: Math.round(lap.average_heartrate),
		max_hr: Math.round(lap.max_heartrate),
		elev_gain_ft: round2(mToFt(lap.total_elevation_gain)),
	}))
}

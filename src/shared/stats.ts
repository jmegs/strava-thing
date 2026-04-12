import { isWithinInterval, parseISO, subDays } from "date-fns"
import type { SummaryActivity } from "strava"
import { mToMi, msToMin, getTag } from "@/shared/format"

export interface RunStats {
	miles_7d: number
	weekly_delta: number
	easy_pace_7d: string
	easy_pace_delta_pct: number
	easy_hr_7d: number
	easy_hr_delta_bpm: number
	longest_run_28d: number
}

function weightedAvg(values: number[], weights: number[]): number {
	const num = values.reduce((a, v, i) => a + v * (weights[i] ?? 0), 0)
	const den = weights.reduce((a, w) => a + (w ?? 0), 0)
	return den > 0 ? num / den : 0
}

export function computeStats(runs: SummaryActivity[]): RunStats {
	const now = new Date()

	const processedRuns = runs.map((r) => ({
		...r,
		date: parseISO(r.start_date),
		miles: mToMi(r.distance ?? 0),
		mps: r.average_speed ?? 0,
		secs: r.moving_time ?? 0,
		hr: r.average_heartrate ?? null,
		tag: r.workout_type,
		sportType: (r as unknown as { sport_type?: string }).sport_type,
	}))

	function inLast(d: Date, days: number) {
		return isWithinInterval(d, { start: subDays(now, days), end: now })
	}

	// volume
	const miles7 = processedRuns
		.filter((r) => inLast(r.date, 7))
		.reduce((a, r) => a + r.miles, 0)

	const miles28 = processedRuns
		.filter((r) => inLast(r.date, 28))
		.reduce((a, r) => a + r.miles, 0)

	const weeklyDelta = miles7 - miles28 / 4

	// easy runs (untagged)
	const easyRuns = processedRuns.filter((r) => getTag(r.tag, r.sportType) === null)
	const easy7 = easyRuns.filter((r) => inLast(r.date, 7))
	const easy28 = easyRuns.filter((r) => inLast(r.date, 28))

	// weighted avg pace
	const mps7 = weightedAvg(
		easy7.map((r) => r.mps),
		easy7.map((r) => r.miles),
	)
	const mps28 = weightedAvg(
		easy28.map((r) => r.mps),
		easy28.map((r) => r.miles),
	)
	const easyPct = mps28 > 0 ? ((mps7 - mps28) / mps28) * 100 : 0

	// HR weighted by moving time
	const e7HR = easy7.filter((r) => r.hr != null)
	const e28HR = easy28.filter((r) => r.hr != null)

	const hr7 = weightedAvg(
		e7HR.map((r) => r.hr ?? 0),
		e7HR.map((r) => r.secs),
	)
	const hr28 = weightedAvg(
		e28HR.map((r) => r.hr ?? 0),
		e28HR.map((r) => r.secs),
	)
	const hrDeltaBpm = hr7 - hr28

	// longest in 28d
	const longestRecent = processedRuns
		.filter((r) => inLast(r.date, 28))
		.reduce((mx, r) => Math.max(mx, r.miles), 0)

	return {
		miles_7d: miles7,
		weekly_delta: weeklyDelta,
		easy_pace_7d: msToMin(mps7),
		easy_pace_delta_pct: easyPct,
		easy_hr_7d: Math.round(hr7),
		easy_hr_delta_bpm: hrDeltaBpm,
		longest_run_28d: longestRecent,
	}
}

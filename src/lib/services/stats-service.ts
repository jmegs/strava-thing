import { isWithinInterval, parseISO, subDays } from "date-fns"
import { formatRunSummary } from "@/lib/format/runs"
import type { RunSummary } from "@/lib/format/runs"
import { createStravaClientForAthlete } from "@/lib/strava/client"
import { fetchRecentRuns } from "@/lib/strava/runs"
import { msToMin, round2 } from "@/shared/format"

export interface RunAggregateStats {
	run_count: number
	distance_mi: number
	moving_time_s: number
	longest_run_mi: number
	avg_pace_s_per_mi: number | null
	avg_pace: string | null
	avg_hr: number | null
}

export interface StatsWindow {
	window_days: number
	all: RunAggregateStats
	easy: RunAggregateStats
}

function weightedAvg(values: number[], weights: number[]) {
	const numerator = values.reduce((sum, value, index) => {
		return sum + value * (weights[index] ?? 0)
	}, 0)
	const denominator = weights.reduce((sum, weight) => sum + weight, 0)
	return denominator > 0 ? numerator / denominator : null
}

function computeAggregateStats(runs: RunSummary[]): RunAggregateStats {
	const distance = runs.reduce((sum, run) => sum + run.distance_mi, 0)
	const movingTime = runs.reduce((sum, run) => sum + run.moving_time_s, 0)
	const avgHr = weightedAvg(
		runs.filter((run) => run.avg_hr !== null).map((run) => run.avg_hr ?? 0),
		runs.filter((run) => run.avg_hr !== null).map((run) => run.moving_time_s),
	)
	const avgMetersPerSecond =
		distance > 0 && movingTime > 0 ? (distance * 1609.344) / movingTime : 0

	return {
		run_count: runs.length,
		distance_mi: round2(distance),
		moving_time_s: movingTime,
		longest_run_mi: round2(
			runs.reduce((max, run) => Math.max(max, run.distance_mi), 0),
		),
		avg_pace_s_per_mi:
			distance > 0 && movingTime > 0 ? Math.round(movingTime / distance) : null,
		avg_pace: avgMetersPerSecond > 0 ? msToMin(avgMetersPerSecond) : null,
		avg_hr: avgHr === null ? null : Math.round(avgHr),
	}
}

function isQualityRun(run: RunSummary) {
	return run.workout_type_tag === "Q"
}

export function computeWindowStats(
	runs: RunSummary[],
	windowDays: number,
	now = new Date(),
): StatsWindow {
	const inWindow = runs.filter((run) => {
		if (!run.date) return false
		return isWithinInterval(parseISO(run.date), {
			start: subDays(now, windowDays),
			end: now,
		})
	})

	return {
		window_days: windowDays,
		all: computeAggregateStats(inWindow),
		easy: computeAggregateStats(inWindow.filter((run) => !isQualityRun(run))),
	}
}

export async function getStatsForAthlete(
	athleteId: number,
	windows = [7, 28],
) {
	const strava = await createStravaClientForAthlete(athleteId)
	const rawRuns = await fetchRecentRuns(strava, 1)
	const runs = rawRuns.map(formatRunSummary)

	return {
		windows: windows.map((windowDays) => computeWindowStats(runs, windowDays)),
	}
}

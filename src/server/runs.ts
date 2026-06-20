import "server-only"

import type { Strava, SummaryActivity } from "strava"

import type { RunPage, RunSummary } from "@/shared/types"

const PAGE_SIZE = 50
const STRAVA_MAX_PAGE_SIZE = 200
const STATS_WINDOW_DAYS = 28

export async function fetchInitialActivities(strava: Strava) {
	const after = Math.floor(
		(Date.now() - STATS_WINDOW_DAYS * 24 * 60 * 60 * 1000) / 1000,
	)
	const activities = await fetchAllActivitiesAfter(strava, after)
	const runActivities = activities.filter((activity) => activity.type === "Run")

	return {
		runActivities,
		runs: toRunSummaries(runActivities),
		nextBefore: after,
	}
}

export async function fetchOlderRuns(
	strava: Strava,
	before: number,
): Promise<RunPage> {
	const activities = await strava.activities.getLoggedInAthleteActivities({
		before,
		per_page: PAGE_SIZE,
	})
	const lastActivity = activities.at(-1)

	return {
		runs: toRunSummaries(
			activities.filter((activity) => activity.type === "Run"),
		),
		nextBefore:
			activities.length === PAGE_SIZE && lastActivity
				? Math.floor(new Date(lastActivity.start_date).getTime() / 1000)
				: null,
	}
}

async function fetchAllActivitiesAfter(strava: Strava, after: number) {
	const activities: SummaryActivity[] = []

	for (let page = 1; ; page += 1) {
		const batch = await strava.activities.getLoggedInAthleteActivities({
			after,
			page,
			per_page: STRAVA_MAX_PAGE_SIZE,
		})
		activities.push(...batch)
		if (batch.length < STRAVA_MAX_PAGE_SIZE) return activities
	}
}

function toRunSummaries(activities: SummaryActivity[]): RunSummary[] {
	return activities
		.map((activity) => ({
			id: activity.id,
			name: activity.name,
			startDate: activity.start_date_local,
			distance: activity.distance,
			movingTime: activity.moving_time,
			averageHeartrate: activity.average_heartrate ?? null,
			workoutType: activity.workout_type ?? null,
			summaryPolyline: activity.map.summary_polyline ?? "",
		}))
}

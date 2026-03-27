import type { Strava, SummaryActivity } from "strava"

const NINETY_DAYS_S = 90 * 86400

export async function fetchRecentRuns(
	strava: Strava,
): Promise<SummaryActivity[]> {
	const after = Math.floor(Date.now() / 1000) - NINETY_DAYS_S
	const list: SummaryActivity[] =
		await strava.activities.getLoggedInAthleteActivities({
			after,
			per_page: 200,
		})
	return list
		.filter((a) => a.type === "Run")
		.sort((a, b) => b.start_date.localeCompare(a.start_date))
}

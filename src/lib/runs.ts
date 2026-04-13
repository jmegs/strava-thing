import type { Strava, SummaryActivity } from "strava"

export async function fetchRecentRuns(
	strava: Strava,
	page = 1,
): Promise<SummaryActivity[]> {
	const list: SummaryActivity[] =
		await strava.activities.getLoggedInAthleteActivities({
			per_page: 200,
			page,
		})
	return list
		.filter((a) => a.type === "Run")
		.sort((a, b) => b.start_date.localeCompare(a.start_date))
}

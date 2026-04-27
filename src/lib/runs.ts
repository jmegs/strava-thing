import type { Strava, SummaryActivity } from "strava"

export async function fetchRecentRuns(
	strava: Strava,
	page = 1,
	options: { limit?: number; after?: string; before?: string } = {},
): Promise<SummaryActivity[]> {
	const list: SummaryActivity[] =
		await strava.activities.getLoggedInAthleteActivities({
			per_page: options.limit ?? 200,
			page,
			after: options.after
				? Math.floor(new Date(options.after).getTime() / 1000)
				: undefined,
			before: options.before
				? Math.floor(new Date(options.before).getTime() / 1000)
				: undefined,
		})
	return list
		.filter((a) => a.type === "Run")
		.sort((a, b) => b.start_date.localeCompare(a.start_date))
}

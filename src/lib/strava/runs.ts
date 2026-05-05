import type { Strava, SummaryActivity } from "strava"

function toEpochSeconds(value: string | undefined) {
	return value ? Math.floor(new Date(value).getTime() / 1000) : undefined
}

export async function fetchRecentRuns(
	strava: Strava,
	page = 1,
	options: { limit?: number; after?: string; before?: string } = {},
): Promise<SummaryActivity[]> {
	const limit = options.limit ?? 200
	const start = (Math.max(page, 1) - 1) * limit
	const target = start + limit
	const perPage = 200
	const runs: SummaryActivity[] = []
	let activityPage = 1

	while (runs.length < target) {
		const list: SummaryActivity[] =
			await strava.activities.getLoggedInAthleteActivities({
				per_page: perPage,
				page: activityPage,
				after: toEpochSeconds(options.after),
				before: toEpochSeconds(options.before),
			})

		runs.push(...list.filter((activity) => activity.type === "Run"))
		if (list.length < perPage) break
		activityPage += 1
	}

	return runs
		.sort((a, b) => b.start_date.localeCompare(a.start_date))
		.slice(start, target)
}

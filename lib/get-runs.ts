import { requireStravaClient } from "./strava-client";

export async function getRunsLastNDays(days = 30) {
	const client = await requireStravaClient();
	const after = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
	const list = await client.activities.getLoggedInAthleteActivities({
		after,
		per_page: 200,
	});
	return list
		.filter((a) => a.type === "Run")
		.sort(
			(a, b) =>
				new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
		);
}

import { requireStravaClient } from "./strava";

export async function fetchRuns() {
	const days = 90;
	const after = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
	const cli = await requireStravaClient();
	if (!cli) return [];
	const list = await cli.activities.getLoggedInAthleteActivities({
		after,
		per_page: 200,
	});
	return list
		.filter((a) => a.type === "Run")
		.sort(
			(a, b) =>
				new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
		);
}

export async function fetchStats() {
	const cli = await requireStravaClient();
	const me = await cli.athletes.getLoggedInAthlete();
	const s = await cli.athletes.getStats({ id: me.id });

	return {
		miles: s.ytd_run_totals.distance,
		count: s.ytd_run_totals.count,
	};
}

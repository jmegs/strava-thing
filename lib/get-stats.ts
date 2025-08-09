import { requireStravaClient } from "./strava-client";

export async function getStats() {
	const strava = await requireStravaClient();
	const { id } = await strava.athletes.getLoggedInAthlete();
	const stats = await strava.athletes.getStats({ id });
	return {
		miles: stats.ytd_run_totals.distance,
		count: stats.ytd_run_totals.count,
	};
}

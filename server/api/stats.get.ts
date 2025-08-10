export default defineEventHandler(async (event) => {
	const cli = await requireStravaClient(event);
	const me = await cli.athletes.getLoggedInAthlete();
	const s = await cli.athletes.getStats({ id: me.id });

	return {
		miles: s.ytd_run_totals.distance,
		count: s.ytd_run_totals.count,
	};
});

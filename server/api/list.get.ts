export default defineEventHandler(async (event) => {
	const { days = 90 } = getQuery(event);
	const after = Math.floor(Date.now() / 1000) - Number(days) * 86400;

	const cli = await requireStravaClient(event);
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
});

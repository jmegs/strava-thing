export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id");
	const client = await requireStravaClient(event);
	const act = await client.activities.getActivityById({ id: Number(id) });

	const [lat, lng] = act.start_latlng;
	const isoUTC = act.start_date;

	const weather = await $fetch("/api/weather", {
		params: {
			lat,
			lng,
			isoUTC,
		},
	});

	return {
		name: act.name,
		strava_activity_id: act.id,
		date: act.start_date,
		date_local: act.start_date_local,
		distance_mi: round2Decimals(metersToMiles(act.distance)),
		moving_time_s: act.moving_time,
		elapsed_time_s: act.elapsed_time,
		avg_pace_s_per_mi: Math.round(
			act.moving_time / metersToMiles(act.distance),
		),
		avg_hr: Math.round(act.average_heartrate),
		cadence_spm: round2Decimals(act.average_cadence),
		max_hr: act.max_heartrate,
		elev_gain_ft: round2Decimals(metersToFeet(act.total_elevation_gain)),
		route_start_latlng: act.start_latlng,
		workout_type_tag: getWorkoutTypeTag(act.workout_type),
		splits: act.splits_standard.map((split) => ({
			split: split.split,
			distance_mi: round2Decimals(metersToMiles(split.distance)),
			moving_time_s: split.moving_time,
			pace_s: split.moving_time / metersToMiles(split.distance),
			avg_hr: Math.round(split.average_heartrate),
			elev_gain_ft: round2Decimals(metersToFeet(split.elevation_difference)),
		})),
		rpe: act.perceived_exertion || null,
		shoes: act.gear?.name,
		notes: act.description,
		weather,
	};
});

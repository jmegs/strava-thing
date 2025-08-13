import type { Lap, DetailedActivity } from "strava";

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
		avg_pace_min_per_mile: metersPerSecondToMinPerMile(act.average_speed),
		avg_hr: Math.round(act.average_heartrate),
		cadence_spm: round2Decimals(act.average_cadence * 2),
		max_hr: act.max_heartrate,
		elev_gain_ft: round2Decimals(metersToFeet(act.total_elevation_gain)),
		route_start_latlng: act.start_latlng,
		workout_type_tag: getWorkoutTypeTag(act.workout_type),
		splits: act.splits_standard.map((split) => ({
			split: split.split,
			distance_mi: round2Decimals(metersToMiles(split.distance)),
			moving_time_s: split.moving_time,
			pace_s: round2Decimals(split.moving_time / metersToMiles(split.distance)),
			pace_min_per_mile: metersPerSecondToMinPerMile(split.average_speed),
			avg_hr: Math.round(split.average_heartrate),
			elev_gain_ft: round2Decimals(metersToFeet(split.elevation_difference)),
		})),
		...(isWorkout(act) && { laps: buildLapArray(act) }),
		rpe: act.perceived_exertion || null,
		shoes: act.gear?.name,
		notes: act.description,
		weather,
	};
});

function isWorkout(act: DetailedActivity) {
	return getWorkoutTypeTag(act.workout_type) === "workout";
}

function buildLapArray(act: DetailedActivity) {
	if (!act.laps) return [];
	return act.laps.map((lap: Lap) => ({
		lap_index: lap.lap_index,
		split: lap.split,
		distance_mi: round2Decimals(metersToMiles(lap.distance)),
		moving_time: lap.moving_time,
		pace_s_per_mi: round2Decimals(
			lap.moving_time / metersToMiles(lap.distance),
		),
		pace_min_per_mile: metersPerSecondToMinPerMile(lap.average_speed),
		avg_hr: Math.round(lap.average_heartrate),
		max_hr: Math.round(lap.max_heartrate),
		elev_gain_ft: round2Decimals(metersToFeet(lap.total_elevation_gain)),
	}));
}

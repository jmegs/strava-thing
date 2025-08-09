"use server";

import { fetchWeatherAt } from "./get-weather";
import { getActivityById } from "./get-activity-by-id";

export async function copyRunJson(id: number) {
	const run = await getActivityById(id);
	const [lat, lon] = run.route_start_latlng;
	const weather = await fetchWeatherAt(lat, lon, run.date);
	return {
		...run,
		weather,
	};
}

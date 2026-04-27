import { env } from "cloudflare:workers"
import type { DetailedActivity } from "strava"
import type { WeatherData } from "@/shared/types"
import { getWeather } from "@/lib/weather/open-meteo"

function weatherKeyForRun(activityId: number) {
	return `weather:run:v1:${activityId}`
}

export async function getWeatherForActivity(
	activity: DetailedActivity,
): Promise<WeatherData | null> {
	const [lat, lng] = activity.start_latlng ?? [null, null]
	if (typeof lat !== "number" || typeof lng !== "number") return null

	const cached = await env.SESSIONS.get<WeatherData>(
		weatherKeyForRun(activity.id),
		"json",
	)
	if (cached) return cached

	const weather = await getWeather({ lat, lng, isoUTC: activity.start_date })
	await env.SESSIONS.put(weatherKeyForRun(activity.id), JSON.stringify(weather))
	return weather
}

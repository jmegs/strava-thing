import type { OpenMeteoResponse } from "@/shared/types"

export const getWeather = async (params: {
	lat: number
	lng: number
	isoUTC: string
}) => {
	const when = new Date(params.isoUTC)
	const y = when.getUTCFullYear()
	const m = String(when.getUTCMonth() + 1).padStart(2, "0")
	const d = String(when.getUTCDate()).padStart(2, "0")
	const dateStr = `${y}-${m}-${d}`
	const hourStr = `${String(params.isoUTC).slice(0, 13)}:00`

	const query = new URLSearchParams({
		latitude: String(params.lat),
		longitude: String(params.lng),
		hourly: "temperature_2m,dewpoint_2m,wind_speed_10m",
		temperature_unit: "fahrenheit",
		wind_speed_unit: "mph",
		timezone: "UTC",
		start_date: dateStr,
		end_date: dateStr,
	})

	const res: OpenMeteoResponse = await fetch(
		`https://api.open-meteo.com/v1/forecast?${query.toString()}`,
	).then((r) => r.json())

	const times: string[] = res?.hourly?.time ?? []
	const idx = times.indexOf(hourStr)
	if (idx === -1) return { temp_f: null, dewpoint_f: null, wind_mph: null }

	return {
		temp_f: num(res?.hourly?.temperature_2m[idx]),
		dewpoint_f: num(res?.hourly?.dewpoint_2m[idx]),
		wind_mph: num(res?.hourly?.wind_speed_10m[idx]),
	}
}

function num(x: unknown): number | null {
	const n = typeof x === "number" ? x : Number(x)
	return Number.isFinite(n) ? n : null
}

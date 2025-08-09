// lib/weather.ts
export type WeatherResponse = {
	temp_f: number | null;
	dewpoint_f: number | null;
	wind_mph: number | null;
};

/**
 * Fetch weather from Open-Meteo for the given location and UTC ISO8601 time.
 * No API key needed. Returns values in °F and mph.
 *
 * @param lat Latitude
 * @param lng Longitude
 * @param isoUTC ISO8601 timestamp in UTC (e.g., "2025-08-09T11:00:00Z")
 */
export async function fetchWeatherAt(
	lat: number,
	lng: number,
	isoUTC: string
): Promise<WeatherResponse> {
	// Validate inputs
	if (!lat || !lng || !isoUTC) {
		console.error("Invalid inputs:", { lat, lng, isoUTC });
		throw new Error("Invalid latitude, longitude, or date");
	}

	const when = new Date(isoUTC);
	if (isNaN(when.getTime())) {
		console.error("Invalid date:", isoUTC);
		throw new Error("Invalid date format");
	}

	const y = when.getUTCFullYear();
	const m = String(when.getUTCMonth() + 1).padStart(2, "0");
	const d = String(when.getUTCDate()).padStart(2, "0");
	const dateStr = `${y}-${m}-${d}`;
	const hourStr = isoUTC.slice(0, 13) + ":00";

	const params = new URLSearchParams({
		latitude: String(lat),
		longitude: String(lng),
		hourly: "temperature_2m,dewpoint_2m,wind_speed_10m",
		temperature_unit: "fahrenheit",
		wind_speed_unit: "mph",
		timezone: "UTC",
		start_date: dateStr,
		end_date: dateStr,
	});

	const url = `https://api.open-meteo.com/v1/forecast?${params}`;

	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) {
		console.error("Weather API Error:", res.status, res.statusText);
		console.error("Request URL:", url);
		throw new Error(`Open-Meteo ${res.status} ${res.statusText}`);
	}

	const data = await res.json();
	const times: string[] = data?.hourly?.time ?? [];
	const idx = times.indexOf(hourStr);
	if (idx === -1) return { temp_f: null, dewpoint_f: null, wind_mph: null };

	return {
		temp_f: num(data?.hourly?.temperature_2m?.[idx]),
		dewpoint_f: num(data?.hourly?.dewpoint_2m?.[idx]),
		wind_mph: num(data?.hourly?.wind_speed_10m?.[idx]),
	};
}

function num(x: unknown): number | null {
	const n = typeof x === "number" ? x : Number(x);
	return Number.isFinite(n) ? n : null;
}

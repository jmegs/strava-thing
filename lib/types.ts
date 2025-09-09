// Open-Meteo API Response Types

export interface OpenMeteoHourlyUnits {
	time: string;
	temperature_2m: string;
	dewpoint_2m: string;
	wind_speed_10m: string;
}

export interface OpenMeteoHourlyData {
	time: string[];
	temperature_2m: number[];
	dewpoint_2m: number[];
	wind_speed_10m: number[];
}

export interface OpenMeteoResponse {
	latitude: number;
	longitude: number;
	generationtime_ms: number;
	utc_offset_seconds: number;
	timezone: string;
	timezone_abbreviation: string;
	elevation: number;
	hourly_units: OpenMeteoHourlyUnits;
	hourly: OpenMeteoHourlyData;
}

export interface SessionData {
	athleteId: number
	accessToken: string
	expiresAt: number
	refreshToken: string
}

export interface WeatherData {
	temp_f: number | null
	dewpoint_f: number | null
	wind_mph: number | null
}

export interface OpenMeteoResponse {
	hourly: {
		time: string[]
		temperature_2m: number[]
		dewpoint_2m: number[]
		wind_speed_10m: number[]
	}
}

export interface RunSummary {
	id: number
	name: string
	startDate: string
	distance: number
	movingTime: number
	averageHeartrate: number | null
	workoutType: number | null
	summaryPolyline: string
}

export interface RunPage {
	runs: RunSummary[]
	nextBefore: number | null
}

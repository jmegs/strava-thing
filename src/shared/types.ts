export interface SessionData {
	athleteId: number
	accessToken: string
	expiresAt: number
	refreshToken: string
}

export interface OpenMeteoResponse {
	hourly: {
		time: string[]
		temperature_2m: number[]
		dewpoint_2m: number[]
		wind_speed_10m: number[]
	}
}

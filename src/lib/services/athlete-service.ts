import { createStravaClientForAthlete } from "@/lib/strava"

export async function getCurrentAthlete(athleteId: number) {
	try {
		const strava = await createStravaClientForAthlete(athleteId)
		const athlete = await strava.athletes.getLoggedInAthlete()
		return {
			athlete_id: athlete.id,
			firstname: athlete.firstname ?? null,
			lastname: athlete.lastname ?? null,
			city: athlete.city ?? null,
			state: athlete.state ?? null,
			country: athlete.country ?? null,
		}
	} catch {
		return { athlete_id: athleteId }
	}
}

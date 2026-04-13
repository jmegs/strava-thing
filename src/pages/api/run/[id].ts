import type { APIRoute } from "astro"
import { z } from "zod"
import type { SessionData } from "../../../shared/types"
import { createStravaClient } from "../../../lib/strava"
import { getWeather } from "../../../lib/weather"
import { formatRunDetail } from "../../../shared/format"

export const GET: APIRoute = async ({ params, session }) => {
	const auth = (await session!.get("auth")) as SessionData | null
	if (!auth) {
		return new Response("Unauthorized", { status: 401 })
	}

	const schema = z.object({ id: z.coerce.number() })
	const parsed = schema.safeParse(params)
	if (!parsed.success) {
		return Response.json({ error: "Invalid ID" }, { status: 400 })
	}

	const strava = createStravaClient(auth, session!)

	let act
	try {
		act = await strava.activities.getActivityById({ id: parsed.data.id })
	} catch {
		return Response.json({ error: "Activity not found" }, { status: 404 })
	}

	const [lat, lng] = act.start_latlng ?? [null, null]
	const isoUTC = act.start_date
	const weather = lat && lng ? await getWeather({ lat, lng, isoUTC }) : null

	return Response.json(formatRunDetail(act, weather))
}

import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { formatRunDetail } from "@/shared/format"
import { getWeather } from "@/server/weather"
import {
	readSession,
	sessionNeedsRefresh,
	writeSession,
} from "@/server/session"
import {
	createStravaClient,
	refreshStravaSession,
} from "@/server/strava"

const paramsSchema = z.object({ id: z.coerce.number().int().positive() })

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	let session = await readSession()
	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 })
	}

	let refreshed = false
	if (sessionNeedsRefresh(session)) {
		try {
			session = await refreshStravaSession(session)
			refreshed = true
		} catch {
			return Response.json({ error: "Unauthorized" }, { status: 401 })
		}
	}

	const parsed = paramsSchema.safeParse(await params)
	if (!parsed.success) {
		return Response.json({ error: "Invalid ID" }, { status: 400 })
	}

	let activity
	try {
		activity = await createStravaClient(
			session,
		).activities.getActivityById({ id: parsed.data.id })
	} catch {
		return Response.json({ error: "Activity not found" }, { status: 404 })
	}

	const [lat, lng] = activity.start_latlng ?? [null, null]
	const weather =
		lat != null && lng != null
			? await getWeather({
					lat,
					lng,
					isoUTC: activity.start_date,
				})
			: null

	if (refreshed) {
		await writeSession(session)
	}
	return NextResponse.json(formatRunDetail(activity, weather))
}

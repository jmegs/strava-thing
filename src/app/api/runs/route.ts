import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { fetchOlderRuns } from "@/server/runs"
import {
	readSession,
	sessionNeedsRefresh,
	writeSession,
} from "@/server/session"
import {
	createStravaClient,
	refreshStravaSession,
} from "@/server/strava"

const querySchema = z.object({
	before: z.coerce.number().int().positive(),
})

export async function GET(request: NextRequest) {
	let session = await readSession()
	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 })
	}

	if (sessionNeedsRefresh(session)) {
		try {
			session = await refreshStravaSession(session)
			await writeSession(session)
		} catch {
			return Response.json({ error: "Unauthorized" }, { status: 401 })
		}
	}

	const parsed = querySchema.safeParse({
		before: request.nextUrl.searchParams.get("before"),
	})
	if (!parsed.success) {
		return Response.json({ error: "Invalid cursor" }, { status: 400 })
	}

	const page = await fetchOlderRuns(
		createStravaClient(session),
		parsed.data.before,
	)
	return NextResponse.json(page)
}

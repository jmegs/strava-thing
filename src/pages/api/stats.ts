import type { APIRoute } from "astro"
import { requireApiAuth } from "@/lib/auth/require-api-auth"
import { getStatsForAthlete } from "@/lib/services/stats-service"

function parseWindows(value: string | null) {
	if (!value) return [7, 28]
	const windows = value
		.split(",")
		.map((window) => Number.parseInt(window.trim(), 10))
		.filter((window) => Number.isFinite(window) && window > 0)
	return windows.length > 0 ? windows : [7, 28]
}

export const GET: APIRoute = async ({ request, session }) => {
	const auth = await requireApiAuth(request, session)
	if (!auth.ok) return auth.response

	const url = new URL(request.url)
	const stats = await getStatsForAthlete(
		auth.principal.athleteId,
		parseWindows(url.searchParams.get("windows")),
	)

	return Response.json({ data: stats })
}

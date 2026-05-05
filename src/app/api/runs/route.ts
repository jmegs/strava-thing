import { requireApiAuth } from "@/lib/auth/require-api-auth"
import {
	listRunsForAthlete,
	parsePositiveInt,
} from "@/lib/services/runs-service"

export async function GET(request: Request) {
	const auth = await requireApiAuth(request)
	if (!auth.ok) return auth.response

	const url = new URL(request.url)
	const limit = parsePositiveInt(url.searchParams.get("limit"), 20, 100)
	const page = parsePositiveInt(url.searchParams.get("page"), 1)

	const result = await listRunsForAthlete(auth.principal.athleteId, {
		limit,
		page,
		after: url.searchParams.get("after"),
		before: url.searchParams.get("before"),
	})

	return Response.json({
		data: result.runs,
		meta: { limit: result.limit, page: result.page },
	})
}

import type { APIRoute } from "astro"
import { requireApiAuth } from "@/lib/auth/require-api-auth"
import { getCurrentAthlete } from "@/lib/services/athlete-service"

export const GET: APIRoute = async ({ request, session }) => {
	const auth = await requireApiAuth(request, session)
	if (!auth.ok) return auth.response

	const athlete = await getCurrentAthlete(auth.principal.athleteId)
	return Response.json({ data: athlete })
}

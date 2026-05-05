import { requireApiAuth } from "@/lib/auth/require-api-auth"
import { getCurrentAthlete } from "@/lib/services/athlete-service"

export async function GET(request: Request) {
	const auth = await requireApiAuth(request)
	if (!auth.ok) return auth.response

	const athlete = await getCurrentAthlete(auth.principal.athleteId)
	return Response.json({ data: athlete })
}

import type { APIRoute } from "astro"
import { z } from "zod"
import { deleteApiTokenForAthlete } from "@/lib/auth/api-tokens"
import { requireSessionAuth } from "@/lib/auth/require-api-auth"

export const DELETE: APIRoute = async ({ session, params }) => {
	const auth = await requireSessionAuth(session)
	if (!auth.ok) return auth.response

	const parsed = z.object({ id: z.string().min(1) }).safeParse(params)
	if (!parsed.success) {
		return Response.json({ error: "Invalid token_id" }, { status: 400 })
	}

	const deleted = await deleteApiTokenForAthlete(
		auth.principal.athleteId,
		parsed.data.id,
	)

	if (!deleted) return Response.json({ error: "Token not found" }, { status: 404 })
	return new Response(null, { status: 204 })
}

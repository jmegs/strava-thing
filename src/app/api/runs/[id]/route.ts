import { z } from "zod"
import { requireApiAuth } from "@/lib/auth/require-api-auth"
import { getRunDetailForAthlete } from "@/lib/services/runs-service"

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireApiAuth(request)
	if (!auth.ok) return auth.response

	const parsed = z
		.object({ id: z.coerce.number().int().positive() })
		.safeParse(await params)
	if (!parsed.success) {
		return Response.json({ error: "Invalid run_id" }, { status: 400 })
	}

	try {
		const run = await getRunDetailForAthlete(
			auth.principal.athleteId,
			parsed.data.id,
		)
		if (!run) return Response.json({ error: "Run not found" }, { status: 404 })
		return Response.json({ data: run })
	} catch {
		return Response.json({ error: "Run not found" }, { status: 404 })
	}
}

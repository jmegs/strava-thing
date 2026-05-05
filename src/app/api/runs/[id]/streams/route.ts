import { z } from "zod"
import { requireApiAuth } from "@/lib/auth/require-api-auth"
import {
	getRunStreamsForAthlete,
	parseStreamKeys,
	validateStreamKeys,
} from "@/lib/services/runs-service"

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

	const url = new URL(request.url)
	const keys = parseStreamKeys(url.searchParams.get("keys"))
	const validKeys = validateStreamKeys(keys)
	if (!validKeys.success) {
		return Response.json({ error: "Invalid stream keys" }, { status: 400 })
	}

	try {
		const streams = await getRunStreamsForAthlete(
			auth.principal.athleteId,
			parsed.data.id,
			validKeys.data,
		)
		return Response.json({ data: streams })
	} catch {
		return Response.json({ error: "Run streams not found" }, { status: 404 })
	}
}

import { z } from "zod"
import {
	createApiToken,
	listApiTokensForAthlete,
	toPublicApiToken,
} from "@/lib/auth/api-tokens"
import { requireSessionAuth } from "@/lib/auth/require-api-auth"

export async function GET() {
	const auth = await requireSessionAuth()
	if (!auth.ok) return auth.response

	const tokens = await listApiTokensForAthlete(auth.principal.athleteId)
	return Response.json({ data: tokens.map(toPublicApiToken) })
}

export async function POST(request: Request) {
	const auth = await requireSessionAuth()
	if (!auth.ok) return auth.response

	const schema = z.object({
		name: z.string().trim().min(1).max(80),
		expiresAt: z.iso.datetime().nullable().optional(),
	})

	const parsed = schema.safeParse(await request.json().catch(() => null))
	if (!parsed.success) {
		return Response.json({ error: "Invalid token request" }, { status: 400 })
	}

	const { token, rawToken } = await createApiToken({
		athleteId: auth.principal.athleteId,
		name: parsed.data.name,
		expiresAt: parsed.data.expiresAt ?? null,
	})

	return Response.json(
		{
			data: {
				...toPublicApiToken(token),
				token: rawToken,
			},
		},
		{ status: 201 },
	)
}

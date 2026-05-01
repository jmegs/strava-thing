import { getEnv } from "@/lib/cf"

export async function GET(request: Request) {
	const env = await getEnv()
	const origin = new URL(request.url).origin
	const params = new URLSearchParams({
		client_id: env.STRAVA_CLIENT_ID,
		redirect_uri: `${origin}/auth/callback`,
		response_type: "code",
		scope: "read,activity:read_all",
	})

	return Response.redirect(
		`https://www.strava.com/oauth/authorize?${params}`,
		302,
	)
}

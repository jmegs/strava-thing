import type { APIRoute } from "astro"
import { env } from "cloudflare:workers"

export const GET: APIRoute = async ({ request }) => {
	const origin = new URL(request.url).origin
	const params = new URLSearchParams({
		client_id: env.STRAVA_CLIENT_ID,
		redirect_uri: `${origin}/auth/callback`,
		response_type: "code",
		scope: "read,activity:read_all",
	})

	return new Response(null, {
		status: 302,
		headers: {
			Location: `https://www.strava.com/oauth/authorize?${params}`,
		},
	})
}

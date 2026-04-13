import type { APIRoute } from "astro"
import { env } from "cloudflare:workers"
import { THIRTY_DAYS, MCP_TOKENS_KEY } from "../../lib/session"

export const GET: APIRoute = async ({ request, session }) => {
	const url = new URL(request.url)
	const code = url.searchParams.get("code")

	if (!code) {
		return new Response(null, {
			status: 302,
			headers: { Location: "/login" },
		})
	}

	try {
		const tokenRes = await fetch("https://www.strava.com/oauth/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				client_id: env.STRAVA_CLIENT_ID,
				client_secret: env.STRAVA_CLIENT_SECRET,
				code,
				grant_type: "authorization_code",
			}),
		})

		if (!tokenRes.ok) {
			console.error("Strava token exchange failed:", await tokenRes.text())
			return new Response(null, {
				status: 302,
				headers: { Location: "/login" },
			})
		}

		const tokens = (await tokenRes.json()) as {
			athlete: { id: number }
			access_token: string
			expires_at: number
			refresh_token: string
		}

		const authData = {
			athleteId: tokens.athlete.id,
			accessToken: tokens.access_token,
			expiresAt: tokens.expires_at,
			refreshToken: tokens.refresh_token,
		}

		session!.set("auth", authData)

		// Also store tokens for MCP access (separate from user session)
		await env.SESSIONS.put(MCP_TOKENS_KEY, JSON.stringify(authData), {
			expirationTtl: THIRTY_DAYS,
		})

		return new Response(null, {
			status: 302,
			headers: { Location: "/" },
		})
	} catch (e) {
		console.error("Strava OAuth error:", e)
		return new Response(null, {
			status: 302,
			headers: { Location: "/login" },
		})
	}
}

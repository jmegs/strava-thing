import { getEnv } from "@/lib/cf"
import { saveStravaTokens } from "@/lib/auth/strava-tokens"
import { setSession } from "@/lib/session"

export async function GET(request: Request) {
	const url = new URL(request.url)
	const code = url.searchParams.get("code")

	if (!code) {
		return Response.redirect(new URL("/login", request.url), 302)
	}

	try {
		const env = await getEnv()
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
			return Response.redirect(new URL("/login", request.url), 302)
		}

		const tokens = (await tokenRes.json()) as {
			athlete: { id: number }
			access_token: string
			expires_at: number
			refresh_token: string
		}

		await saveStravaTokens(tokens.athlete.id, {
			athleteId: tokens.athlete.id,
			accessToken: tokens.access_token,
			expiresAt: tokens.expires_at,
			refreshToken: tokens.refresh_token,
		})

		await setSession({ athleteId: tokens.athlete.id })

		return Response.redirect(new URL("/", request.url), 302)
	} catch (e) {
		console.error("Strava OAuth error:", e)
		return Response.redirect(new URL("/login", request.url), 302)
	}
}

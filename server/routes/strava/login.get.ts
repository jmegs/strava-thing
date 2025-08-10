// server/api/strava/login.get.ts
import { defineEventHandler, getRequestURL, sendRedirect } from "h3";

export default defineEventHandler((event) => {
	const { origin } = getRequestURL(event); // ← current host
	const {
		public: { stravaClientId },
	} = useRuntimeConfig(event);

	const redirectUri = new URL("/strava/callback", origin).href;
	const authUrl =
		`https://www.strava.com/oauth/authorize?client_id=${stravaClientId}` +
		`&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}` +
		`&scope=read,activity:read_all&approval_prompt=force`;

	return sendRedirect(event, authUrl);
});

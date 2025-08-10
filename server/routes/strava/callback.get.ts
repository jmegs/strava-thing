export default defineEventHandler(async (event) => {
	const { code } = getQuery(event);

	if (!code) {
		throw createError({ statusCode: 400, statusMessage: "Missing code" });
	}

	const res = await $fetch<any>("https://www.strava.com/oauth/token", {
		method: "POST",
		query: {
			client_id: useRuntimeConfig().public.stravaClientId,
			client_secret: useRuntimeConfig().stravaClientSecret,
			code,
			grant_type: "authorization_code",
		},
	});

	setCookie(event, "strava_refresh_token", res.refresh_token, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24 * 365,
	});

	return sendRedirect(event, "/");
});

export default defineEventHandler((event) => {
	const { pathname } = getRequestURL(event);

	// http-only cookie set after OAuth callback
	const token = getCookie(event, "strava_refresh_token");

	// allow public paths
	if (pathname.startsWith("/strava") || pathname.startsWith("/api")) return;

	if (pathname.startsWith("/login")) {
		if (!token) return;
		sendRedirect(event, "/");
	}

	if (!token) {
		// 302 on SSR, works for SPA nav too
		return sendRedirect(event, "/login");
	}
});

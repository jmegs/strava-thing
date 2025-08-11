export default defineEventHandler((event) => {
	const { pathname } = getRequestURL(event);

	// allow public paths
	if (pathname.startsWith("/login") || pathname.startsWith("/strava")) return;

	// http-only cookie set after OAuth callback
	const token = getCookie(event, "strava_refresh_token");

	if (!token) {
		// 302 on SSR, works for SPA nav too
		return sendRedirect(event, "/login");
	}
});

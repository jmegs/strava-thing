export default defineNuxtRouteMiddleware(() => {
	const token = useCookie("strava_refresh_token");
	if (!token.value) {
		return navigateTo("/login");
	}
});

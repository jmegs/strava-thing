import { defineMiddleware } from "astro:middleware"

export const onRequest = defineMiddleware(async (context, next) => {
	const path = new URL(context.request.url).pathname

	if (
		path.startsWith("/auth/") ||
		path.startsWith("/api/") ||
		path === "/openapi.json"
	) {
		return next()
	}

	const auth = await context.session!.get("auth")

	if (path === "/login" && auth) {
		return context.redirect("/")
	}
	if (path !== "/login" && !auth) {
		return context.redirect("/login")
	}

	return next()
})

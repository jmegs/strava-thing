import { defineMiddleware } from "astro:middleware"

export const onRequest = defineMiddleware(async (context, next) => {
	const path = new URL(context.request.url).pathname

	// Skip session loading for MCP (has its own auth) and auth routes
	if (path === "/mcp" || path.startsWith("/auth/")) {
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

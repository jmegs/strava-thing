import { defineMiddleware, sequence } from "astro:middleware"

const securityHeaders = defineMiddleware(async (_context, next) => {
	const response = await next()

	if (!import.meta.env.DEV) {
		response.headers.set(
			"Strict-Transport-Security",
			"max-age=63072000; includeSubDomains; preload",
		)
	}

	response.headers.set("X-Content-Type-Options", "nosniff")
	response.headers.set("Referrer-Policy", "no-referrer")
	response.headers.set(
		"Permissions-Policy",
		"geolocation=(), microphone=(), camera=()",
	)
	response.headers.set(
		"Content-Security-Policy",
		"default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'self'; frame-src 'self' https://challenges.cloudflare.com; connect-src 'self'; object-src 'none';",
	)

	return response
})

const auth = defineMiddleware(async (context, next) => {
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

export const onRequest = sequence(securityHeaders, auth)

import type { NextConfig } from "next"

const securityHeaders = [
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "no-referrer" },
	{
		key: "Permissions-Policy",
		value: "geolocation=(), microphone=(), camera=()",
	},
]

const nextConfig: NextConfig = {
	cacheComponents: true,
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: securityHeaders,
			},
		]
	},
}

export default nextConfig

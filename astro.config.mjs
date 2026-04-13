import { defineConfig } from "astro/config"
import cloudflare from "@astrojs/cloudflare"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
	output: "server",
	adapter: cloudflare({
		sessionKVBindingName: "SESSIONS",
	}),
	integrations: [react()],
	session: {
		cookie: {
			name: "session",
			httpOnly: true,
			secure: true,
			sameSite: "lax",
		},
		ttl: 30 * 24 * 60 * 60,
	},
	vite: {
		plugins: [tailwindcss()],
	},
})

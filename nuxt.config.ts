import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },

	modules: ["@nuxt/fonts", "@vueuse/nuxt"],

	css: ["~/assets/css/main.css"],

	app: {
		head: {
			title: "STR-01 Strava Tool",
			meta: [{ name: "description", content: "pull strava data for LLMs" }],
		},
	},

	runtimeConfig: {
		public: {
			stravaClientId: "",
		},
		stravaClientSecret: "",
		stravaRefreshToken: "",
	},

	vite: {
		plugins: [tailwindcss()],
	},
});

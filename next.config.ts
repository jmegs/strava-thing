import type { NextConfig } from "next"
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
	cacheComponents: true,
	reactStrictMode: true,
}

export default nextConfig

import type { APIRoute } from "astro"
import { handleMcp, CORS_HEADERS } from "../lib/mcp"

export const POST: APIRoute = async ({ request }) => {
	return handleMcp(request)
}

export const OPTIONS: APIRoute = async () => {
	return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export const GET: APIRoute = async () => {
	return new Response("Method Not Allowed", { status: 405, headers: CORS_HEADERS })
}

export const DELETE: APIRoute = async () => {
	return new Response(null, { status: 202, headers: CORS_HEADERS })
}

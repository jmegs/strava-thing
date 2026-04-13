import type { APIRoute } from "astro"
import { handleMcp } from "../lib/mcp"

export const POST: APIRoute = async ({ request }) => {
	return handleMcp(request)
}

export const OPTIONS: APIRoute = async () => {
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, mcp-session-id",
			"Access-Control-Expose-Headers": "mcp-session-id",
		},
	})
}

export const GET: APIRoute = async () => {
	return new Response("Method Not Allowed", {
		status: 405,
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

export const DELETE: APIRoute = async () => {
	return new Response(null, {
		status: 202,
		headers: { "Access-Control-Allow-Origin": "*" },
	})
}

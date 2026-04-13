// Session constants — the session store itself is handled by Astro's session API.
// These are only needed for the MCP token KV storage which is separate from user sessions.

export const THIRTY_DAYS = 30 * 24 * 60 * 60
export const MCP_TOKENS_KEY = "mcp-tokens"

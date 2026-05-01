import { getEnv } from "@/lib/cf"

const API_TOKEN_PREFIX = "st_run_live_"
const API_TOKEN_KEY_PREFIX = "api-token:"
const TOKEN_ID_PREFIX = "tok_"

export interface StoredApiToken {
	id: string
	athleteId: number
	name: string
	scopes: string[]
	createdAt: string
	lastUsedAt?: string
	expiresAt?: string | null
}

export interface PublicApiToken {
	id: string
	name: string
	scopes: string[]
	createdAt: string
	lastUsedAt?: string
	expiresAt?: string | null
}

function bytesToHex(bytes: Uint8Array) {
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

function randomBase64Url(byteLength: number) {
	const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
	const binary = String.fromCharCode(...bytes)
	return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
}

export async function sha256Hex(value: string) {
	const bytes = new TextEncoder().encode(value)
	const digest = await crypto.subtle.digest("SHA-256", bytes)
	return bytesToHex(new Uint8Array(digest))
}

export function apiTokenKeyFromHash(hash: string) {
	return `${API_TOKEN_KEY_PREFIX}${hash}`
}

export async function hashApiToken(rawToken: string) {
	return sha256Hex(rawToken)
}

export function createRawApiToken() {
	return `${API_TOKEN_PREFIX}${randomBase64Url(32)}`
}

export function createTokenId() {
	return `${TOKEN_ID_PREFIX}${randomBase64Url(12)}`
}

export function isApiTokenFormat(rawToken: string) {
	return rawToken.startsWith(API_TOKEN_PREFIX)
}

export function toPublicApiToken(token: StoredApiToken): PublicApiToken {
	return {
		id: token.id,
		name: token.name,
		scopes: token.scopes,
		createdAt: token.createdAt,
		lastUsedAt: token.lastUsedAt,
		expiresAt: token.expiresAt ?? null,
	}
}

export function isTokenExpired(token: StoredApiToken, now = new Date()) {
	return Boolean(token.expiresAt && new Date(token.expiresAt) <= now)
}

export async function loadApiTokenByRawToken(rawToken: string) {
	if (!isApiTokenFormat(rawToken)) return null
	const hash = await hashApiToken(rawToken)
	const key = apiTokenKeyFromHash(hash)
	const env = await getEnv()
	const token = await env.SESSIONS.get<StoredApiToken>(key, "json")
	return token ? { token, key } : null
}

export async function updateApiToken(key: string, token: StoredApiToken) {
	const env = await getEnv()
	await env.SESSIONS.put(key, JSON.stringify(token))
}

export async function createApiToken(params: {
	athleteId: number
	name: string
	expiresAt?: string | null
	scopes?: string[]
}) {
	const rawToken = createRawApiToken()
	const hash = await hashApiToken(rawToken)
	const token: StoredApiToken = {
		id: createTokenId(),
		athleteId: params.athleteId,
		name: params.name,
		scopes: params.scopes ?? ["runs:read"],
		createdAt: new Date().toISOString(),
		expiresAt: params.expiresAt ?? null,
	}

	const env = await getEnv()
	await env.SESSIONS.put(apiTokenKeyFromHash(hash), JSON.stringify(token))
	return { token, rawToken }
}

export async function listApiTokensForAthlete(athleteId: number) {
	const env = await getEnv()
	const tokens: StoredApiToken[] = []
	let cursor: string | undefined

	do {
		const list = await env.SESSIONS.list({ prefix: API_TOKEN_KEY_PREFIX, cursor })
		for (const key of list.keys) {
			const token = await env.SESSIONS.get<StoredApiToken>(key.name, "json")
			if (token?.athleteId === athleteId && !isTokenExpired(token)) {
				tokens.push(token)
			}
		}
		cursor = list.list_complete ? undefined : list.cursor
	} while (cursor)

	return tokens.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function deleteApiTokenForAthlete(
	athleteId: number,
	tokenId: string,
) {
	const env = await getEnv()
	let cursor: string | undefined

	do {
		const list = await env.SESSIONS.list({ prefix: API_TOKEN_KEY_PREFIX, cursor })
		for (const key of list.keys) {
			const token = await env.SESSIONS.get<StoredApiToken>(key.name, "json")
			if (token?.athleteId === athleteId && token.id === tokenId) {
				await env.SESSIONS.delete(key.name)
				return true
			}
		}
		cursor = list.list_complete ? undefined : list.cursor
	} while (cursor)

	return false
}

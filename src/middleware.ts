import { NextResponse, type NextRequest } from "next/server"

const SESSION_COOKIE = "session"

export function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname

	if (
		path.startsWith("/auth/") ||
		path.startsWith("/api/") ||
		path === "/openapi.json"
	) {
		return NextResponse.next()
	}

	const authed = request.cookies.has(SESSION_COOKIE)

	if (path === "/login" && authed) {
		return NextResponse.redirect(new URL("/", request.url))
	}
	if (path !== "/login" && !authed) {
		return NextResponse.redirect(new URL("/login", request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|TX-02.woff2|.*\\..*).*)"],
}

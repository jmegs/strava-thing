import { Suspense } from "react"
import { redirect } from "next/navigation"

import { readSession } from "@/server/session"

export default function LoginPage() {
	return (
		<Suspense fallback={<LoginContent />}>
			<AuthenticatedLoginPage />
		</Suspense>
	)
}

async function AuthenticatedLoginPage() {
	if (await readSession()) {
		redirect("/")
	}

	return <LoginContent />
}

function LoginContent() {
	return (
		<div className="p-10">
			<p>STR-01 Strava Analysis</p>
			<a href="/auth/strava" className="underline">
				Log in
			</a>
		</div>
	)
}

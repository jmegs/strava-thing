import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"

import { AppSkeleton } from "@/app/components/AppSkeleton"
import { RunList } from "@/app/components/RunList"
import { StatHeader } from "@/app/components/StatHeader"
import { fetchInitialActivities } from "@/server/runs"
import { readSession, sessionNeedsRefresh } from "@/server/session"
import { createStravaClient } from "@/server/strava"

export default function HomePage() {
	return (
		<Suspense fallback={<AppSkeleton />}>
			<Dashboard />
		</Suspense>
	)
}

async function Dashboard() {
	await connection()

	const session = await readSession()

	if (!session) {
		redirect("/login")
	}

	if (sessionNeedsRefresh(session)) {
		redirect("/auth/strava/refresh?next=/")
	}

	const { runActivities, runs, nextBefore } = await fetchInitialActivities(
		createStravaClient(session),
	)

	return (
		<main>
			<StatHeader runs={runActivities} />
			<RunList initialRuns={runs} initialBefore={nextBefore} />
		</main>
	)
}

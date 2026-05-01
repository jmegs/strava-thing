import { Suspense } from "react"
import { RunList } from "@/components/RunList"
import { StatHeader } from "@/components/StatHeader"
import {
	RunListSkeleton,
	StatsHeaderSkeleton,
} from "@/components/AppSkeleton"
import { getSession } from "@/lib/session"
import { listRunsForAthlete } from "@/lib/services/runs-service"
import { getStatsForAthlete } from "@/lib/services/stats-service"

export default function HomePage() {
	return (
		<main>
			<Suspense fallback={<StatsHeaderSkeleton />}>
				<StatsSection />
			</Suspense>
			<Suspense fallback={<RunListSkeleton />}>
				<RunsSection />
			</Suspense>
		</main>
	)
}

async function StatsSection() {
	const auth = await getSession()
	if (!auth) return null
	try {
		const stats = await getStatsForAthlete(auth.athleteId)
		return <StatHeader stats={stats.windows} />
	} catch (e) {
		console.error("Failed to fetch stats:", e)
		return null
	}
}

async function RunsSection() {
	const auth = await getSession()
	if (!auth) return null
	try {
		const result = await listRunsForAthlete(auth.athleteId, { limit: 100 })
		if (result.runs.length === 0) return <RunsEmpty />
		return <RunList runs={result.runs} />
	} catch (e) {
		console.error("Failed to fetch runs:", e)
		return <RunsEmpty />
	}
}

function RunsEmpty() {
	return (
		<div className="p-8 text-center">
			<p>Could not load runs. Strava may be down, or your session may have expired.</p>
			<a href="/auth/strava" className="underline mt-2 inline-block">
				Re-authenticate
			</a>
		</div>
	)
}

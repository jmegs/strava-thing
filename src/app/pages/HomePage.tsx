import { Suspense } from "react"
import type { AppContext } from "@/worker"
import type { SessionData } from "@/shared/types"
import { createStravaClient } from "@/server/strava"
import { fetchRecentRuns } from "@/server/runs"
import { StatHeader } from "@/app/components/StatHeader"
import { RunList } from "@/app/components/RunList"
import { AppSkeleton } from "@/app/components/AppSkeleton"

export function HomePage({ ctx }: { ctx: AppContext }) {
	return (
		<Suspense fallback={<AppSkeleton />}>
			<Dashboard session={ctx.session!} />
		</Suspense>
	)
}

async function Dashboard({ session }: { session: SessionData }) {
	const strava = createStravaClient(session)
	const runs = await fetchRecentRuns(strava)

	return (
		<>
			<StatHeader runs={runs} />
			<RunList runs={runs} />
		</>
	)
}

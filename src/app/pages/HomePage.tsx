import { Suspense } from "react"
import type { SummaryActivity } from "strava"
import type { AppContext } from "@/worker"
import type { SessionData } from "@/shared/types"
import { createStravaClient } from "@/server/strava"
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
	const after = Math.floor(Date.now() / 1000) - 90 * 86400
	const list: SummaryActivity[] =
		await strava.activities.getLoggedInAthleteActivities({
			after,
			per_page: 200,
		})
	const runs = list
		.filter((a) => a.type === "Run")
		.sort((a, b) => b.start_date.localeCompare(a.start_date))

	return (
		<>
			<StatHeader runs={runs} />
			<RunList runs={runs} />
		</>
	)
}

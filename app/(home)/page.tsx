/** biome-ignore-all lint/suspicious/noArrayIndexKey: skeleton list item */
import { cookies } from "next/headers";	
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { fetchRuns, fetchStats } from "@/lib/data";
import {
	getWorkoutTypeTag,
	metersToMiles,
	secondsToHMS,
} from "@/lib/formatters";
import { CopyRun } from "./copy-run";
import Polyline from "./polyline";

export const experimental_ppr = true;

export default async function Home() {
	const cookieStore = await cookies();
	const loggedIn = cookieStore.get("strava_refresh_token")?.value;

	if (!loggedIn) {
		redirect("/login");
	}

	const [runs, stats] = await Promise.all([fetchRuns(), fetchStats()]);

	return (
		<main className="py-3 font-mono text-xs">
			<header className="md:grid grid-cols-12 px-2 md:px-8">
				<p className="col-span-4 md:col-span-8 mb-2 md:mb-0 uppercase tracking-wider">
					anima sana in corpore sano
				</p>
				<p className="col-span-2 md:text-right">
					{metersToMiles(stats?.miles || 0).toFixed(2)} mi
				</p>
				<p className="col-span-2 md:text-right">{stats?.count || 0} runs</p>
			</header>
			<Suspense fallback={<SkeletonList />}>
				{/* <SkeletonList /> */}
				<ul className="divide-y border-t mt-[50svh]">
					{runs.map((run) => (
						<li
							key={run.id}
							className="grid grid-cols-[3fr_1fr_auto] md:grid-cols-12 px-2 md:px-8 py-1 items-center"
						>
							<Polyline
								summary={run.map.summary_polyline}
								className="hidden md:block col-span-1"
							/>
							<p className="md:col-span-3 pr-2 md:pr-0">
								<span>{run.name}</span>
								{getWorkoutTypeTag(run.workout_type) && (
									<span className="ml-2 px-1 py-0.5 text-[9px] uppercase tracking-wide border">
										{getWorkoutTypeTag(run.workout_type)}
									</span>
								)}
							</p>
							<p className="hidden md:block col-span-2 md:text-right">
								{new Date(run.start_date_local).toISOString().split("T")[0]}
							</p>
							<p className="md:col-span-2 md:text-right">
								{metersToMiles(run.distance).toFixed(2)}mi
							</p>
							<p className="hidden md:block col-span-2 text-right">
								{secondsToHMS(run.moving_time)}
							</p>
							<div className="md:col-span-2 text-right">
								<CopyRun activityId={run.id} />
							</div>
						</li>
					))}
				</ul>
			</Suspense>
		</main>
	);
}

function SkeletonList() {
	return (
		<ul className="divide-y border-t mt-[50svh]">
			{Array.from({ length: 10 }).map((_, index) => (
				<SkeletonListItem key={`skeleton-${index}`} />
			))}
		</ul>
	);
}

function SkeletonListItem() {
	return (
		<li className="grid grid-cols-[3fr_1fr_auto] md:grid-cols-12 px-2 md:px-8 py-1 items-center min-h-[41px]">
			{/* Polyline skeleton - hidden on mobile, visible on md+ */}
			<div className="hidden col-span-1">
				<div className="w-full h-8 bg-gray-200 animate-pulse" />
			</div>

			{/* Run name and workout type skeleton */}
			<div className="md:col-span-3 pr-2 md:pr-0">
				<div className="h-3 bg-gray-200 animate-pulse w-16" />
			</div>

			{/* Date skeleton - hidden on mobile, visible on md+ */}
			<div className="hidden md:block col-span-2 md:text-right">
				<div className="h-3 bg-gray-200 animate-pulse ml-auto w-20" />
			</div>

			{/* Distance skeleton */}
			<div className="md:col-span-2 md:text-right">
				<div className="h-3 bg-gray-200 animate-pulse ml-auto w-12" />
			</div>

			{/* Time skeleton - hidden on mobile, visible on md+ */}
			<div className="hidden md:block col-span-2 text-right">
				<div className="h-3 bg-gray-200 animate-pulse ml-auto w-16" />
			</div>

			{/* Copy button skeleton */}
			<div className="md:col-span-2 text-right">
				<div className="h-3 bg-gray-200 animate-pulse ml-auto w-8" />
			</div>
		</li>
	);
}

import { Suspense } from "react";
import { fetchRuns } from "@/lib/data";
import {
	getWorkoutTypeTag,
	metersToMiles,
	secondsToHMS,
} from "@/lib/formatters";
import { CopyRun } from "./copy-run";
import Polyline from "./polyline";

// Enable PPR for this component
export const experimental_ppr = true;

export function RunsListSkeleton() {
	return (
		<div className="mt-[50svh]">
			<div className="border-t" />
			<ul className="divide-y">
				{Array.from({ length: 10 }).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton list item
					<SkeletonListItem key={`skeleton-${index}`} />
				))}
			</ul>
		</div>
	);
}

function SkeletonListItem() {
	return (
		<li className="grid grid-cols-[3fr_1fr_auto] md:grid-cols-12 px-2 md:px-8 py-1 items-center min-h-[41px]">
			{/* Polyline skeleton - hidden on mobile, visible on md+ */}
			<div className="hidden md:flex col-span-1">
				<div className="inline-flex w-full h-8 bg-gray-200 animate-pulse" />
			</div>

			{/* Run name and workout type skeleton */}
			<div className="md:col-span-3 pr-2 md:pr-0">
				<div className="inline-flex h-3 bg-gray-200 animate-pulse w-16" />
			</div>

			{/* Date skeleton - hidden on mobile, visible on md+ */}
			<div className="hidden md:flex col-span-2 md:justify-end">
				<div className="inline-flex h-3 bg-gray-200 animate-pulse w-20" />
			</div>

			{/* Distance skeleton */}
			<div className="md:col-span-2 flex md:justify-end">
				<div className="inline-flex h-3 bg-gray-200 animate-pulse w-12" />
			</div>

			{/* Time skeleton - hidden on mobile, visible on md+ */}
			<div className="hidden md:flex col-span-2 md:justify-end">
				<div className="inline-flex h-3 bg-gray-200 animate-pulse w-16" />
			</div>

			{/* Copy button skeleton */}
			<div className="md:col-span-2 flex justify-end">
				<div className="inline-flex h-3 bg-gray-200 animate-pulse w-8" />
			</div>
		</li>
	);
}

async function RunsDisplay() {
	const runs = await fetchRuns();

	return (
		<div className="mt-[50svh]">
			<div className="border-t" />
			<ul className="divide-y">
				{runs.map((run) => (
					<li
						key={run.id}
						className="grid grid-cols-[3fr_1fr_auto] md:grid-cols-12 px-2 md:px-8 py-1 items-center"
					>
						<Polyline
							summary={run.map.summary_polyline}
							className="hidden md:flex col-span-1"
						/>
						<p className="md:col-span-3 pr-2 md:pr-0">
							<span>{run.name}</span>
							{getWorkoutTypeTag(run.workout_type) && (
								<span className="ml-2 px-1 py-0.5 text-[9px] uppercase tracking-wide border">
									{getWorkoutTypeTag(run.workout_type)}
								</span>
							)}
						</p>
						<p className="hidden md:flex col-span-2 md:justify-end">
							{new Date(run.start_date_local).toISOString().split("T")[0]}
						</p>
						<p className="md:col-span-2 flex md:justify-end">
							{metersToMiles(run.distance).toFixed(2)}mi
						</p>
						<p className="hidden md:flex col-span-2 md:justify-end">
							{secondsToHMS(run.moving_time)}
						</p>
						<div className="md:col-span-2 flex justify-end">
							<CopyRun activityId={run.id} />
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

export default function RunsList() {
	return (
		<Suspense fallback={<RunsListSkeleton />}>
			<RunsDisplay />
		</Suspense>
	);
}

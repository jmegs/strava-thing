import { getRunsLastNDays } from "@/lib/get-runs";
import { getStats } from "@/lib/get-stats";
import { CopyRunButton } from "./copy-run-btn";
import { PolylineSvg } from "./polyline";
import { metersToMiles, secondsToHMS } from "@/lib/formatters";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";

export default async function Home() {
	await requireAuth();

	const stats = await getStats();
	const runs = await getRunsLastNDays(30);

	return (
		<main>
			<Suspense fallback={<div className="px-8">Loading...</div>}>
				<div className="grid grid-cols-12 px-8 pt-3 sticky top-0">
					<p className="col-span-6 uppercase tracking-wide">
						Anima Sana In Corpore Sano
					</p>
					<p className="col-start-8 text-right">YTD</p>
					<p className="col-start-10 text-right">
						{metersToMiles(stats.miles)}mi
					</p>
					<p className="col-start-12 text-right">{stats.count} runs</p>
				</div>
				<ul className="grid grid-cols-12 border-t divide-y mt-[50svh]">
					{runs.map((run) => (
						<li
							key={run.id}
							className="col-span-12 grid grid-cols-subgrid px-8 items-center min-h-12"
						>
							<div className="col-span-1">
								<PolylineSvg summary={run.map.summary_polyline} />
							</div>
							<p className="col-span-3">{run.name}</p>
							<p className="col-span-2 text-right">
								{new Date(run.start_date_local).toLocaleDateString()}
							</p>
							<p className="col-span-2 text-right">
								{metersToMiles(run.distance).toFixed(2)}mi
							</p>
							<p className="col-span-2 text-right">
								{secondsToHMS(run.moving_time)}
							</p>
							<div className="col-span-2 text-right">
								<CopyRunButton activityId={run.id} />
							</div>
						</li>
					))}
				</ul>
			</Suspense>
		</main>
	);
}

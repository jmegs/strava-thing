import { Suspense } from "react";
import { fetchStats } from "@/lib/data";
import { metersToMiles } from "@/lib/formatters";

// Enable PPR for this component
export const experimental_ppr = true;

export function StatsSkeleton() {
	return (
		<>
			<p className="col-span-2 md:text-right">
				<span className="inline-flex w-10 h-3 bg-gray-200 animate-pulse" />
			</p>
			<p className="col-span-2 md:text-right">
				<span className="inline-flex w-10 h-3 bg-gray-200 animate-pulse" />
			</p>
		</>
	);
}

async function StatsDisplay() {
	const stats = await fetchStats();

	return (
		<>
			<p className="col-span-2 md:text-right">
				<span>{metersToMiles(stats?.miles || 0).toFixed(2)} mi</span>
			</p>
			<p className="col-span-2 md:text-right">
				<span>{stats?.count || 0} runs</span>
			</p>
		</>
	);
}

export default function Header() {
	return (
		<header className="md:grid grid-cols-12 px-2 md:px-8">
			<p className="col-span-4 md:col-span-8 mb-2 md:mb-0 uppercase tracking-wider">
				anima sana in corpore sano
			</p>
			<Suspense fallback={<StatsSkeleton />}>
				<StatsDisplay />
			</Suspense>
		</header>
	);
}

import type {
	RunAggregateStats,
	StatsWindow,
} from "@/lib/services/stats-service"
import { StatHeaderCard } from "./StatHeaderCard"

interface Props {
	stats: StatsWindow[]
}

const emptyStats: RunAggregateStats = {
	run_count: 0,
	distance_mi: 0,
	moving_time_s: 0,
	longest_run_mi: 0,
	avg_pace_s_per_mi: null,
	avg_pace: null,
	avg_hr: null,
}

function formatSigned(value: number, unit: string, decimals = 1) {
	const sign = value >= 0 ? "+" : ""
	return `${sign}${value.toFixed(decimals)} ${unit}`
}

function paceDeltaPct(
	currentPaceSeconds: number | null,
	baselinePaceSeconds: number | null,
) {
	if (!currentPaceSeconds || !baselinePaceSeconds) return null
	return ((baselinePaceSeconds - currentPaceSeconds) / baselinePaceSeconds) * 100
}

export function StatHeader({ stats }: Props) {
	const window7 = stats.find((window) => window.window_days === 7)
	const window28 = stats.find((window) => window.window_days === 28)
	const all7 = window7?.all ?? emptyStats
	const all28 = window28?.all ?? emptyStats
	const easy7 = window7?.easy ?? emptyStats
	const easy28 = window28?.easy ?? emptyStats

	const weeklyDelta = all7.distance_mi - all28.distance_mi / 4
	const easyPaceDelta = paceDeltaPct(
		easy7.avg_pace_s_per_mi,
		easy28.avg_pace_s_per_mi,
	)
	const easyHrDelta =
		easy7.avg_hr !== null && easy28.avg_hr !== null
			? easy7.avg_hr - easy28.avg_hr
			: null

	const milesCardLines = [
		`${all7.distance_mi.toFixed(1)} mi`,
		`${formatSigned(weeklyDelta, "mi")} vs 28d avg`,
	]

	const easyPaceCardLines = [
		easy7.avg_pace ?? "—",
		easyPaceDelta === null
			? "— vs 28d avg"
			: `${formatSigned(easyPaceDelta, "%")} vs 28d avg`,
	]

	const easyHRCardLines = [
		easy7.avg_hr === null ? "—" : `${easy7.avg_hr} bpm`,
		easyHrDelta === null
			? "— vs 28d avg"
			: `${formatSigned(easyHrDelta, "bpm", 0)} vs 28d avg`,
	]

	const longCardLines = [
		all28.longest_run_mi ? `${all28.longest_run_mi.toFixed(1)} mi` : "–",
	]

	return (
		<header className="px-2 py-4 md:p-8 grid grid-cols-12 grid-rows-[auto_1fr] gap-2 mb-2">
			<StatHeaderCard
				title="Miles"
				timeframe="7d"
				statlines={milesCardLines}
				className="col-span-6 md:col-span-3"
			/>
			<StatHeaderCard
				title="Long"
				timeframe="28d"
				statlines={longCardLines}
				className="col-span-6 md:col-span-3"
			/>
			<StatHeaderCard
				title="Easy Pace"
				timeframe="7d"
				statlines={easyPaceCardLines}
				className="col-span-6 md:col-span-3"
			/>
			<StatHeaderCard
				title="Easy HR"
				timeframe="7d"
				statlines={easyHRCardLines}
				className="col-span-6 md:col-span-3"
			/>
		</header>
	)
}

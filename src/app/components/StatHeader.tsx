import { isWithinInterval, parseISO, subDays } from "date-fns"
import type { SummaryActivity } from "strava"
import { mToMi, msToMin, getTag } from "@/shared/format"
import { StatHeaderCard } from "./StatHeaderCard"

function weightedAvg(values: number[], weights: number[]): number {
	const num = values.reduce((a, v, i) => a + v * (weights[i] ?? 0), 0)
	const den = weights.reduce((a, w) => a + (w ?? 0), 0)
	return den > 0 ? num / den : 0
}

interface Props {
	runs: SummaryActivity[]
}

export function StatHeader({ runs }: Props) {
	const now = new Date()

	const processedRuns = runs.map((r) => ({
		...r,
		date: parseISO(r.start_date),
		miles: mToMi(r.distance ?? 0),
		mps: r.average_speed ?? 0,
		secs: r.moving_time ?? 0,
		hr: r.average_heartrate ?? null,
		tag: r.workout_type,
	}))

	function inLast(d: Date, days: number) {
		return isWithinInterval(d, { start: subDays(now, days), end: now })
	}

	// volume
	const miles7 = processedRuns
		.filter((r) => inLast(r.date, 7))
		.reduce((a, r) => a + r.miles, 0)

	const miles28 = processedRuns
		.filter((r) => inLast(r.date, 28))
		.reduce((a, r) => a + r.miles, 0)

	const weeklyDelta = miles7 - miles28 / 4

	// easy runs (untagged)
	const easyRuns = processedRuns.filter((r) => getTag(r.tag) === null)
	const easy7 = easyRuns.filter((r) => inLast(r.date, 7))
	const easy28 = easyRuns.filter((r) => inLast(r.date, 28))

	// weighted avg pace
	const mps7 = weightedAvg(
		easy7.map((r) => r.mps),
		easy7.map((r) => r.miles),
	)
	const mps28 = weightedAvg(
		easy28.map((r) => r.mps),
		easy28.map((r) => r.miles),
	)
	const easyPct = mps28 > 0 ? ((mps7 - mps28) / mps28) * 100 : 0

	// HR weighted by moving time
	const e7HR = easy7.filter((r) => r.hr != null)
	const e28HR = easy28.filter((r) => r.hr != null)

	const hr7 = weightedAvg(
		e7HR.map((r) => r.average_heartrate ?? 0),
		e7HR.map((r) => r.moving_time ?? 0),
	)
	const hr28 = weightedAvg(
		e28HR.map((r) => r.average_heartrate ?? 0),
		e28HR.map((r) => r.moving_time ?? 0),
	)
	const hrDeltaBpm = hr7 - hr28

	// longest in 28d
	const longestRecent = processedRuns
		.filter((r) => inLast(r.date, 28))
		.reduce((mx, r) => Math.max(mx, r.miles), 0)

	// stat lines
	const milesCardLines = [
		`${miles7.toFixed(1)} mi`,
		`${weeklyDelta >= 0 ? "+" : ""}${weeklyDelta.toFixed(1)} mi vs 28d avg`,
	]

	const easyPaceCardLines = [
		msToMin(mps7),
		`${easyPct >= 0 ? "+" : ""}${easyPct.toFixed(1)}% vs 28d avg`,
	]

	const easyHRCardLines = [
		`${Math.round(hr7)} bpm`,
		`${hrDeltaBpm > 0 ? "+" : ""}${hrDeltaBpm.toFixed(0)} bpm vs 28d avg`,
	]

	const longCardLines = [
		longestRecent ? `${longestRecent.toFixed(1)} mi` : "–",
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
				timeframe="28d"
				statlines={easyHRCardLines}
				className="col-span-6 md:col-span-3"
			/>
		</header>
	)
}

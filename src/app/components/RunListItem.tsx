"use client"

import { useImperativeHandle, useRef } from "react"
import type { SummaryActivity } from "strava"
import { mToMi, secToHMS, getTag } from "@/shared/format"
import { useCopyRun } from "@/app/hooks/useCopyRun"
import { PolyLine } from "./PolyLine"

export interface RunListItemHandle {
	copy: () => void
	scrollIntoView: () => void
	visit: () => void
}

interface Props {
	run: SummaryActivity
	selected: boolean
	ref?: React.Ref<RunListItemHandle>
}

export function RunListItem({ run, selected, ref }: Props) {
	const liRef = useRef<HTMLLIElement>(null)
	const { copying, copied, copyRun } = useCopyRun()

	const copyFn = () => copyRun(run.id)
	const scrollFn = () => liRef.current?.scrollIntoView({ block: "nearest" })
	const stravaUrl = `https://www.strava.com/activities/${run.id}`
	const viewFn = () => window.open(stravaUrl, "_blank")

	useImperativeHandle(ref, () => ({
		copy: copyFn,
		scrollIntoView: scrollFn,
		visit: viewFn,
	}))

	const dateStr = new Date(run.start_date_local).toISOString().split("T")[0]
	const miles = mToMi(run.distance).toFixed(2) + "mi"
	const movingTime = secToHMS(run.moving_time)
	const hr = run.average_heartrate
		? run.average_heartrate.toFixed(0) + "bpm"
		: "—"
	const tag = getTag(run.workout_type, (run as unknown as { sport_type?: string }).sport_type)

	return (
		<li
			ref={liRef}
			className="grid grid-cols-12 gap-x-2 px-2 md:px-8 py-1 items-center scroll-mt-(--li-scroll-margin)"
		>
			<div className="col-span-6 md:col-span-3 pr-2 flex items-center overflow-hidden">
				<div className="hidden md:flex mr-6">
					<PolyLine summary={run.map.summary_polyline} />
				</div>

				{selected && (
					<span className="h-2 w-2 bg-blue-500 dark:bg-amber-500 rounded-full mr-2 max-sm:hidden" />
				)}

				<span className="truncate mr-2">{run.name}</span>
				{tag && <span>[{tag}]</span>}
			</div>

			<div className="hidden md:flex col-span-2">{dateStr}</div>

			<div className="col-span-2 flex">{miles}</div>

			<div className="flex col-span-2">{movingTime}</div>

			<div className="hidden md:flex col-span-2">{hr}</div>

			<div className="col-span-2 md:col-span-1 flex gap-2 justify-end">
				<button
					type="button"
					onClick={viewFn}
					className="px-1 py-0.5 inline-grid place-items-center border tracking-wide uppercase disabled:opacity-50 hover:opacity-50 cursor-pointer"
				>
					<span className="w-[3ch]">VST</span>
				</button>
				<button
					type="button"
					className="px-1 py-0.5 inline-grid place-items-center border tracking-wide uppercase disabled:opacity-50 hover:opacity-50 cursor-pointer"
					disabled={copying}
					onClick={copyFn}
				>
					<span className="w-[3ch]">
						{copying ? "..." : copied ? "√" : "CPY"}
					</span>
				</button>
			</div>
		</li>
	)
}

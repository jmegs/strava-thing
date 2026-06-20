"use client"

import { memo } from "react"
import { mToMi, secToHMS, getTag } from "@/shared/format"
import type { RunSummary } from "@/shared/types"
import { PolyLine } from "./PolyLine"

interface Props {
	run: RunSummary
	selected: boolean
	copyStatus: "idle" | "copying" | "copied"
	onCopy: (id: number) => Promise<void>
	onVisit: (id: number) => void
}

export const RunListItem = memo(function RunListItem({
	run,
	selected,
	copyStatus,
	onCopy,
	onVisit,
}: Props) {
	const dateStr = new Date(run.startDate).toISOString().split("T")[0]
	const miles = mToMi(run.distance).toFixed(2) + "mi"
	const movingTime = secToHMS(run.movingTime)
	const hr = run.averageHeartrate
		? run.averageHeartrate.toFixed(0) + "bpm"
		: "—"
	const tag = getTag(run.workoutType)

	return (
		<li
			data-run-id={run.id}
			className="grid grid-cols-12 gap-x-2 px-2 md:px-8 py-1 items-center scroll-mt-(--li-scroll-margin)"
		>
			<div className="col-span-6 md:col-span-3 pr-2 flex items-center overflow-hidden">
				<div className="hidden md:flex mr-6">
					<PolyLine summary={run.summaryPolyline} />
				</div>

				<span
					aria-hidden="true"
					className={`h-2 w-2 shrink-0 bg-blue-500 dark:bg-amber-500 rounded-full mr-2 max-sm:hidden ${
						selected ? "opacity-100" : "opacity-0"
					}`}
				/>

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
					onClick={() => onVisit(run.id)}
					className="px-1 py-0.5 inline-grid place-items-center border tracking-wide uppercase disabled:opacity-50 hover:opacity-50 cursor-pointer"
				>
					<span className="w-[3ch]">VST</span>
				</button>
				<button
					type="button"
					className="px-1 py-0.5 inline-grid place-items-center border tracking-wide uppercase disabled:opacity-50 hover:opacity-50 cursor-pointer"
					disabled={copyStatus === "copying"}
					onClick={() => void onCopy(run.id)}
				>
					<span className="w-[3ch]">
						{copyStatus === "copying"
							? "..."
							: copyStatus === "copied"
								? "√"
								: "CPY"}
					</span>
				</button>
			</div>
		</li>
	)
})

"use client"

import { useState, useRef, useEffect } from "react"
import type { SummaryActivity } from "strava"
import { useKeyboard } from "@/app/hooks/useKeyboard"
import { RunListItem, type RunListItemHandle } from "./RunListItem"

interface Props {
	runs: SummaryActivity[]
}

export function RunList({ runs }: Props) {
	const [selectedIdx, setSelectedIdx] = useState(0)
	const itemRefs = useRef(new Map<number, RunListItemHandle>())

	const selectedId = runs[selectedIdx]?.id

	useKeyboard({
		j: () => setSelectedIdx((i) => Math.min(i + 1, runs.length - 1)),
		k: () => setSelectedIdx((i) => Math.max(i - 1, 0)),
		c: () => itemRefs.current.get(selectedId!)?.copy(),
		s: () => itemRefs.current.get(selectedId!)?.visit(),
		"g g": () => setSelectedIdx(0),
	})

	// auto scroll on selection change
	useEffect(() => {
		if (selectedId != null) {
			itemRefs.current.get(selectedId)?.scrollIntoView()
		}
	}, [selectedId])

	const setItemRef = (id: number) => (el: RunListItemHandle | null) => {
		if (el) {
			itemRefs.current.set(id, el)
		} else {
			itemRefs.current.delete(id)
		}
	}

	return (
		<ul className="border-t divide-y">
			{runs.map((run, i) => (
				<RunListItem
					key={run.id}
					ref={setItemRef(run.id)}
					run={run}
					selected={i === selectedIdx}
				/>
			))}
		</ul>
	)
}

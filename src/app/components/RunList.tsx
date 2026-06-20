"use client"

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react"
import { useKeyboard } from "@/app/hooks/useKeyboard"
import { useCopyRun } from "@/app/hooks/useCopyRun"
import type { RunPage, RunSummary } from "@/shared/types"
import { RunListSkeletonItem } from "./AppSkeleton"
import { RunListItem } from "./RunListItem"

interface Props {
	initialRuns: RunSummary[]
	initialBefore: number | null
}

export function RunList({ initialRuns, initialBefore }: Props) {
	const [runs, setRuns] = useState(initialRuns)
	const [before, setBefore] = useState(initialBefore)
	const [loadingMore, setLoadingMore] = useState(false)
	const [loadError, setLoadError] = useState(false)
	const [selectedIdx, setSelectedIdx] = useState(0)
	const listRef = useRef<HTMLUListElement>(null)
	const loadMoreRef = useRef<HTMLLIElement>(null)
	const loadingMoreRef = useRef(false)
	const { activeId, status, copyRun } = useCopyRun()

	const selectedId = runs[selectedIdx]?.id
	const selectNext = useCallback(() => {
		setSelectedIdx((index) =>
			Math.min(index + 1, Math.max(runs.length - 1, 0)),
		)
	}, [runs.length])
	const selectPrevious = useCallback(() => {
		setSelectedIdx((index) => Math.max(index - 1, 0))
	}, [])
	const selectFirst = useCallback(() => setSelectedIdx(0), [])
	const copySelected = useCallback(() => {
		if (selectedId != null) void copyRun(selectedId)
	}, [copyRun, selectedId])
	const visitSelected = useCallback(() => {
		if (selectedId != null) {
			window.open(`https://www.strava.com/activities/${selectedId}`, "_blank")
		}
	}, [selectedId])
	const visitRun = useCallback((id: number) => {
		window.open(`https://www.strava.com/activities/${id}`, "_blank")
	}, [])
	const loadMore = useCallback(async () => {
		if (before == null || loadingMoreRef.current) return

		loadingMoreRef.current = true
		setLoadError(false)
		setLoadingMore(true)
		try {
			const response = await fetch(`/api/runs?before=${before}`)
			if (!response.ok) throw new Error(`Failed to load runs: ${response.status}`)

			const page = (await response.json()) as RunPage
			setRuns((current) => {
				const existingIds = new Set(current.map((run) => run.id))
				return [
					...current,
					...page.runs.filter((run) => !existingIds.has(run.id)),
				]
			})
			setBefore(page.nextBefore)
		} catch (error) {
			console.error(error)
			setLoadError(true)
		} finally {
			loadingMoreRef.current = false
			setLoadingMore(false)
		}
	}, [before])

	useKeyboard({
		j: selectNext,
		k: selectPrevious,
		c: copySelected,
		s: visitSelected,
		"g g": selectFirst,
	})

	useLayoutEffect(() => {
		if (selectedId != null) {
			listRef.current
				?.querySelector<HTMLElement>(`[data-run-id="${selectedId}"]`)
				?.scrollIntoView({ block: "start", inline: "nearest" })
		}
	}, [selectedId])

	useEffect(() => {
		const target = loadMoreRef.current
		if (!target || before == null) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) void loadMore()
			},
			{ rootMargin: "600px 0px" },
		)
		observer.observe(target)
		return () => observer.disconnect()
	}, [before, loadMore])

	return (
		<ul ref={listRef} className="border-t divide-y">
			{runs.map((run, i) => (
				<RunListItem
					key={run.id}
					run={run}
					selected={i === selectedIdx}
					copyStatus={activeId === run.id ? status : "idle"}
					onCopy={copyRun}
					onVisit={visitRun}
				/>
			))}
			{before != null && (
				<>
					{loadingMore &&
						Array.from({ length: 5 }).map((_, index) => (
							<RunListSkeletonItem key={index} animate />
						))}
					<li
						ref={loadMoreRef}
						className={loadError ? "px-2 md:px-8 py-4 text-center" : "h-px"}
						aria-live="polite"
						aria-label={loadingMore ? "Loading older runs" : undefined}
					>
						{loadError && (
						<button type="button" className="underline" onClick={loadMore}>
							Retry loading older runs
						</button>
						)}
					</li>
				</>
			)}
		</ul>
	)
}

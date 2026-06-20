import { useCallback, useEffect, useRef, useState } from "react"

type CopyStatus = "idle" | "copying" | "copied"

export function useCopyRun() {
	const [status, setStatus] = useState<CopyStatus>("idle")
	const [activeId, setActiveId] = useState<number | null>(null)
	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	useEffect(() => {
		return () => clearTimeout(timerRef.current)
	}, [])

	const copyRun = useCallback(async (id: number) => {
		clearTimeout(timerRef.current)
		setActiveId(id)
		setStatus("copying")

		try {
			const text = new ClipboardItem({
				"text/plain": fetch(`/api/run/${id}`)
					.then((r) => r.json())
					.then((json) => JSON.stringify(json, null, 2))
					.then((str) => new Blob([str], { type: "text/plain" })),
			})
			await navigator.clipboard.write([text])
		} catch (e) {
			console.error("Failed to copy: ", e)
		} finally {
			setStatus("copied")
			timerRef.current = setTimeout(() => {
				setStatus("idle")
				setActiveId(null)
			}, 1000)
		}
	}, [])

	return { activeId, status, copyRun }
}

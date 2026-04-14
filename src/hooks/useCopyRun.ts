import { useState, useEffect, useRef } from "react"

type CopyStatus = "idle" | "copying" | "copied"

export function useCopyRun() {
	const [status, setStatus] = useState<CopyStatus>("idle")
	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

	useEffect(() => {
		return () => clearTimeout(timerRef.current)
	}, [])

	const copyRun = async (id: number) => {
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
			setStatus("idle")
			return
		}
		setStatus("copied")
		timerRef.current = setTimeout(() => setStatus("idle"), 1000)
	}

	return { copying: status === "copying", copied: status === "copied", copyRun }
}

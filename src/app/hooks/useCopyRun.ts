import { useState } from "react"

export function useCopyRun() {
	const [copying, setCopying] = useState(false)
	const [copied, setCopied] = useState(false)

	const copyRun = async (id: number) => {
		setCopying(true)

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
			setCopying(false)
			setCopied(true)
			setTimeout(() => setCopied(false), 1000)
		}
	}

	return { copying, copied, copyRun }
}

import { useEffect, useRef } from "react"

type BindingFn = () => void
type Bindings = Record<string, BindingFn>

export function useKeyboard(bindings: Bindings) {
	const bindingsRef = useRef(bindings)
	bindingsRef.current = bindings

	useEffect(() => {
		let buffer: string[] = []
		let lastKeyTime = 0
		const SEQ_TIMEOUT_MS = 1000

		// precompute which keys start a sequence
		const seqPrefixes = new Set<string>()
		for (const key of Object.keys(bindingsRef.current)) {
			const parts = key.split(" ")
			if (parts.length > 1) {
				seqPrefixes.add(parts[0])
			}
		}

		function handler(e: KeyboardEvent) {
			const tag = (e.target as HTMLElement)?.tagName
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
			if ((e.target as HTMLElement)?.isContentEditable) return

			const now = Date.now()
			if (now - lastKeyTime > SEQ_TIMEOUT_MS) buffer = []
			lastKeyTime = now

			const key = e.key
			buffer.push(key)
			if (buffer.length > 2) buffer.shift()

			const seq = buffer.join(" ")

			// check sequence match first
			if (bindingsRef.current[seq]) {
				e.preventDefault()
				bindingsRef.current[seq]()
				buffer = []
				return
			}

			// if this key could start a sequence, wait for next key
			if (seqPrefixes.has(key) && buffer.length === 1) {
				e.preventDefault()
				return
			}

			// single key match
			if (bindingsRef.current[key]) {
				e.preventDefault()
				bindingsRef.current[key]()
				buffer = []
				return
			}
		}

		window.addEventListener("keydown", handler)
		return () => window.removeEventListener("keydown", handler)
	}, [])
}

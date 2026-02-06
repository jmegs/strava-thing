"use client"

import { useMemo } from "react"
import polyline from "@mapbox/polyline"

interface Props {
	summary: string
	size?: number
	className?: string
}

export function PolyLine({ summary, size = 32, className = "" }: Props) {
	const isTreadmill = !summary || summary.trim() === ""

	const pathData = useMemo(() => {
		if (!summary) return ""

		const pts = polyline.decode(summary) as [number, number][]
		if (pts.length < 2) return ""

		const lats = pts.map((p) => p[0])
		const lngs = pts.map((p) => p[1])
		const minLat = Math.min(...lats)
		const maxLat = Math.max(...lats)
		const minLng = Math.min(...lngs)
		const maxLng = Math.max(...lngs)
		const w = maxLng - minLng || 1
		const h = maxLat - minLat || 1

		return pts
			.map(([lat, lng], i) => {
				const x = ((lng - minLng) / w) * size
				const y = (1 - (lat - minLat) / h) * size
				return `${i === 0 ? "M" : "L"} ${x},${y}`
			})
			.join(" ")
	}, [summary, size])

	const treadmillPath = useMemo(() => {
		const padding = size * 0.15
		const beltY = size * 0.5
		const beltHeight = size * 0.2
		const rollerRadius = size * 0.08

		return `
			M ${padding} ${beltY - beltHeight / 2}
			L ${size - padding} ${beltY - beltHeight / 2}
			L ${size - padding} ${beltY + beltHeight / 2}
			L ${padding} ${beltY + beltHeight / 2}
			Z
			M ${padding} ${beltY}
			m -${rollerRadius},0
			a ${rollerRadius},${rollerRadius} 0 1,0 ${rollerRadius * 2},0
			a ${rollerRadius},${rollerRadius} 0 1,0 -${rollerRadius * 2},0
			M ${size - padding} ${beltY}
			m -${rollerRadius},0
			a ${rollerRadius},${rollerRadius} 0 1,0 ${rollerRadius * 2},0
			a ${rollerRadius},${rollerRadius} 0 1,0 -${rollerRadius * 2},0
		`
			.replace(/\s+/g, " ")
			.trim()
	}, [size])

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<title>Route Map</title>
			<path d={isTreadmill ? treadmillPath : pathData} />
		</svg>
	)
}

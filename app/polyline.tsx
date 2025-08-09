import polyline from "@mapbox/polyline";

type Props = {
	summary: string;
	size?: number; // px square, default 96
	className?: string; // for custom styles
};

export function PolylineSvg({ summary, size = 32, className }: Props) {
	const points = polyline.decode(summary) as [number, number][];

	if (points.length < 2) return null;

	// Normalize to [0,1] bounds
	const lats = points.map((p) => p[0]);
	const lngs = points.map((p) => p[1]);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);

	const width = maxLng - minLng || 1;
	const height = maxLat - minLat || 1;

	// Flip latitudes for SVG coordinate system (y down)
	const normalized = points.map(([lat, lng]) => {
		const x = (lng - minLng) / width;
		const y = 1 - (lat - minLat) / height;
		return [x * size, y * size];
	});

	const pathData = normalized
		.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x},${y}`)
		.join(" ");

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
			stroke="currentColor"
			strokeWidth={1.5}
			className={className}
		>
			<path d={pathData} />
		</svg>
	);
}

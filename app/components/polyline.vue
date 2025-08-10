<!-- components/PolylineSvg.vue -->
<script setup lang="ts">
import polyline from "@mapbox/polyline";

interface Props {
	summary: string;
	size?: number; // px square, default 32
	class?: string; // pass-through classes
}

const props = defineProps<Props>();

const box = computed(() => props.size ?? 32);
const pathData = computed(() => {
	if (!props.summary) return "";

	const pts = polyline.decode(props.summary) as [number, number][];
	if (pts.length < 2) return "";

	// bounds
	const lats = pts.map((p) => p[0]);
	const lngs = pts.map((p) => p[1]);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLng = Math.min(...lngs);
	const maxLng = Math.max(...lngs);
	const w = maxLng - minLng || 1;
	const h = maxLat - minLat || 1;

	// map -> [0,size] & flip Y
	return pts
		.map(([lat, lng], i) => {
			const x = ((lng - minLng) / w) * box.value;
			const y = (1 - (lat - minLat) / h) * box.value;
			return `${i === 0 ? "M" : "L"} ${x},${y}`;
		})
		.join(" ");
});

const isTreadmill = computed(
	() => !props.summary || props.summary.trim() === "",
);

// Simple treadmill icon as SVG path (belt with rollers)
const treadmillPath = computed(() => {
	const size = box.value;
	const padding = size * 0.15;
	const beltY = size * 0.5;
	const beltHeight = size * 0.2;
	const rollerRadius = size * 0.08;

	// Treadmill belt (rectangle) and two circular rollers at ends
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
		.trim();
});
</script>

<template>
	<svg
		:width="box"
		:height="box"
		:viewBox="`0 0 ${box} ${box}`"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		:class="props.class"
	>
		<path v-if="!isTreadmill" :d="pathData" />
		<path v-else :d="treadmillPath" />
	</svg>
</template>

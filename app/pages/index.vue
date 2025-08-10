<script setup lang="ts">
definePageMeta({
	middleware: ["auth"],
});

const { data: stats } = await useFetch("/api/stats");
const { data: runs } = await useFetch("/api/list");
</script>

<template>
	<main class="py-3">
		<header class="md:grid grid-cols-12 px-2 md:px-8">
			<p class="col-span-4 md:col-span-8 mb-2 md:mb-0 uppercase tracking-wider">
				anima sana in corpore sano
			</p>
			<p class="col-span-2 md:text-right">
				{{ metersToMiles(stats.miles).toFixed(2) }} mi
			</p>
			<p class="col-span-2 md:text-right">{{ stats.count }} runs</p>
		</header>
		<ul class="divide-y border-t mt-[50svh]">
			<li
				v-for="run in runs"
				:key="run.id"
				class="grid grid-cols-[3fr_1fr_auto] md:grid-cols-12 px-2 md:px-8 py-1 items-center"
			>
				<Polyline
					:summary="run.map.summary_polyline"
					class="hidden md:block col-span-1"
				/>
				<p class="md:col-span-3 pr-2 md:pr-0">{{ run.name }}</p>
				<p class="hidden md:block col-span-2 md:text-right">{{ run.date }}</p>
				<p class="md:col-span-2 md:text-right">
					{{ metersToMiles(run.distance).toFixed(2) }}mi
				</p>
				<p class="hidden md:block col-span-2 text-right">
					{{ secondsToHMS(run.moving_time) }}
				</p>
				<div class="md:col-span-2 text-right">
					<CopyRun :activityId="run.id" />
				</div>
			</li>
		</ul>
	</main>
</template>

<script setup lang="ts">
interface Props {
	activityId: number;
}
const props = defineProps<Props>();

const { copy, copied } = useClipboard();
const text = ref("");

const getData = async () => {
	const run = await $fetch(`/api/run/${props.activityId}`);
	text.value = JSON.stringify(run, null, 2);

	await copy(text.value);
};
</script>

<template>
	<button
		@click="getData()"
		class="rounded px-2 py-0.5 text-xs border disabled:opacity-50 hover:opacity-80 hover:cursor-pointer tracking-wide"
	>
		<span v-if="!copied">COPY</span>
		<span v-else>Copied</span>
	</button>
</template>

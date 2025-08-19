<script setup lang="ts">
interface Props {
	activityId: number;
}
const props = defineProps<Props>();

// const { copy, copied } = useClipboard();
// const text = ref("");

// const getData = async () => {
// 	const run = await $fetch(`/api/run/${props.activityId}`);
// 	text.value = JSON.stringify(run, null, 2);

// 	await copy(text.value);
// };
const copied = ref(false);

const handleClick = () => {
	if (typeof ClipboardItem && navigator.clipboard.write) {
		const text = new ClipboardItem({
			"text/plain": $fetch(`/api/run/${props.activityId}`)
				.then((res) => JSON.stringify(res, null, 2))
				.then((text) => new Blob([text], { type: "text/plain" })),
		});
		navigator.clipboard.write([text]);
	} else {
		$fetch(`/api/run/${props.activityId}`)
			.then((res) => JSON.stringify(res, null, 2))
			.then((text) => navigator.clipboard.writeText(text));
	}

	copied.value = true;

	setTimeout(() => {
		copied.value = false;
	}, 1500);
};
</script>

<template>
	<button
		@click="handleClick()"
		class="px-2 py-0.5 inline-grid place-items-center text-xs border disabled:opacity-50 hover:opacity-80 hover:cursor-pointer tracking-wide"
	>
		<span v-if="!copied">COPY</span>
		<span v-else class="animate-pulse">••••</span>
	</button>
</template>

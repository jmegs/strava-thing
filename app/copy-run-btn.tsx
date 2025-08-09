"use client";
import { useTransition } from "react";
import { copyRunJson } from "@/lib/copy-run.action";

export function CopyRunButton({ activityId }: { activityId: number }) {
	const [pending, start] = useTransition();
	return (
		<button
			disabled={pending}
			onClick={() =>
				start(async () => {
					const data = await copyRunJson(activityId);
					await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
				})
			}
			className="rounded px-2 py-1 uppercase text-xs text-inherit border hover:bg-gray-100 disabled:opacity-50 tracking-wide w-[12ch]"
		>
			{pending ? "Copying…" : "Copy JSON"}
		</button>
	);
}

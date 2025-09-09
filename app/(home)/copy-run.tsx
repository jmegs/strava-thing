"use client";

import { useState } from "react";
import { fetchRun } from "@/lib/actions";

interface CopyRunProps {
	activityId: number;
}

export function CopyRun({ activityId }: CopyRunProps) {
	const [copied, setCopied] = useState(false);

	const handleClick = async () => {
		try {
			const formData = new FormData();
			formData.set("id", activityId.toString());

			if (typeof ClipboardItem && navigator.clipboard.write) {
				const text = new ClipboardItem({
					"text/plain": fetchRun(formData)
						.then((res) => JSON.stringify(res, null, 2))
						.then((text) => new Blob([text], { type: "text/plain" })),
				});
				navigator.clipboard.write([text]);
			} else {
				fetchRun(formData)
					.then((res) => JSON.stringify(res, null, 2))
					.then((text) => navigator.clipboard.writeText(text));
			}

			setCopied(true);

			setTimeout(() => {
				setCopied(false);
			}, 1500);
		} catch (error) {
			console.error("Failed to copy run data:", error);
		}
	};

	return (
		<button
			onClick={handleClick}
			className="px-2 py-0.5 inline-grid place-items-center text-xs border disabled:opacity-50 hover:opacity-80 hover:cursor-pointer tracking-wide"
		>
			{!copied ? (
				<span>COPY</span>
			) : (
				<span className="animate-pulse">••••</span>
			)}
		</button>
	);
}

export function StatsHeaderSkeleton() {
	return (
		<header className="px-2 py-4 md:p-8 grid grid-cols-12 grid-rows-[auto_1fr] gap-2 mb-2">
			{Array.from({ length: 4 }).map((_, i) => (
				<div
					key={i}
					className="aspect-square flex flex-col justify-between px-4 py-3 border border-neutral-200 col-span-6 md:col-span-3 animate-pulse"
				>
					<div className="h-4 w-24 bg-neutral-100" />
					<div className="h-4 w-32 bg-neutral-100" />
				</div>
			))}
		</header>
	)
}

export function RunListSkeleton() {
	return (
		<ul className="border-t border-t-neutral-200 divide-y divide-neutral-200 animate-pulse">
			{Array.from({ length: 20 }).map((_, i) => (
				<li
					key={i}
					className="grid grid-cols-12 gap-x-2 px-2 md:px-8 py-2 md:py-4 items-center"
				>
					<div className="col-span-6 md:col-span-3 pr-2 flex items-center overflow-hidden h-3 bg-neutral-100" />
					<div className="hidden md:flex col-span-2 h-3 bg-neutral-100" />
					<div className="col-span-2 flex h-3 bg-neutral-100" />
					<div className="flex col-span-2 h-3 bg-neutral-100" />
					<div className="hidden md:flex col-span-2 h-3 bg-neutral-100" />
					<div className="col-span-2 md:col-span-1 flex justify-end h-3 bg-neutral-100" />
				</li>
			))}
		</ul>
	)
}

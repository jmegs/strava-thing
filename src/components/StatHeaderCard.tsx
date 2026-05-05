interface Props {
	title: string
	timeframe: string
	statlines: string[]
	className?: string
}

export function StatHeaderCard({ title, timeframe, statlines, className = "" }: Props) {
	return (
		<div
			className={`aspect-square flex flex-col justify-between px-4 py-3 border ${className}`}
		>
			<div className="flex justify-between items-center">
				<span>{title}</span>
				<span>{timeframe}</span>
			</div>

			<div className="flex flex-col space-y-1">
				{statlines.map((line, i) => (
					<span key={i}>{line}</span>
				))}
			</div>
		</div>
	)
}

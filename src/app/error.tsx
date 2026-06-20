"use client"

export default function ErrorPage({ reset }: { reset: () => void }) {
	return (
		<div className="p-10">
			<p>Unable to load Strava data.</p>
			<button type="button" className="underline" onClick={reset}>
				Try again
			</button>
		</div>
	)
}

"use client";

export default function StravaLogin() {
	const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!;
	const origin =
		typeof window !== "undefined"
			? window.location.origin
			: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`; // fallback for SSR

	const redirectUri = new URL("/strava/callback", origin).toString();
	const scope = "read,activity:read_all";

	const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
		redirectUri
	)}&scope=${scope}&approval_prompt=force`;

	return (
		<div className="h-screen flex items-center justify-center">
			<a
				href={authUrl}
				className="px-4 py-2 text-white bg-orange-600 rounded hover:bg-orange-700"
			>
				Log In to Strava
			</a>
		</div>
	);
}

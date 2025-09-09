import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Login() {
	const cookieStore = await cookies();
	const loggedIn = cookieStore.get("strava_refresh_token")?.value;

	if (loggedIn) {
		redirect("/");
	}

	return (
		<div className="h-screen grid place-items-center">
			<a
				href="/auth/login"
				className="px-4 py-2 text-white bg-orange-600 rounded hover:bg-orange-700"
			>
				Login with Strava
			</a>
		</div>
	);
}

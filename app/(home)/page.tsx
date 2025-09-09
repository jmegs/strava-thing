import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "./header";
import RunsList from "./runs-list";

export const experimental_ppr = true;

export default async function Home() {
	const cookieStore = await cookies();
	const loggedIn = cookieStore.get("strava_refresh_token")?.value;

	if (!loggedIn) {
		redirect("/login");
	}

	return (
		<main className="py-3 font-mono text-xs">
			<Header />
			<RunsList />
		</main>
	);
}

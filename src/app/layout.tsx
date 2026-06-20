import type { Metadata } from "next"
import localFont from "next/font/local"
import type { ReactNode } from "react"

import "@/app/styles/app.css"

const tx02 = localFont({
	src: "../../public/TX-02.woff2",
	display: "swap",
	variable: "--font-tx-02",
})

export const metadata: Metadata = {
	title: "STR-01 Strava Analysis",
	icons: {
		icon: "/icon.svg",
	},
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={tx02.variable}>
			<body className="font-mono text-xs">{children}</body>
		</html>
	)
}

import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import "./globals.css"

const tx02 = localFont({
	src: "../../public/fonts/TX-02.woff2",
	variable: "--font-tx-02",
	display: "swap",
	preload: true,
})

export const metadata: Metadata = {
	title: "STR-01 Strava Analysis",
	icons: { icon: "/icon.svg" },
}

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" className={tx02.variable}>
			<body>
				<div id="root" className="font-mono text-xs">
					{children}
				</div>
			</body>
		</html>
	)
}

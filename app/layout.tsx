import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const tx02 = localFont({
	src: "./TX-02.woff2",
	variable: "--font-tx02",
});

export const metadata: Metadata = {
	title: "STR-01",
	description: "strava analaysis for LLMs",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${tx02.variable} antialiased`}>{children}</body>
		</html>
	);
}

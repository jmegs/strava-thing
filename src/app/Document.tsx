import cssUrl from "./styles/app.css?url"

export const Document: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>STR-01 Strava Analysis</title>
			<link rel="icon" type="image/svg+xml" href="/icon.svg" />
			<link rel="stylesheet" href={cssUrl} />
			<link rel="modulepreload" href="/src/client.tsx" />
		</head>
		<body>
			<div id="root" className="font-mono text-xs">
				{children}
			</div>
			<script>import("/src/client.tsx")</script>
		</body>
	</html>
)

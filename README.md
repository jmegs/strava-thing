# Strava Thing

A Next.js App Router dashboard for recent Strava running activity.

The app uses Next.js Cache Components and Partial Prerendering: the dashboard
shell streams immediately, authenticated Strava data stays request-specific,
and public weather lookups are shared in the Next.js cache.

## Setup

Create a [Strava API application](https://www.strava.com/settings/api), then
Copy the committed environment template and fill in the values:

```shell
cp .env.example .env.local
```

Generate a suitable session encryption secret with:

```shell
openssl rand -hex 32
```

Configure the Strava application's authorization callback domain for your
local or deployed hostname. The callback path is:

```text
/auth/strava/callback
```

## Development

```shell
bun install
bun run dev
```

## Verification

```shell
bun run check
bun run build
```

## Deploying to Vercel

Import the repository into Vercel and add `STRAVA_CLIENT_ID`,
`STRAVA_CLIENT_SECRET`, and `AUTH_SECRET_KEY` to the project environment
variables. Vercel detects Next.js and Bun from `package.json` and `bun.lock`.

After linking the project locally, Vercel-managed values can be pulled with:

```shell
vercel env pull .env.local
```

Add the production domain to the Strava API application settings before
testing login.

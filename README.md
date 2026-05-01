# Strava Thing

A Next.js Strava running dashboard deployed to Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare). The dashboard and AI clients use the same REST API data model.

## Strava OAuth Setup

Create a [Strava API application](https://www.strava.com/settings/api) and configure the OAuth callback for your deployed domain:

```txt
https://strava.john.zone/auth/callback
```

For local development, create `.dev.vars`:

```txt
STRAVA_CLIENT_ID=<client_id>
STRAVA_CLIENT_SECRET=<client_secret>
AUTH_SECRET_KEY=<random_string>
```

Generate `AUTH_SECRET_KEY` with something like:

```sh
openssl rand -hex 32
```

## Cloudflare KV

Browser sessions, Strava OAuth tokens, and first-party API token metadata are stored in the `SESSIONS` KV binding.

Create the namespace and copy the ID into `wrangler.jsonc`:

```sh
bun wrangler kv namespace create SESSIONS
```

Strava tokens are stored by athlete ID. API tokens are stored by SHA-256 hash only; raw tokens are returned once when created.

## Development

```sh
bun run dev
```

Log in through `/auth/strava` to authorize Strava and seed the server-side Strava token store.

To preview the deployed Workers bundle locally:

```sh
bun run preview
```

## Deployment

1. Update the worker name/domain in `wrangler.jsonc` if needed.
2. Ensure the `SESSIONS` KV namespace ID is configured.
3. Add production secrets:

```sh
bun wrangler secrets put STRAVA_CLIENT_ID
bun wrangler secrets put STRAVA_CLIENT_SECRET
bun wrangler secrets put AUTH_SECRET_KEY
```

4. Deploy:

```sh
bun run release
```

## REST API

Read endpoints accept either the dashboard browser session cookie or a bearer API token:

```txt
Authorization: Bearer st_run_live_<token>
```

Available endpoints:

- `GET /api/me`
- `GET /api/stats?windows=7,28`
- `GET /api/runs?limit=20&page=1&after=...&before=...`
- `GET /api/runs/{run_id}`
- `GET /api/runs/{run_id}/streams?keys=heartrate,time,distance`
- `GET /openapi.json`

Token management endpoints require browser session auth only:

- `GET /api/tokens`
- `POST /api/tokens`
- `DELETE /api/tokens/{token_id}`

Create a token after logging into the dashboard:

```sh
curl -X POST https://strava.john.zone/api/tokens \
  -H "Content-Type: application/json" \
  -b "session=<browser-session-cookie>" \
  -d '{"name":"ChatGPT Action","expiresAt":null}'
```

The raw `st_run_live_...` token is returned only in that response.

## GPT Action Setup

Use the OpenAPI schema at:

```txt
https://strava.john.zone/openapi.json
```

Configure authentication in the GPT Action:

- Auth type: `API Key`
- Header: `Authorization`
- Prefix: `Bearer`
- API key value: the generated `st_run_live_...` token

The GPT Action schema intentionally excludes token-management routes.

## Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenNext for Cloudflare](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)

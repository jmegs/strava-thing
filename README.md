# Strava Thing

## Set up
Create a new [Strava API application](https://www.strava.com/settings/api)

Then in `.dev.vars`
```
STRAVA_CLIENT_ID=<client_id>
STRAVA_CLIENT_SECRET=<client_secret>

// e.g. openssl rand -hex 32
AUTH_SECRET_KEY=<random_string>
```

## Development
rwsdk emulates cloudflare in development automatically with vite environments

```shell
pnpm run dev
```

## Deploying
1. Change the name of the worker and optionally the domain in `wrangler.jsonc`

2. Create a KV namespace for sessions and update the `id` in `wrangler.jsonc`
```shell
pnpm wrangler kv namespace create SESSIONS
```

3. Add secrets to prod
```shell
pnpm wrangler secrets put STRAVA_CLIENT_ID
pnpm wrangler secrets put STRAVA_CLIENT_SECRET
pnpm wrangler secrets put AUTH_SECRET_KEY
```

4. Then deploy
```shell
pnpm run release
```

## Claude Connector (MCP)

The app exposes an MCP endpoint at `/mcp` that lets Claude access your Strava running data.

1. Log in to your deployed app at least once (this seeds the MCP auth tokens)
2. In Claude, go to **Settings > Connectors > Add Connector**
3. Enter your app's MCP URL: `https://<your-domain>/mcp`
4. Ask Claude things like "What are my running stats this week?" or "Show me my last 5 runs"

Available tools:
- **get_stats** — weekly mileage, easy pace, easy HR, longest run (7d/28d)
- **get_runs** — list of recent runs with distance, pace, HR, and workout tag
- **get_run_detail** — full details for a specific run including splits, weather, laps, and notes

## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)

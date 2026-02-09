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

## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)

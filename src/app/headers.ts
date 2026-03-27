import { RouteMiddleware } from "rwsdk/router";

export const setCommonHeaders =
  (): RouteMiddleware =>
  ({ response, rw: { nonce } }) => {
    if (!import.meta.env.VITE_IS_DEV_SERVER) {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
      );
    }

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()",
    );

    // unsafe-eval required by rwsdk RSC runtime; Cloudflare challenge iframe needs its own frame-src
    response.headers.set(
      "Content-Security-Policy",
      `default-src 'self'; script-src 'self' 'unsafe-eval' 'nonce-${nonce}' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'self'; frame-src 'self' https://challenges.cloudflare.com; connect-src 'self'; object-src 'none';`,
    );
  };

# Multi-tenant public sites (subdomain + path)

## Production

1. **DNS:** Create a wildcard record `*.helpinghands.ca` (replace with your apex) pointing to the same load balancer or CDN origin that serves the Vite-built SPA (`index.html` + assets).

2. **TLS:** Issue a wildcard certificate for `*.helpinghands.ca` (e.g. ACM, Let’s Encrypt DNS challenge).

3. **SPA fallback:** Every hostname must serve `index.html` for unknown paths so React Router can handle `/{campaign-slug}`.

4. **Frontend env:** Set `VITE_PUBLIC_SITE_HOST_SUFFIX=helpinghands.ca` (no protocol, lowercase). The app treats `client-name.helpinghands.ca` as org subdomain `client-name` and loads `/api/public/client-name/{slug}` for path `/{slug}`.

5. **API:** Ensure `VITE_API_BASE_URL` is reachable from the browser on that host (CORS already allows dev origins; add production origins in Flask `CORS` config).

6. **Backend:** For Flask subdomain-style routes, set `SERVER_NAME` appropriately in production. Path-style public API `GET /api/public/<org>/<slug>` works without subdomains and is used by `http://localhost:5173/donate/:org/:slug`.

## Local development

- Use path URLs: `/donate/{orgSubdomain}/{campaignSlug}` (no hosts file required).
- To test subdomain routing, map e.g. `demo.localhost` to `127.0.0.1`, run Vite with `server.host: true`, set `VITE_PUBLIC_SITE_HOST_SUFFIX=localhost`, and open `http://demo.localhost:5173/your-slug`.

# sitedotmoss (Astro)

This project is configured for server rendering on Cloudflare using the Astro Cloudflare adapter.

## Local Development

```sh
npm install
npm run dev
```

## Required Environment Variables

Copy `.env.example` to `.env.local` for local development:

```sh
cp .env.example .env.local
```

Set these values:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Deploy to Cloudflare Workers

This project uses Astro 6 with `@astrojs/cloudflare` and deploys to Cloudflare Workers.

1. Authenticate Wrangler (or set `CLOUDFLARE_API_TOKEN`).
2. Run:

```sh
npm run cf:deploy
```

This runs `astro build` and then `wrangler deploy`.

If your deploy uses an API token, ensure it includes at least:

- Account: Cloudflare Workers = Edit
- Account: Account Settings = Read

Then set all app secrets as Worker secrets (or environment vars) for the deployed Worker.

## Notes

- Upload and delete image APIs use Cloudinary REST endpoints, which works on Cloudflare Workers runtime.
- Do not commit real secrets to the repository.

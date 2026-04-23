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

## Deploy to Cloudflare Pages

Use these build settings in Cloudflare Pages:

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Deploy command: leave empty (recommended for Git-connected Pages)

If you use a custom deploy command (CI/manual), use Pages deploy instead of Workers deploy:

```sh
npx wrangler pages deploy dist --project-name sitedotmoss
```

Do not use `npx wrangler deploy` for this repository.

Set all environment variables from `.env.example` in Cloudflare Pages project settings.

## Notes

- Upload and delete image APIs use Cloudinary REST endpoints, which works on Cloudflare Workers runtime.
- Do not commit real secrets to the repository.

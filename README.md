# sitedotmoss (Astro)

This project is configured for server rendering on Cloudflare using the Astro Cloudflare adapter.

## Local Development

```sh
npm install
npm run dev
```

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

## Shoe Demo Integration

The `Shoe Demo` page now posts uploads to the site backend at `/api/shoe-demo`, which proxies the Hugging Face inference call server-side.

- The proxy route forwards the uploaded image to `badgaitintin/shoedetclss` using the Gradio API `/predict` endpoint.
- If the Hugging Face Space is gated, set an HF token on the server with one of `HF_TOKEN`, `HUGGINGFACE_TOKEN`, or `HF_SPACE_TOKEN`.
- The current pipeline uses Grounding DINO for person/shoe detection, Depth-Anything V2 for depth, and a single Swin classifier (`swin-mix-8560.pth`) for brand prediction.

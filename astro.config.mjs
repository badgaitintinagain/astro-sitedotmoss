// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import { fileURLToPath } from 'node:url';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react(), alpinejs()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'next/image': fileURLToPath(new URL('./src/shims/next-image.tsx', import.meta.url)),
        'next/navigation': fileURLToPath(new URL('./src/shims/next-navigation.ts', import.meta.url)),
        'next/dynamic': fileURLToPath(new URL('./src/shims/next-dynamic.ts', import.meta.url)),
        'next/server': fileURLToPath(new URL('./src/shims/next-server.ts', import.meta.url)),
      }
    },
    ssr: {
        external: ['bcryptjs'],
    },
  },

  adapter: cloudflare()
});

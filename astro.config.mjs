import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import keystatic from "@keystatic/astro";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://joeinn.es",
  integrations: [
    react(),
    mdx(),
    keystatic(),
    svelte(),
    // Keep the private admin dashboard out of the public sitemap.
    sitemap({ filter: (page) => !page.includes("/admin") }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  // Featured images live on the PDS as blobs, served via getBlob. Allow that host
  // so Astro's <Image> can hand them to Vercel's on-demand image optimizer
  // (resize/format at the edge) instead of shipping the raw full-size blob.
  image: {
    remotePatterns: [{ protocol: "https", hostname: "bsky.social" }],
  },
  adapter: vercel({ imageService: true }),
  viewTransitions: true,
});

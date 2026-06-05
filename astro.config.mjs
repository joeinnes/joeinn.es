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
  adapter: vercel(),
  viewTransitions: true,
});

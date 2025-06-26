import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import keystatic from "@keystatic/astro";

import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), keystatic(), svelte()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});
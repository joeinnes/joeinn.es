# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and blog for Joe Innes (joeinn.es), built with Astro 5 and Keystatic CMS. Features a blog, short-form "smidgeons", a shipped contributions log, CV, contact form, and a /now page.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:4321)
npm run build    # Production build
npm run preview  # Preview production build locally
```

Keystatic admin UI is available at http://localhost:4321/keystatic during development.

## Tech Stack

- Astro 5 (static site generator, SSR via Vercel adapter)
- Keystatic CMS (content management, GitHub storage backend)
- React 19 (Keystatic UI, JSX in config)
- Svelte 5 (interactive client components)
- MDX (blog post and content authoring)
- Tailwind CSS 4 (via @tailwindcss/vite plugin, with @tailwindcss/typography)
- TypeScript (strict mode, React JSX)
- Vercel (deployment adapter)
- Formspree (contact form backend)
- marked (Markdown rendering for smidgeons and /now page)
- sharp (image processing)

## Architecture

### Content Collections

Defined in `src/content/config.ts` (Astro) and `keystatic.config.tsx` (Keystatic):

- **posts** (`src/content/posts/`) -- Blog posts with title, date, optional date_updated, excerpt, featured_image, page_bg (custom accent colour), and draft flag. MDX content.
- **smidgeons** (`src/content/smidgeons/`) -- Short-form notes inspired by Maggie Appleton's smidgeons. Have a summary, created date, and MDX body. Paginated at 20 per page.
- **i-shipped** (`src/content/i-shipped/`) -- Log of open source contributions. Each entry has a summary, repo name, PR number, merge date, and MDX content. Grouped by date on the listing page.
- **now** (singleton, `src/content/now`) -- Single /now page content managed as a Keystatic singleton with MDX and a date field.

### Pages

- `/` (`src/pages/index.astro`) -- Landing page with name, tagline, and hero image
- `/blog` (`src/pages/blog/index.astro`) -- Blog listing with client-side title search
- `/blog/[slug]` (`src/pages/blog/[slug].astro`) -- Individual blog post with signature component
- `/smidgeons` (`src/pages/smidgeons/[...page].astro`) -- Paginated smidgeons feed
- `/i-shipped` (`src/pages/i-shipped/index.astro`) -- Shipped contributions, grouped by date with expandable details
- `/cv` (`src/pages/cv/index.astro`) -- Embedded PDF CV with download link
- `/contact` (`src/pages/contact/index.astro`) -- Contact form (Formspree)
- `/now` (`src/pages/now/index.astro`) -- /now page with recent listening tracks (via AT Protocol/Bluesky)

### Components

All in `src/components/`. A mix of Astro, Svelte, and interactive widgets:

- **Navigation**: `NewNav.astro` (hamburger menu), `nav.astro` (legacy nav)
- **Layout**: `Footer.svelte` (site footer with navigation and contact links)
- **Content**: `Smidgeon.astro`, `GitHubLink.astro`, `Signature.svelte`
- **Music**: `NowPlaying.svelte` (floating widget showing currently playing track via AT Protocol), `RecentTracks.svelte`, `MyMusic.astro`
- **Interactive widgets**: `PomodoroTimer.svelte`, `LimoCalculator.svelte`, `VoterPowerCalculator.svelte`, `HowMuchTime.svelte`, `WeatherDisplay.svelte`, `ColourSwatch.svelte`, `FontSample.svelte`, `F1Grid.svelte`, `Tweet.svelte`

## Styling

The site uses two styling approaches:

1. **Primary** (`src/styles.css`): Custom CSS with layers (reset, base, utilities, components, layout). Defines CSS custom properties for colours, spacing, and typography. Supports `light-dark()` for automatic dark/light mode. Fluid typography using clamp and viewport-based scaling.
2. **Legacy** (`src/styles/global.css`): Tailwind CSS utility classes, used by the older Layout.astro.

Fonts: Space Grotesk (sans) and Space Mono (monospace), loaded from fonts.bunny.net.

## Code Style

- Astro components use scoped `<style>` blocks
- Svelte 5 components use `$state` runes
- Dates are formatted with `en-GB` locale throughout
- TypeScript strict mode (`astro/tsconfigs/strict`)
- JSX uses React (`jsxImportSource: "react"`) for Keystatic compatibility
- Content uses MDX format across all collections

# joeinn.es

Personal website for Joe Innes. Includes a blog, short-form notes (smidgeons), an open source contributions log, CV, contact form, and a /now page.

## Tech Stack

- [Astro 5](https://astro.build/) with React and Svelte integrations
- [Keystatic](https://keystatic.com/) for content management (GitHub storage backend)
- [Tailwind CSS 4](https://tailwindcss.com/)
- MDX for content authoring
- Deployed on [Vercel](https://vercel.com/)

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The site will be available at [http://localhost:4321](http://localhost:4321).

Build for production:

```bash
npm run build
```

Preview a production build locally:

```bash
npm run preview
```

## Content Management

Content is managed through [Keystatic CMS](https://keystatic.com/). During development, the admin UI is available at [http://localhost:4321/keystatic](http://localhost:4321/keystatic).

### Collections

- **Blog Posts** (`src/content/posts/`) -- Long-form articles with optional featured images and custom accent colours.
- **Smidgeons** (`src/content/smidgeons/`) -- Short-form notes and observations, inspired by [Maggie Appleton's smidgeons](https://maggieappleton.com/smidgeons).
- **I Shipped** (`src/content/i-shipped/`) -- A log of open source contributions, linking to GitHub pull requests.

### Singletons

- **Now** (`src/content/now`) -- Content for the /now page, describing what Joe is currently up to.

## Pages

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/blog` | Blog listing with search |
| `/blog/:slug` | Individual blog post |
| `/smidgeons` | Paginated short-form notes |
| `/i-shipped` | Open source contributions log |
| `/cv` | Downloadable CV |
| `/contact` | Contact form |
| `/now` | What Joe is up to now |

import { config, fields, collection, singleton } from "@keystatic/core";

export default config({
  storage: {
    kind: "github",
    repo: `joeinnes/joeinn.es`,
  },
  ui: {
    brand: {
      name: "Joe Innes",
      mark: () => <img src="/favicon-32x32.png" height={24} />,
    },
  },
  collections: {
    posts: collection({
      columns: ["title", "date"],
      label: "Blog Posts",
      slugField: "title",
      path: "src/content/posts/*",
      entryLayout: "content",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({
          label: "Date",
        }),
        date_updated: fields.date({
          label: "Date",
          validation: {
            isRequired: false,
          },
        }),
        tags: fields.ignored(),
        draft: fields.checkbox({
          label: "Draft",
        }),
        slug: fields.ignored(),
        page_bg: fields.text({ label: "Page Background" }),
        excerpt: fields.text({ label: "Excerpt", multiline: true }),
        featured_image: fields.image({
          label: "Featured Image",
          directory: "./public",
          publicPath: "",
        }),
        content: fields.mdx({
          label: "Content",
          options: {
            image: {
              directory: "./public",
              publicPath: "",
            },
          },
        }),
      },
    }),
    smidgeons: collection({
      columns: ["summary", "created"],
      label: "Smidgeons",
      slugField: "summary",
      path: "src/content/smidgeons/*",
      format: { contentField: "content" },
      schema: {
        summary: fields.slug({ name: { label: "Summary" } }),
        created: fields.date({
          label: "Date",
        }),
        content: fields.mdx({
          label: "Content",
          options: {
            image: {
              directory: "./public",
              publicPath: "",
            },
          },
        }),
      },
    }),
    shipped: collection({
      columns: ["repo", "mergeDate"],
      label: "I Shipped...",
      slugField: "link",
      path: "src/content/i-shipped/*",
      format: { contentField: "content" },
      schema: {
        lastCommit: fields.date({ label: "Last Commit" }),
        repo: fields.text({ label: "Repository" }),
        mergeDate: fields.date({ label: "Last Commit" }),
        prNumber: fields.number({ label: "PR Number" }),
        link: fields.text({ label: "Link" }),
        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: "./public",
              publicPath: "",
            },
          },
          extension: "md",
        }),
      },
    }),
  },
  singletons: {
    now: singleton({
      label: "Now",
      path: "src/content/now",
      schema: {
        now: fields.mdx({
          label: "Now",
        }),
        date: fields.date({ label: "Date" }),
      },
    }),
  },
});

import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    posts: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({
          label: 'Date'
        }),
        page_bg: fields.text({ label: 'Page Background' }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
        featured_image: fields.image({
          label: 'Featured Image',
          directory: './public',
          publicPath: '',
        }),
        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: './public',
              publicPath: '',
            },
          },
        }),
      },
    }),
  },
});

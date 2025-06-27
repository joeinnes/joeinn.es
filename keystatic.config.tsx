import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: {
      name: 'Joe Innes',
      mark: () => (<img src="/favicon-32x32.png" height = {24} />)
  }
  },
collections: {
  posts: collection({
    columns: ['title', 'date'],
    label: 'Blog Posts',
    slugField: 'title',
    path: 'src/content/posts/*',
    entryLayout: 'content',
    format: { contentField: 'content' },
    schema: {
      title: fields.slug({ name: { label: 'Title' } }),
      date: fields.date({
        label: 'Date'
      }),
      date_updated: fields.date({
        label: 'Date',
        validation: {
          isRequired: false,
        }
      }),
      tags: fields.ignored(),
      draft: fields.checkbox({
        label: 'Draft',
      }),
      slug: fields.ignored(),
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
  smidgeons: collection({
    columns: ['summary', 'created'],
    label: 'Smidgeons',
    slugField: 'summary',
    path: 'src/content/smidgeons/*',
    format: { contentField: 'content' },
    schema: {
      summary: fields.slug({ name: { label: 'Summary' } }),
      created: fields.date({
        label: 'Date',
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
    }
  })
}
});

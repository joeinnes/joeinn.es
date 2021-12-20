import remarkGithub from 'remark-github';
import remarkAbbr from 'remark-abbr';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { visit } from 'unist-util-visit';

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
function increaseHeadings() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'heading') {
        node.depth += 2;
      }
    });
  };
}

export const mdsvexConfig = {
  extensions: ['.svelte.md', '.md', '.svx'],
  smartypants: {
    dashes: 'oldschool'
  },
  remarkPlugins: [
    remarkGithub({ repository: 'https://github.com/joeinnes/joeinn.es' }),
    remarkAbbr,
    increaseHeadings
  ],
  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  layout: {
    _: './src/lib/BlogLayout.svelte'
  }
};

import { json } from '@sveltejs/kit';
import { convert } from 'html-to-text';

async function getPosts() {
	/** type Post[] */
	let posts = [];

	const paths = import.meta.glob('/src/content/blog/*.*', { eager: true });

	for (const path in paths) {
		/** @typedef {{ metadata: any, default: import('svelte').SvelteComponent}} file */
		const file = /** @type file */ (paths[path]);
		const excerptArr = convert(file.default.render().html, {
			wordwrap: false
		})
			.split(' ')
			.slice(0, 50);
		const excerpt = excerptArr.length === 50 ? excerptArr.join(' ') + '…' : excerptArr.join(' ');
		const slug = path.split('/').at(-1)?.replace(/\..*/, '');
		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = /** @type Omit<Post, 'slug'> */ (file.metadata);
			const post = { excerpt, ...metadata, slug };
			post.date && posts.push(post);
		}
	}

	posts = posts.sort(
		(first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
	);

	return posts;
}

export async function GET() {
	const posts = await getPosts();
	return json(posts);
}

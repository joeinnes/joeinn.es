import { json } from '@sveltejs/kit';

async function getPosts() {
	/** type Post[] */
	let posts = [];

	const paths = import.meta.glob('/src/content/blog/*.*', { eager: true });

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace(/\..*/, '');
		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = /** @type Omit<Post, 'slug'> */ (file.metadata);
			const post = { ...metadata, slug };
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

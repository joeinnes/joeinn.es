import { error } from '@sveltejs/kit';

/** @param {string} path */
const slugFromPath = (path) => path.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1] ?? null;

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const modules = import.meta.glob(`/src/content/blog/*.{md,mdx}`);

	//: { path?: string; resolver?: App.MdsvexResolver }
	let match = {};
	for (const [path, resolver] of Object.entries(modules)) {
		if (slugFromPath(path) === params.slug) {
			match = { path, resolver };
			break;
		}
	}
	const post = await match?.resolver?.();
	if (!post) {
		throw error(404); // Couldn't resolve the post
	}

	return {
		component: post.default,
		frontmatter: post.metadata
	};
}

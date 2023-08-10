import { error } from '@sveltejs/kit';

/** @param {string} path */
const slugFromPath = (path) => path.match(/([\w-]+)\.(svelte\.md|md|svx)/i)?.[1] ?? null;

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const modules = import.meta.glob(`/src/content/blog/*.{md,mdx}`);

	if (!modules) {
		throw error(404); // Couldn't resolve the post
	}

	const posts = (
		await Promise.all(
			Object.entries(modules).map(async (module) => {
				const entry = await module[1]();
				const path = module[0];
				const slug = slugFromPath(path);
				return {
					...entry,
					path,
					slug
				};
			})
		)
	).sort((postA, postB) =>
		new Date(postA.metadata.date) > new Date(postB.metadata.date) ? -1 : 1
	);
	return { posts, bgOverride: 'white' };
}

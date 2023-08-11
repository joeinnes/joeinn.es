import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	try {
		const post =
			(await import(`/src/content/blog/${params.slug}.md`)) ||
			(await import(`/src/content/blog/${params.slug}.mdx`));

		return {
			content: post.default,
			meta: post.metadata
		};
	} catch (e) {
		throw error(404, `Could not find ${params.slug}`);
	}
}

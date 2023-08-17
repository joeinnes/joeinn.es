export const prerender = false;
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	let post;
	try {
		post = await import(`../../../content/pages/${params.slug}.md`);
		return {
			content: post.default,
			meta: post.metadata
		};
	} catch (e) {
		try {
			post = await import(`../../../content/pages/${params.slug}.mdx`);
			return {
				content: post.default,
				meta: post.metadata
			};
		} catch (e) {
			console.error(e);
			throw error(404, `Could not find ${params.slug}`);
		}
	}
}

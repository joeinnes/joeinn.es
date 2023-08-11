import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	try {
		const response = await fetch('api/blog');
		/** @type Post[] */
		const posts = await response.json();
		return { posts, bgOverride: 'white' };
	} catch (e) {
		console.error(e);
		throw error(500);
	}
}

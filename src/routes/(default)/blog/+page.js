import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	try {
		const response = await fetch('api/blog');
		/** @type Post[] */
		const posts = await response.json();
		return {
			posts: posts.filter((el) => !el.draft && new Date(el.date) < new Date()),
			bgOverride: 'white'
		};
	} catch (e) {
		console.error(e);
		error(500);
	}
}

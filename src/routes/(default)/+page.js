import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load() {
	let content;
	try {
		content = await import('../../content/homepage.json');
		return {
			content: content.default
		};
	} catch (e) {
		console.error(e);
		error(500, `Something went wrong.`);
	}
}

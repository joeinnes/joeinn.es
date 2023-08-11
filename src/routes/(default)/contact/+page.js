/** @type {import('./$types').PageLoad} */
export const prerender = false;
export async function load() {
	return { bgOverride: 'white' };
}

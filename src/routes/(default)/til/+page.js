/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch }) => {
	const fetchedTils = await fetch(
		'https://api.joeinn.es/api/collections/til/records?sort=-created'
	);
	const tils = await fetchedTils.json();
	return tils;
};

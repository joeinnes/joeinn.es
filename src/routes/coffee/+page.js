/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	const response = await fetch('api/coffee');
	/** @type Coffee[] */
	const coffees = await response.json();
	return {
		coffees
	};
}

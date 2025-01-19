import { json } from '@sveltejs/kit';

async function getCoffees() {
	/** type Coffee[] */
	let coffees = [];

	const paths = import.meta.glob('/src/content/coffees/*.*', { eager: true });

	for (const path in paths) {
		/** @typedef {{ metadata: any, default: import('svelte').SvelteComponent}} file */
		const file = /** @type file */ (paths[path]);

		const slug = path.split('/').at(-1)?.replace(/\..*/, '');
		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = /** @type Omit<Coffee, 'slug'> */ (file.metadata);
			const coffee = {
				...metadata,
				slug,
				body: ""
			};
			coffee.date && coffees.push(coffee);
		}
	}

	coffees = coffees.sort(
		(first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
	);

	return coffees;
}

export async function GET() {
	const coffees = await getCoffees();
	return json(coffees);
}

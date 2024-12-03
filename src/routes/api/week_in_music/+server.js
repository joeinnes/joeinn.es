import { SECRET_CODE } from '$env/static/private';
import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const response = await fetch(
		'https://api.innes.hu/api/collections/week_in_music/records?sort=-created&page=1&perPage=1'
	);
	const records = await response.json();
	const file = `https://api.innes.hu/api/files/week_in_music/${records.items[0].id}/${records.items[0].image}`;
	const res = await fetch(file);
	return res;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const code = request.headers.get('code');
		if (!request.body) error(400, 'What have you done?');
		if (code !== SECRET_CODE) error(401, `Sorry Dave, I can't let you do that.`);
		const image = await request.blob();
		const formData = new FormData();
		if (image && typeof image !== 'string') {
			formData.append('image', image);
		}

		const response = await fetch('https://api.innes.hu/api/collections/week_in_music/records', {
			method: 'POST',
			headers: {
				code
			},
			body: formData
		});
		const jsonVal = await response.json();
		return json(jsonVal, { status: 200 });
	} catch (e) {
		console.error(e);
		error(500, `Not quite sure what happened, but that didn't work.`);
	}
}

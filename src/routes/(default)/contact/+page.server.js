export const prerender = false;

import { CONTACT_WEBHOOK_URL } from '$env/static/private';

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
		try {
			const data = await request.formData();
			const from = data.get('from');
			const subject = data.get('subject');
			const body = data.get('body');
			const email = {
				from,
				subject,
				body
			};

			await fetch(CONTACT_WEBHOOK_URL, {
				method: 'POST',
				body: JSON.stringify(email)
			});
			return 'NICE';
		} catch (e) {
			console.error(e);
		}
	}
};

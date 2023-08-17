// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

declare global {
	type Post = {
		slug: string,
		layout?: string,
		title: string,
		date: string,
		date_updated?: string,
		featured_image?: string,
		page_bg?: string,
		excerpt?: string
		draft?: boolean
	}
	type Coffee = {
		title: string;
		date: string;
		date_updated: string;
		featured_image: string;
		cost: string;
		rating: string;
		body: {
			css: string;
			html: string;
		};
	}
}
export { };

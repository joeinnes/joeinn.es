<script>
	import dayjs from 'dayjs';
	import Signature from '$components/blog-widgets/Signature.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

{#if data.component}
	<article
		class="prose lg:prose-xl prose-headings:font-bold prose-zinc rounded-xl mx-auto shadow-2xl relative overflow-hidden bg-white"
		style="width: min(65ch, 100%);"
	>
		<div class="aspect-[21/9] header-image content not-prose shadow">
			<img
				alt={data.frontmatter.title}
				src={data.frontmatter.featured_image ||
					'https://source.unsplash.com/random/?' + encodeURIComponent(data.frontmatter.title)}
				style="padding: 0px"
				class="aspect-[21/9] object-cover rounded-none"
			/>
		</div>

		<hgroup class="content meta">
			<h1>{data.frontmatter.title}</h1>
			<small>{dayjs(data.frontmatter.date).format('dddd D MMM YYYY, h:mm a')}</small>
		</hgroup>

		<div class="content">
			<svelte:component this={data.component} />

			<div class="flex justify-end" style={`grid-column: 2; color: ${data.frontmatter.page_bg}`}>
				<Signature />
			</div>
		</div>
	</article>
{/if}

<style lang="postcss">
	:global(.content.header-image) {
		@apply py-0;
	}
	:global(.content) {
		@apply grid pt-4 pb-8;
		grid-template-columns: 1fr min(55ch, 100%) 1fr;
	}

	:global(.content > *) {
		@apply px-4;
		grid-column: 2;
	}

	:global(.content.meta h1) {
		@apply mb-2;
	}

	:global(hgroup.content.meta) {
		@apply pb-0;
	}

	:global(.content > picture) {
		@apply p-0;
	}

	:global(picture, img, .full-bleed, p:has(img), .content > p:has(img)) {
		@apply max-w-full w-full p-0 rounded-none;
		grid-column: 1 / -1 !important;
	}
</style>

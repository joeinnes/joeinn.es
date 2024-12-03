<script>
	import Menu from '$components/Menu.svelte';
	import Footer from '$components/Footer.svelte';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<div class="flex flex-col items-center gap-4">
	<Menu />

	<main
		class="prose md:prose-xl mx-auto flex flex-col justify-center px-4 relative max-md:max-w-full pb-8 w-full"
	>
		{@render children?.()}
	</main>

	<Footer />
</div>

<style lang="postcss">
	div {
		@apply font-sans bg-cover bg-center transition-colors min-h-screen;
	}
</style>

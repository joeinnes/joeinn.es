<script>
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<main class="px-4 pb-8 pt-8 container mx-auto grid place-items-center">
	{@render children?.()}
</main>

<script>
	import Menu from '$components/Menu.svelte';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<div class="flex flex-col h-screen w-screen items-center gap-4">
	<Menu />
	<div class="flex-1 relative w-full">
		{@render children?.()}
	</div>
</div>

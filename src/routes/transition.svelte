<script>
	import { blur } from 'svelte/transition';

	
	/**
	 * @typedef {Object} Props
	 * @property {any} url
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { url, children } = $props();
</script>

{#key url}
	<div class="transition" in:blur>
		{@render children?.()}
	</div>
{/key}

<style>
	.transition {
		height: 100%;
	}
</style>

<script>
	import { blur } from 'svelte/transition';

	/** @type string */
	export let url;
</script>

{#key url}
	<div class="transition" transition:blur>
		<slot />
	</div>
{/key}

<style>
	.transition {
		height: 100%;
	}
</style>

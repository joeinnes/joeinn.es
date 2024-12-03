<script>
	
	/**
	 * @typedef {Object} Props
	 * @property {any} results
	 */

	/** @type {Props} */
	let { results } = $props();
</script>

<div class="not-prose standings">
	{#each results as driver, i}
		<div class="result {i % 2 === 0 ? 'odd' : 'even'}">
			<div class="inline-block pos">{(i + 1 + '').padStart(2, '0')}.</div>
			<h2>{driver}</h2>
		</div>
	{/each}
</div>

<style>
	h2 {
		@apply inline-block rounded-tl-xl px-1 border-l-8 border-t-8 border-[#e10600];
	}

	.standings {
		@apply grid grid-cols-2 mb-8;
	}

	.result {
		@apply flex items-center;
	}

	.even {
		@apply pt-8;
	}

	.odd:is(:global(:last-child)) {
		@apply pt-4;
	}

	.pos {
		/* Invisible border to make sure positions are correct */
		@apply border-t-8 border-[#ffff0000] pr-1;
	}
</style>

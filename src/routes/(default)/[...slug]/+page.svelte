<script>
	
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();
</script>

<h1
	class="text-3xl lg:text-5xl font-bold"
	style="margin-bottom: 0; /* Again, override Tailwind's high specificity on prose */"
>
	{data.meta?.title}
</h1>
{#if data.meta?.date}
	<small class="text-gray-500"
		>Last updated on {new Date(data.meta?.date).toLocaleDateString('en-gb', {
			weekday: 'long',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})}</small
	>
{/if}
<data.content />

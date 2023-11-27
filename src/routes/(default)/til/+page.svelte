<script>
	import { ArrowLeft, ArrowRight } from 'lucide-svelte';

	export let data;
	$: tils = data?.items || [];
</script>

<h1 class="text-3xl lg:text-5xl font-bold w-full text-center">Today I Learned</h1>
<div class="divide-y text-lg">
	{#each tils as til}
		<div class="py-2">
			<p class="not-prose">{til.summary}</p>
			{#if til.details}
				<div class="text-sm">
					{@html til.details}
				</div>
			{/if}
			<small class="text-gray-500"
				>{new Date(til.created).toLocaleDateString('en-GB', {
					weekday: 'short',
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})}</small
			>
		</div>
	{/each}
</div>
{#if data.totalPages > 0}
	<nav class="flex gap-4 justify-center items-center">
		{#if data.page > 1}
			<button
				class="flex gap-2 items-center p-2 px-4 no-underline bg-gray-200 border-gray-900 text-gray-600 rounded self-center hover:bg-gray-400 hover:text-gray-100 focus:bg-gray-400 transition-colors"
				><ArrowLeft />Prev</button
			>
		{/if}
		Page {data.page} of {data.totalPages}
		{#if data.page < data.totalPages}
			<button
				class="flex gap-2 items-center p-2 px-4 no-underline bg-primary-700 text-white rounded self-center hover:bg-primary-900 focus:bg-primary-900 transition-colors"
				>Next <ArrowRight /></button
			>
		{/if}
	</nav>
{/if}

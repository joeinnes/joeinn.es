<script>
  import { onMount } from 'svelte';
  let tils = $state([]);
  const perPage = 30;
  let page = $state(1);

  $effect(async () => {
    const fetchedTils = await fetch(
		`https://api.joeinn.es/api/collections/til/records?sort=-created&page=${page}`
	  );
	  tils = await fetchedTils.json();
  })

	import { ArrowLeft, ArrowRight } from 'lucide-svelte';
</script>

<h1 class="text-3xl lg:text-5xl font-bold w-full text-center">Smidgeons</h1>
<p class="text-sm text-center w-full">Inspired by <a href="https://maggieappleton.com/smidgeons" target="_blank">Maggie Appleton's smidgeons</a>
<div class="divide-y text-lg">
	{#each tils.items as til, i (i)}
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
				})}</small
			>
		</div>
	{/each}
</div>
{#if tils.totalPages > 0}
	<nav class="flex gap-4 justify-center items-center">
		{#if tils.page > 1}
			<button
				class="flex gap-2 items-center p-2 px-4 no-underline bg-gray-200 border-gray-900 text-gray-600 rounded self-center hover:bg-gray-400 hover:text-gray-100 focus:bg-gray-400 transition-colors"
				onclick={() => page-- }><ArrowLeft />Prev</button
			>
		{/if}
		Page {tils.page} of {tils.totalPages}
		{#if tils.page < tils.totalPages}
			<button
				class="flex gap-2 items-center p-2 px-4 no-underline bg-primary-700 text-white rounded self-center hover:bg-primary-900 focus:bg-primary-900 transition-colors"
				onclick={() => page++}>Next <ArrowRight /></button
			>
		{/if}
	</nav>
{/if}



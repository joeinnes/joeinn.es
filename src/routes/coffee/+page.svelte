<script>
	let { data } = $props();
	const { coffees } = data;
</script>

<div class="min-h-screen container-div w-screen">
	<main class="pt-8">
		<h1 class="text-8xl text-yellow-100 font-[Ramaraja]">Coffees</h1>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
			{#each coffees as coffee}
				<article class="bg-white text-black rounded-lg shadow-lg p-2">
					<h2>{coffee.title}</h2>
					<small>{coffee.date}</small>
					{@html coffee.body?.html}
				</article>
			{/each}
		</div>
	</main>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Ramaraja&display=swap');

	.container-div {
		background-color: hsl(25, 34%, 15%);
	}
	main {
		@apply max-w-[70ch] mx-auto;
	}
</style>

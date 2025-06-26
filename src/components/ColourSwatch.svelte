<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [h]
	 * @property {number} [s]
	 * @property {number} [l]
	 */

	/** @type {Props} */
	let { h = 0, s = 0, l = 0 } = $props();
	const range = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
</script>

<div class="flex">
	<div class="aspect-square mr-2 h-full" style="background: hsl({h}, {s}%, {l}%"></div>
	<div class="flex flex-1 flex-col justify-between h-full">
		<div class="grid grid-cols-11 flex-1 items-start">
			{#each range as val}
				<div
					class="aspect-square grid place-content-center"
					style="background: hsl({h}, {s}%, {val}%);"
				>
					<span style="color: {val > 50 ? 'black' : 'white'}">{val}</span>
				</div>
			{/each}
		</div>
		<div class="grid grid-cols-11 flex-1 items-center">
			{#each range as val}
				<div
					class="aspect-square grid place-content-center"
					style="background: hsl({h}, {val}%, {s}%"
				>
					<span style="color: {val > 50 ? 'black' : 'white'}">{val}</span>
				</div>
			{/each}
		</div>
		<div class="grid grid-cols-11 flex-1 items-end">
			{#each range as val}
				<div
					class="aspect-square grid place-content-center"
					style="background: hsl({h}, {20}%, {val}%"
				>
					<span style="color: {val > 50 ? 'black' : 'white'}">{val}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

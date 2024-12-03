<script>
	
	
	
	
	/**
	 * @typedef {Object} Props
	 * @property {any} fontName
	 * @property {any} fontSrc
	 * @property {string} [wordTest]
	 * @property {any} pinHue
	 */

	/** @type {Props} */
	let {
		fontName,
		fontSrc,
		wordTest = 'Be Traist',
		pinHue
	} = $props();
	let lowercase = $state('');
	for (let i = 0; i < 26; i++) {
		lowercase += String.fromCharCode(97 + i);
	}
	// I'll calculate the colour's hue by adding up the character codes in the font's name, and then working out the remainder if you divide by 360 (as in, 360 degrees)
	const color =
		pinHue || fontName.split('').reduce((acc, cur) => (acc += cur.charCodeAt(0)), 0) % 360;
</script>

<svelte:head>
	{#if fontSrc}<link href={fontSrc} rel="stylesheet" />{/if}
</svelte:head>
{#if fontName}
	<div
		class="panel"
		style="background-color: hsl({color}, 50%, 90%); color: hsl({color}, 50%, 10%); font-family: '{fontName}'"
	>
		<div class="top">
			<p class="mb-8">{fontName}</p>
			<div class="demo-letters">
				<div class="flex-1 pb-8">
					<p class="mb-4">Aa Ee Rr</p>
					<p class="font-bold">Aa Ee Rr</p>
				</div>
				<div class="single">
					<svg viewBox="0 0 30 35">
						<text x="0" y="30" fill="white">a</text>
					</svg>
				</div>
			</div>
			<p class="text-right tracking-widest" style="color: hsl({color}, 50%, 60%)">{wordTest}</p>
		</div>
		<div class="bottom" style="background-color: hsl({color}, 50%, 60%)">
			<p class="mb-8">{lowercase}</p>
			<p class="text-right text-white">0123456789</p>
		</div>
	</div>
{/if}

<style>
	.top {
		@apply p-6 text-6xl;
	}
	.demo-letters {
		@apply flex items-center justify-between gap-2;
	}
	.single {
		@apply text-white w-full h-full max-w-[25%];
	}
	.bottom {
		@apply tracking-widest text-6xl p-6;
		overflow-wrap: break-word;
	}
</style>

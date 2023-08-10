<script>
	let lengthMins = 2;
	let setLength = false;
	let secondsRemaining = 0;

	/**
	 * @type {number | null}
	 */
	let interval;
	let size = 0;

	const startPomodoro = () => {
		if (!secondsRemaining) {
			secondsRemaining = lengthMins * 60;
		}
		interval = setInterval(() => {
			if (!secondsRemaining && interval) {
				clearInterval(interval);
				interval = null;
				return;
			}
			secondsRemaining--;
		}, 1000);
	};

	const pausePomodoro = () => {
		if (interval) {
			clearInterval(interval);
			interval = null;
		} else {
			startPomodoro();
		}
	};
</script>

<div
	class="aspect-square timer w-full mb-4"
	style="--percent: {secondsRemaining / (lengthMins * 60)}; --size: {size}"
	bind:clientWidth={size}
>
	{secondsRemaining}s
</div>

{#if setLength}
	<input bind:value={lengthMins} type="number" />
{/if}

<div class="flex gap-2 justify-center">
	<button on:click={() => startPomodoro()}>Start</button>
	<button on:click={() => pausePomodoro()} disabled={!secondsRemaining}
		>{interval ? 'Pause' : 'Resume'}</button
	>
	<button on:click={() => (secondsRemaining = lengthMins * 60)}>Reset</button>
	<button on:click={() => (setLength = !setLength)}>Change Length</button>
</div>

<style lang="postcss">
	.timer {
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: radial-gradient(closest-side, white 80%, #ef444455 0 100%),
			conic-gradient(#ef4444 calc(var(--percent) * 100%), transparent 0);
		font-family: Helvetica, Arial, sans-serif;
		font-size: calc(var(--size) / 5);
		color: var(--tw-prose-body);
	}

	button {
		@apply bg-red-300 text-red-900 px-2 rounded-lg hover:bg-red-500 hover:text-red-50;
	}
</style>

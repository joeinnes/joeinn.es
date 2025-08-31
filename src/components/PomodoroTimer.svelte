<script>
  let lengthMins = $state(2);
  let setLength = $state(false);
  let secondsRemaining = $state(0);

  /**
   * @type {number | null}
   */
  let interval = $state();
  let size = $state(0);

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
  class="w-full mb-4 aspect-square timer"
  style="--percent: {secondsRemaining / (lengthMins * 60)}; --size: {size}"
  bind:clientWidth={size}
>
  {secondsRemaining}s
</div>

{#if setLength}
  <input bind:value={lengthMins} type="number" />
{/if}

<div class="flex justify-center gap-2">
  <button onclick={() => startPomodoro()}>Start</button>
  <button onclick={() => pausePomodoro()} disabled={!secondsRemaining}
    >{interval ? "Pause" : "Resume"}</button
  >
  <button onclick={() => (secondsRemaining = lengthMins * 60)}>Reset</button>
  <button onclick={() => (setLength = !setLength)}>Change Length</button>
</div>

<style lang="postcss">
  @reference 'tailwindcss';
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

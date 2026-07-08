<script>
	import { onMount } from 'svelte';
	import { fetchLatestTrack, fetchCurrentBook } from '../lib/now';

	// Seeded from the server for an instant first paint; onMount refreshes to live.
	let { initialTrack = null, initialBook = null } = $props();
	let track = $state(initialTrack);
	let book = $state(initialBook);

	onMount(async () => {
		const [t, b] = await Promise.allSettled([fetchLatestTrack(), fetchCurrentBook()]);
		if (t.status === 'fulfilled' && t.value) track = t.value;
		if (b.status === 'fulfilled' && b.value) book = b.value;
	});

	function hideImg(e) {
		e.currentTarget.style.display = 'none';
	}
</script>

{#if track || book}
	<div class="right-now">
		<span class="rn-eyebrow">Right now</span>
		<div class="rn-items">
			{#if book}
				<div class="rn-item">
					<div class="rn-cover book">
						{#if book.cover}
							<img src={book.cover} alt={book.title} loading="lazy" onerror={hideImg} />
						{/if}
						<span class="rn-cover-fallback">{book.title[0] ?? '?'}</span>
					</div>
					<div class="rn-info">
						<span class="rn-label">Reading</span>
						<span class="rn-title">{book.title}</span>
						{#if book.author}<span class="rn-sub">{book.author}</span>{/if}
					</div>
				</div>
			{/if}

			{#if track}
				<div class="rn-item">
					<div class="rn-cover track">
						{#if track.cover}
							<img src={track.cover} alt={track.name} loading="lazy" onerror={hideImg} />
						{/if}
						<span class="rn-cover-fallback">&#9835;</span>
					</div>
					<div class="rn-info">
						<span class="rn-label">Listening</span>
						<span class="rn-title">{track.name}</span>
						{#if track.artist}<span class="rn-sub">{track.artist}</span>{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.right-now {
		display: flex;
		flex-direction: column;
		gap: calc(var(--inline-spacing) * 3);
		margin-block-end: var(--layout-spacing);
		padding: calc(var(--inline-spacing) * 4);
		border-radius: var(--border-radius);
		border: 1px solid var(--very-muted);
		background: color-mix(in hsl, var(--primary) 4%, var(--background) 96%);
	}
	.right-now * {
		padding-block-start: 0;
	}
	.rn-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--muted);
	}
	.rn-items {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--layout-spacing);
		align-items: center;
	}
	.rn-item {
		display: flex;
		align-items: center;
		gap: calc(var(--inline-spacing) * 3);
		min-width: 0;
	}
	/* divider between the two columns */
	.rn-item + .rn-item {
		border-inline-start: 1px solid var(--very-muted);
		padding-inline-start: var(--layout-spacing);
	}
	/* stack into one column on narrow screens, divider goes horizontal */
	@media (max-width: 32rem) {
		.rn-items {
			grid-template-columns: 1fr;
		}
		.rn-item + .rn-item {
			border-inline-start: none;
			padding-inline-start: 0;
			border-block-start: 1px solid var(--very-muted);
			padding-block-start: var(--layout-spacing);
		}
	}
	.rn-cover {
		position: relative;
		flex-shrink: 0;
		border-radius: calc(var(--border-radius) / 1.5);
		overflow: hidden;
		background: color-mix(in hsl, var(--foreground) 10%, var(--background) 90%);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
	}
	.rn-cover.book {
		width: 3.25em;
		aspect-ratio: 2 / 3;
	}
	.rn-cover.track {
		width: 3.75em;
		aspect-ratio: 1;
	}
	.rn-cover img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 1;
		/* Hide the alt text while the cover loads; the fallback glyph shows behind. */
		color: transparent;
	}
	.rn-cover-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		color: var(--muted);
	}
	.rn-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.rn-label {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--primary);
	}
	.rn-title {
		font-weight: 700;
		font-size: 0.9em;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.rn-sub {
		color: var(--muted);
		font-size: 0.78em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>

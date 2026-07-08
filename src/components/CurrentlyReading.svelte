<script>
	import { onMount } from 'svelte';
	import { fetchCurrentBook } from '../lib/now';

	// Seeded from the server for an instant first paint; onMount refreshes to live.
	let { initialBook = null } = $props();
	let book = $state(initialBook);

	onMount(async () => {
		try {
			book = (await fetchCurrentBook()) ?? book;
		} catch {
			// Nice-to-have; fail silently.
		}
	});

	function handleImgError(e) {
		e.currentTarget.style.display = 'none';
	}
</script>

{#if book}
	<h2>Reading...</h2>
	<div class="book">
		<div class="book-cover">
			{#if book.cover}
				<img src={book.cover} alt={book.title} loading="lazy" onerror={handleImgError} />
			{/if}
			<div class="book-cover-fallback">{book.title[0] ?? '?'}</div>
		</div>
		<div class="book-info">
			<span class="name">{book.title}</span>
			{#if book.author}
				<span class="author">{book.author}</span>
			{/if}
			{#if book.progress?.percent != null}
				<progress max="100" value={book.progress.percent}></progress>
				<span class="progress-label">
					{book.progress.percent}%{book.progress.currentPage && book.progress.totalPages
						? ` · p. ${book.progress.currentPage} of ${book.progress.totalPages}`
						: ''}
				</span>
			{/if}
		</div>
	</div>
{/if}

<style>
	.book {
		display: flex;
		gap: calc(var(--inline-spacing) * 4);
		align-items: flex-start;
	}
	.book * {
		padding-block-start: 0;
	}
	.book-cover {
		position: relative;
		flex-shrink: 0;
		width: 7rem;
		aspect-ratio: 2 / 3;
		border-radius: var(--border-radius);
		overflow: hidden;
		background: color-mix(in hsl, var(--foreground) 10%, var(--background) 90%);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
	}
	.book-cover img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 1;
		/* Hide the alt text while the cover loads; the fallback glyph shows behind. */
		color: transparent;
	}
	.book-cover-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.5em;
		color: var(--muted);
	}
	.book-info {
		display: flex;
		flex-direction: column;
		gap: calc(var(--inline-spacing) * 2);
		min-width: 0;
	}
	.name {
		font-weight: 700;
		line-height: 1.2;
	}
	.author {
		color: var(--muted);
		font-size: 0.85em;
	}
	progress {
		width: 100%;
		max-width: 16rem;
		accent-color: var(--primary);
	}
	.progress-label {
		color: var(--muted);
		font-size: 0.75em;
	}
</style>

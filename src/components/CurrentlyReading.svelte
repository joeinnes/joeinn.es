<script>
	import { onMount } from 'svelte';

	const HANDLE = 'joeinn.es';
	const COLLECTION = 'buzz.bookhive.book';
	const PDS = 'https://bsky.social';
	const READING = 'buzz.bookhive.defs#reading';

	let books = $state([]);

	// Records are returned as at://did:plc:.../buzz.bookhive.book/<rkey>;
	// the DID is needed to fetch the cover blob.
	function didFromUri(uri) {
		const m = /^at:\/\/(did:[^/]+)\//.exec(uri ?? '');
		return m ? m[1] : null;
	}

	// The cover is a blob on the record; resolve it via getBlob on the PDS.
	function coverUrl(did, cover) {
		const cid = cover?.ref?.$link;
		if (!did || !cid) return null;
		return `${PDS}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${encodeURIComponent(cid)}`;
	}

	// authors is a single tab-separated string in the lexicon
	function authorList(authors) {
		if (typeof authors !== 'string') return '';
		return authors.split('\t').filter(Boolean).join(', ');
	}

	onMount(async () => {
		try {
			const params = new URLSearchParams({
				repo: HANDLE,
				collection: COLLECTION,
				limit: '100',
			});
			const res = await fetch(`${PDS}/xrpc/com.atproto.repo.listRecords?${params}`);
			if (!res.ok) return;
			const data = await res.json();
			books = (data.records ?? [])
				.filter((r) => r.value?.status === READING)
				.map((r) => {
					const did = didFromUri(r.uri);
					return {
						title: r.value.title ?? 'Untitled',
						authors: authorList(r.value.authors),
						cover: coverUrl(did, r.value.cover),
					};
				});
		} catch {
			// Nice-to-have; fail silently.
		}
	});

	function handleImgError(e) {
		e.currentTarget.style.display = 'none';
	}
</script>

{#if books.length > 0}
	<h2>Reading...</h2>
	<ul class="reading-grid">
		{#each books as book}
			<li class="book">
				<div class="book-cover">
					{#if book.cover}
						<img src={book.cover} alt={book.title} loading="lazy" onerror={handleImgError} />
					{/if}
					<div class="book-cover-fallback">{book.title[0] ?? '?'}</div>
				</div>
				<div class="book-info">
					<span class="name">{book.title}</span>
					{#if book.authors}
						<span class="author">{book.authors}</span>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.reading-grid {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
		gap: calc(var(--inline-spacing) * 4);
	}
	.reading-grid * {
		padding-block-start: 0;
	}
	.book {
		display: flex;
		flex-direction: column;
		gap: calc(var(--inline-spacing) * 2);
	}
	.book-cover {
		position: relative;
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
		min-width: 0;
	}
	.name {
		font-weight: 700;
		font-size: 0.85em;
		line-height: 1.2;
	}
	.author {
		color: var(--muted);
		font-size: 0.75em;
	}
</style>

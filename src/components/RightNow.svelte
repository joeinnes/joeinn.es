<script>
	import { onMount } from 'svelte';

	const HANDLE = 'joeinn.es';
	const PDS = 'https://bsky.social';
	const PLAY_COLLECTION = 'fm.teal.alpha.feed.play';
	const BOOK_COLLECTION = 'buzz.bookhive.book';
	const READING = 'buzz.bookhive.defs#reading';
	const COVER_ART_BASE = 'https://coverartarchive.org/release';

	let track = $state(null);
	let book = $state(null);

	// --- music cover: MusicBrainz id (prefixed "mbid:") via Cover Art Archive ---
	const MBID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	function trackCover(raw) {
		if (typeof raw !== 'string') return null;
		const id = raw.replace(/^mbid:/i, '').trim();
		return MBID_RE.test(id) ? `${COVER_ART_BASE}/${id}/front-250` : null;
	}
	function artistNames(t) {
		if (t?.artists?.length) return t.artists.map((a) => a.artistName).join(', ');
		if (t?.artistNames?.length) return t.artistNames.join(', ');
		return '';
	}

	// --- book cover: blob resolved via getBlob (DID parsed from the record uri) ---
	function bookCover(uri, cover) {
		const did = /^at:\/\/(did:[^/]+)\//.exec(uri ?? '')?.[1];
		const cid = cover?.ref?.$link;
		if (!did || !cid) return null;
		return `${PDS}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${encodeURIComponent(cid)}`;
	}
	function authorList(a) {
		return typeof a === 'string' ? a.split('\t').filter(Boolean).join(', ') : '';
	}

	async function fetchLatestTrack() {
		const params = new URLSearchParams({ repo: HANDLE, collection: PLAY_COLLECTION, limit: '1' });
		const res = await fetch(`${PDS}/xrpc/com.atproto.repo.listRecords?${params}`);
		if (!res.ok) return;
		const r = (await res.json()).records?.[0];
		if (!r) return;
		track = {
			name: r.value.trackName,
			artist: artistNames(r.value),
			cover: trackCover(r.value.releaseMbId),
		};
	}

	async function fetchCurrentBook() {
		const params = new URLSearchParams({ repo: HANDLE, collection: BOOK_COLLECTION, limit: '100' });
		const res = await fetch(`${PDS}/xrpc/com.atproto.repo.listRecords?${params}`);
		if (!res.ok) return;
		const r = ((await res.json()).records ?? []).find((x) => x.value?.status === READING);
		if (!r) return;
		book = {
			title: r.value.title ?? 'Untitled',
			author: authorList(r.value.authors),
			cover: bookCover(r.uri, r.value.cover),
		};
	}

	onMount(() => {
		fetchLatestTrack().catch(() => {});
		fetchCurrentBook().catch(() => {});
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
		display: flex;
		flex-wrap: wrap;
		gap: var(--layout-spacing);
	}
	.rn-item {
		display: flex;
		align-items: center;
		gap: calc(var(--inline-spacing) * 3);
		flex: 1 1 14rem;
		min-width: 0;
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

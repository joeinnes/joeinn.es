<script>
	import { onMount } from 'svelte';

	const HANDLE = 'joeinn.es';
	const COLLECTION = 'fm.teal.alpha.feed.play';
	const PDS = 'https://bsky.social';
	const COVER_ART_BASE = 'https://coverartarchive.org/release';

	const CACHE_KEY = 'tealfm_tracks';
	const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	let allTracks = $state([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let error = $state('');
	let selectedPeriod = $state('week');
	let selectedCategory = $state('albums');
	let fullyLoaded = $state(false);
	let nextCursor = $state(undefined);

	function loadCache() {
		try {
			const raw = localStorage.getItem(CACHE_KEY);
			if (!raw) return null;
			const cache = JSON.parse(raw);
			return cache;
		} catch {
			return null;
		}
	}

	function saveCache() {
		try {
			localStorage.setItem(
				CACHE_KEY,
				JSON.stringify({
					tracks: allTracks,
					fullyLoaded,
					nextCursor,
					savedAt: Date.now(),
				}),
			);
		} catch {
			// localStorage full or unavailable
		}
	}

	// Decode an AT Protocol TID (base32-sort encoded 64-bit int) to ms timestamp
	const B32 = '234567abcdefghijklmnopqrstuvwxyz';
	function decodeTid(tid) {
		if (!tid || tid.length !== 13) return null;
		let n = 0n;
		for (const ch of tid) {
			const i = B32.indexOf(ch);
			if (i < 0) return null;
			n = n * 32n + BigInt(i);
		}
		return Number((n >> 10n) / 1000n); // upper bits = microseconds → ms
	}

	// Robustly extract a ms timestamp from a track record
	function getTrackTimestamp(track) {
		if (track.playedTime) {
			const d = new Date(track.playedTime);
			if (!isNaN(d.getTime())) return d.getTime();
			const n = Number(track.playedTime);
			if (!isNaN(n) && n > 1e9 && n < 1e11) return n * 1000; // seconds
			if (!isNaN(n) && n > 1e12) return n; // milliseconds
		}
		// Fallback: decode timestamp from the TID in the record URI
		if (track._rkey) return decodeTid(track._rkey);
		return null;
	}

	function toTrack(r) {
		return { ...r.value, _rkey: r.uri.split('/').pop() };
	}

	// Fetch a page of older records (appends to end)
	async function fetchPage() {
		const params = new URLSearchParams({
			repo: HANDLE,
			collection: COLLECTION,
			limit: '100',
		});
		if (nextCursor) params.set('cursor', nextCursor);
		const res = await fetch(`${PDS}/xrpc/com.atproto.repo.listRecords?${params}`);
		if (!res.ok) throw new Error(`Failed to fetch tracks (${res.status})`);
		const data = await res.json();
		allTracks = [...allTracks, ...data.records.map(toTrack)];
		nextCursor = data.cursor;
		if (!data.cursor) fullyLoaded = true;
	}

	// Fetch only records newer than what we have (prepends to start)
	async function fetchNewRecords() {
		const knownKeys = new Set(allTracks.map((t) => t._rkey));
		const newRecords = [];
		let cursor;
		let done = false;
		while (!done) {
			const params = new URLSearchParams({
				repo: HANDLE,
				collection: COLLECTION,
				limit: '100',
			});
			if (cursor) params.set('cursor', cursor);
			const res = await fetch(`${PDS}/xrpc/com.atproto.repo.listRecords?${params}`);
			if (!res.ok) throw new Error(`Failed to fetch tracks (${res.status})`);
			const data = await res.json();
			for (const r of data.records) {
				const rkey = r.uri.split('/').pop();
				if (knownKeys.has(rkey)) {
					done = true;
					break;
				}
				newRecords.push(toTrack(r));
			}
			if (!data.cursor) break;
			cursor = data.cursor;
		}
		if (newRecords.length > 0) {
			allTracks = [...newRecords, ...allTracks];
		}
	}

	function getCutoff(period) {
		if (period === 'all') return 0;
		const days = { week: 7, month: 30, year: 365 };
		return Date.now() - (days[period] ?? 7) * 86400000;
	}

	function hasEnoughData(period) {
		if (fullyLoaded) return true;
		if (period === 'all') return false;
		if (allTracks.length === 0) return false;
		const oldest = allTracks[allTracks.length - 1];
		const ts = getTrackTimestamp(oldest);
		if (ts === null) return true;
		return ts <= getCutoff(period);
	}

	onMount(async () => {
		const cache = loadCache();
		if (cache?.tracks?.length) {
			allTracks = cache.tracks;
			fullyLoaded = cache.fullyLoaded ?? false;
			nextCursor = cache.nextCursor;
			loading = false;

			// If cache is fresh, just fetch new records in background
			// If stale, also fetch new records but still show cached data instantly
			try {
				await fetchNewRecords();
				saveCache();
			} catch {
				// Cached data is still shown
			}
			return;
		}

		try {
			await fetchPage();
			saveCache();
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	});

	$effect(() => {
		if (!loading && !loadingMore && !hasEnoughData(selectedPeriod)) {
			loadMore();
		}
	});

	async function loadMore() {
		loadingMore = true;
		try {
			while (!fullyLoaded) {
				if (hasEnoughData(selectedPeriod)) break;
				await fetchPage();
			}
			saveCache();
		} catch (e) {
			error = e.message;
		} finally {
			loadingMore = false;
		}
	}

	function getArtistNames(track) {
		if (track.artists?.length) return track.artists.map((a) => a.artistName).join(', ');
		if (track.artistNames?.length) return track.artistNames.join(', ');
		return 'Unknown Artist';
	}

	function coverUrl(releaseMbId) {
		if (!releaseMbId) return null;
		return `${COVER_ART_BASE}/${releaseMbId}/front-250`;
	}

	function filterByPeriod(tracks, period) {
		if (period === 'all') return tracks;
		const cutoff = getCutoff(period);
		return tracks.filter((t) => {
			const ts = getTrackTimestamp(t);
			return ts !== null && ts >= cutoff;
		});
	}

	function aggregateBy(tracks, category) {
		const map = new Map();
		for (const track of tracks) {
			const artist = getArtistNames(track);
			let key, name, subtitle;
			if (category === 'artists') {
				key = artist;
				name = artist;
				subtitle = '';
			} else if (category === 'albums') {
				name = track.releaseName || 'Unknown Album';
				key = track.releaseMbId || `${name}::${artist}`;
				subtitle = artist;
			} else {
				name = track.trackName;
				key = track.recordingMbId || `${name}::${artist}`;
				subtitle = artist;
			}
			if (!map.has(key)) {
				map.set(key, { name, subtitle, mbId: track.releaseMbId, count: 0 });
			}
			const entry = map.get(key);
			entry.count++;
			if (!entry.mbId && track.releaseMbId) entry.mbId = track.releaseMbId;
		}
		return [...map.values()].sort((a, b) => b.count - a.count);
	}

	function relativeTime(track) {
		const ts = getTrackTimestamp(track);
		if (!ts) return '';
		const diffMs = Date.now() - ts;
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays === 1) return 'yesterday';
		if (diffDays < 7) return `${diffDays}d ago`;
		return new Date(ts).toLocaleDateString();
	}

	function handleImgError(e) {
		e.currentTarget.style.display = 'none';
	}

	let recentTracks = $derived(allTracks.slice(0, 3));

	let weeklyAlbums = $derived.by(() => {
		const weekTracks = filterByPeriod(allTracks, 'week');
		const seen = new Set();
		const albums = [];
		for (const track of weekTracks) {
			const key = track.releaseMbId || `${track.releaseName}::${getArtistNames(track)}`;
			if (!track.releaseName || seen.has(key)) continue;
			seen.add(key);
			albums.push({
				name: track.releaseName,
				artist: getArtistNames(track),
				mbId: track.releaseMbId,
			});
		}
		return albums.slice(0, 16);
	});

	let filteredTracks = $derived(filterByPeriod(allTracks, selectedPeriod));
	let stats = $derived(aggregateBy(filteredTracks, selectedCategory).slice(0, 10));

	const periods = [
		{ id: 'week', label: 'This Week' },
		{ id: 'month', label: 'This Month' },
		{ id: 'year', label: 'This Year' },
		{ id: 'all', label: 'All Time' },
	];

	const categories = [
		{ id: 'artists', label: 'Artists' },
		{ id: 'albums', label: 'Albums' },
		{ id: 'tracks', label: 'Tracks' },
	];
</script>

{#if loading}
	<p>Loading listening data...</p>
{:else if error && allTracks.length === 0}
	<p>Could not load listening data.</p>
{:else}
	{#if recentTracks.length > 0}
		<h3>Recently Played</h3>
		<ol class="recent-list">
			{#each recentTracks as track}
				<li class="recent-track">
					<div class="recent-cover">
						{#if track.releaseMbId}
							<img
								src={coverUrl(track.releaseMbId)}
								alt={track.releaseName || track.trackName}
								loading="lazy"
								onerror={handleImgError}
							/>
						{/if}
						<div class="recent-cover-fallback">{track.trackName[0]}</div>
					</div>
					<div class="recent-info">
						<span class="name">{track.trackName}</span>
						<span class="artist">{getArtistNames(track)}</span>
						{#if track.releaseName}
							<span class="release">{track.releaseName}</span>
						{/if}
					</div>
					{#if getTrackTimestamp(track)}
						<time class="time">{relativeTime(track)}</time>
					{/if}
				</li>
			{/each}
		</ol>
	{/if}

	{#if weeklyAlbums.length > 0}
		<h3>This Week's Albums</h3>
		<div class="mosaic">
			{#each weeklyAlbums as album}
				<div class="mosaic-cell" title="{album.name} — {album.artist}">
					{#if album.mbId}
						<img
							src={coverUrl(album.mbId)}
							alt="{album.name} by {album.artist}"
							loading="lazy"
							onerror={handleImgError}
						/>
					{/if}
					<div class="mosaic-fallback">
						<span>{album.name}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<h3>Stats</h3>
	<div class="tab-row">
		{#each periods as period}
			<button
				class="tab"
				class:active={selectedPeriod === period.id}
				onclick={() => (selectedPeriod = period.id)}
			>{period.label}</button>
		{/each}
	</div>
	<div class="tab-row">
		{#each categories as cat}
			<button
				class="tab"
				class:active={selectedCategory === cat.id}
				onclick={() => (selectedCategory = cat.id)}
			>{cat.label}</button>
		{/each}
	</div>

	{#if loadingMore}
		<p class="loading-indicator">Loading more data ({allTracks.length} tracks so far)...</p>
	{/if}

	{#if stats.length > 0}
		<ol class="stats-list">
			{#each stats as item}
				<li class="stat-item">
					<div class="stat-cover">
						{#if item.mbId}
							<img
								src={coverUrl(item.mbId)}
								alt={item.name}
								loading="lazy"
								onerror={handleImgError}
							/>
						{/if}
						<div class="stat-cover-fallback">{item.name[0]}</div>
					</div>
					<div class="stat-info">
						<span class="name">{item.name}</span>
						{#if item.subtitle}
							<span class="artist">{item.subtitle}</span>
						{/if}
						<span class="stat-count">{item.count} {item.count === 1 ? 'play' : 'plays'}</span>
					</div>
				</li>
			{/each}
		</ol>
	{:else if !loadingMore}
		<p>No listening data for this period.</p>
	{/if}

	<p class="attribution">
		Tracked with <a href="https://teal.fm" target="_blank" rel="noopener">teal.fm</a>, stored on the <a href="https://atproto.com" target="_blank" rel="noopener">AT Protocol</a>.
	</p>
{/if}

<style>
	/* Recent tracks */
	.recent-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--inline-spacing);
	}
	.recent-list * {
		padding-block-start: 0;
	}
	.recent-track {
		display: flex;
		align-items: center;
		gap: calc(var(--inline-spacing) * 2);
		padding: calc(var(--inline-spacing) * 2);
		border-radius: var(--border-radius);
		background: color-mix(in hsl, var(--foreground) 5%, var(--background) 95%);
	}
	.recent-cover {
		position: relative;
		width: 3.5em;
		height: 3.5em;
		flex-shrink: 0;
		border-radius: var(--border-radius);
		overflow: hidden;
		background: color-mix(in hsl, var(--foreground) 10%, var(--background) 90%);
	}
	.recent-cover img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 1;
	}
	.recent-cover-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.2em;
		color: var(--muted);
	}
	.recent-info {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	.name {
		font-weight: 700;
	}
	.artist {
		color: var(--primary);
	}
	.release {
		color: var(--muted);
		font-size: 0.85em;
	}
	.time {
		color: var(--muted);
		font-size: 0.75em;
		font-family: var(--font-mono);
		white-space: nowrap;
	}

	/* Album mosaic */
	.mosaic {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 2px;
	}
	.mosaic * {
		padding-block-start: 0;
	}
	.mosaic-cell {
		position: relative;
		aspect-ratio: 1;
		overflow: hidden;
		background: color-mix(in hsl, var(--foreground) 10%, var(--background) 90%);
	}
	.mosaic-cell img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 1;
	}
	.mosaic-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25em;
		font-size: 0.6em;
		text-align: center;
		color: var(--muted);
		word-break: break-word;
		line-height: 1.2;
	}

	/* Tabs */
	.tab-row {
		display: flex;
		gap: var(--inline-spacing);
		flex-wrap: wrap;
	}
	.tab-row:last-of-type {
		margin-block-end: calc(var(--layout-spacing) / 2);
	}
	.tab-row * {
		padding-block-start: 0;
	}
	.tab {
		background: transparent;
		color: var(--muted);
		padding: var(--inline-spacing) calc(var(--inline-spacing) * 2);
		border: 1px solid var(--very-muted);
		border-radius: var(--border-radius);
		cursor: pointer;
		font-size: 0.75em;
	}
	.tab:hover {
		color: var(--foreground);
		border-color: var(--foreground);
	}
	.tab.active {
		background: var(--primary);
		color: #fff;
		border-color: var(--primary);
	}

	/* Loading */
	.loading-indicator {
		color: var(--muted);
		font-size: 0.85em;
		font-family: var(--font-mono);
	}

	/* Stats list */
	.stats-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--inline-spacing);
	}
	.stats-list * {
		padding-block-start: 0;
	}
	.stat-item {
		display: flex;
		align-items: center;
		gap: calc(var(--inline-spacing) * 2);
	}
	.stat-cover {
		position: relative;
		width: 3em;
		height: 3em;
		flex-shrink: 0;
		border-radius: var(--border-radius);
		overflow: hidden;
		background: color-mix(in hsl, var(--foreground) 10%, var(--background) 90%);
	}
	.stat-cover img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 1;
	}
	.stat-cover-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.2em;
		color: var(--muted);
	}
	.stat-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.stat-info .name,
	.stat-info .artist {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.stat-count {
		color: var(--muted);
		font-size: 0.75em;
		font-family: var(--font-mono);
	}

	.attribution {
		font-size: 0.75em;
		color: var(--muted);
	}
</style>

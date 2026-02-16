<script>
	import { onMount } from 'svelte';

	const HANDLE = 'joeinn.es';
	const COLLECTION = 'fm.teal.alpha.feed.play';
	const PDS = 'https://bsky.social';

	let tracks = $state([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const params = new URLSearchParams({
				repo: HANDLE,
				collection: COLLECTION,
				limit: '3',
				reverse: 'true',
			});
			const res = await fetch(`${PDS}/xrpc/com.atproto.repo.listRecords?${params}`);
			if (!res.ok) {
				throw new Error(`Failed to fetch tracks (${res.status})`);
			}
			const data = await res.json();
			tracks = data.records.map((r) => r.value);
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	});

	function artistNames(track) {
		if (track.artists?.length) {
			return track.artists.map((a) => a.artistName).join(', ');
		}
		if (track.artistNames?.length) {
			return track.artistNames.join(', ');
		}
		return 'Unknown Artist';
	}

	function relativeTime(dateStr) {
		if (!dateStr) return '';
		const now = Date.now();
		const then = new Date(dateStr).getTime();
		const diffMs = now - then;
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays === 1) return 'yesterday';
		if (diffDays < 7) return `${diffDays}d ago`;
		return new Date(dateStr).toLocaleDateString();
	}
</script>

{#if loading}
	<p>Loading recent tracks...</p>
{:else if error}
	<p>Could not load recent tracks.</p>
{:else if tracks.length === 0}
	<p>No recent tracks found.</p>
{:else}
	<ol class="track-list">
		{#each tracks as track}
			<li class="track">
				<span class="track-name">{track.trackName}</span>
				<span class="track-artist">{artistNames(track)}</span>
				{#if track.releaseName}
					<span class="track-release">{track.releaseName}</span>
				{/if}
				{#if track.playedTime}
					<time class="track-time" datetime={track.playedTime}>{relativeTime(track.playedTime)}</time>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="track-attribution">
		Tracked with <a href="https://teal.fm" target="_blank" rel="noopener">teal.fm</a>, stored on the <a href="https://atproto.com" target="_blank" rel="noopener">AT Protocol</a>.
	</p>
{/if}

<style>
	.track-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--inline-spacing);
	}

	.track {
		display: flex;
		flex-direction: column;
		padding: calc(var(--inline-spacing) * 2);
		border-radius: var(--border-radius);
		background-color: color-mix(in hsl, var(--foreground) 5%, var(--background) 95%);
	}

	.track-name {
		font-weight: 700;
	}

	.track-artist {
		color: var(--primary);
	}

	.track-release {
		color: var(--muted);
		font-size: 0.85em;
	}

	.track-time {
		color: var(--muted);
		font-size: 0.75em;
		font-family: var(--font-mono);
	}

	.track-attribution {
		font-size: 0.75em;
		color: var(--muted);
	}
</style>

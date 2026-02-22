<script>
	import { onMount } from 'svelte';
	import { AT_HANDLE as HANDLE, AT_COLLECTION as COLLECTION, AT_PDS as PDS, COVER_ART_BASE } from '../lib/constants';

	const RECENCY_THRESHOLD = 10 * 60 * 1000; // 10 minutes

	let track = $state(null);
	let show = $state(false);

	onMount(async () => {
		try {
			const params = new URLSearchParams({
				repo: HANDLE,
				collection: COLLECTION,
				limit: '1',
			});
			const res = await fetch(`${PDS}/xrpc/com.atproto.repo.listRecords?${params}`);
			if (!res.ok) return;
			const data = await res.json();
			if (!data.records?.length) return;

			const record = data.records[0].value;
			if (!record.playedTime) return;

			const playedAt = new Date(record.playedTime).getTime();
			if (isNaN(playedAt)) return;

			const elapsed = Date.now() - playedAt;
			const duration = (record.duration ?? 300) * 1000;

			// Show if the track is still playing or was played very recently
			if (elapsed < duration + RECENCY_THRESHOLD) {
				track = record;
				show = true;
			}
		} catch {
			// Silently fail — this is a nice-to-have
		}
	});

	function artistNames(t) {
		if (t.artists?.length) return t.artists.map((a) => a.artistName).join(', ');
		if (t.artistNames?.length) return t.artistNames.join(', ');
		return '';
	}

	function handleImgError(e) {
		e.currentTarget.style.display = 'none';
	}
</script>

{#if show && track}
	<a href="/now" class="now-playing">
		<div class="np-cover">
			{#if track.releaseMbId}
				<img
					src="{COVER_ART_BASE}/{track.releaseMbId}/front-250"
					alt={track.releaseName || track.trackName}
					onerror={handleImgError}
				/>
			{/if}
			<div class="np-cover-fallback">&#9835;</div>
		</div>
		<div class="np-info">
			<span class="np-label">Now Playing</span>
			<span class="np-track">{track.trackName}</span>
			{#if artistNames(track)}
				<span class="np-artist">{artistNames(track)}</span>
			{/if}
		</div>
	</a>
{/if}

<style>
	.now-playing {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.4em 0.75em 0.4em 0.4em;
		background: color-mix(in hsl, var(--background) 92%, var(--foreground) 8%);
		border: 1px solid var(--very-muted);
		border-radius: var(--border-radius);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		text-decoration: none;
		color: inherit;
		z-index: 900;
		max-width: min(20rem, calc(100vw - 2rem));
		animation: slide-in 0.3s ease-out;
	}
	.now-playing:hover {
		border-color: var(--primary);
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateY(1rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.np-cover {
		position: relative;
		width: 2.5em;
		height: 2.5em;
		flex-shrink: 0;
		border-radius: calc(var(--border-radius) / 2);
		overflow: hidden;
		background: color-mix(in hsl, var(--foreground) 10%, var(--background) 90%);
	}
	.np-cover img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 1;
	}
	.np-cover-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1em;
		color: var(--muted);
	}

	.np-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
		line-height: 1.3;
	}
	.np-label {
		font-size: 0.55em;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--primary);
	}
	.np-track {
		font-weight: 700;
		font-size: 0.75em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.np-artist {
		font-size: 0.65em;
		color: var(--muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>

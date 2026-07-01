<script lang="ts">
	import { onMount } from 'svelte';
	import { getLighting, solarHour } from './lighting';
	import { drawWindow, weatherIdFromCode, type WeatherId } from './weather';
	import type { Pt } from './iso';

	// ponytail: a fixed location keeps the homepage from firing a geolocation
	// permission prompt on load. Pass lat/lon to point the window elsewhere
	// (e.g. the visitor's coords). Defaults to Budapest.
	// cityImage: an illustrated cityscape (transparent sky) drawn behind the live
	// weather; falls back to the procedural skyline if it's missing or fails.
	let {
		lat = 47.4979,
		lon = 19.0402,
		cityImage = '/room/skyline.webp',
		cityZoom = 1.7,
	}: { lat?: number; lon?: number; cityImage?: string; cityZoom?: number } = $props();

	let canvas: HTMLCanvasElement;
	let weather: WeatherId = 'clear';
	let scenery: HTMLImageElement | null = null;
	let tintCanvas: HTMLCanvasElement | null = null;
	let tintCtx: CanvasRenderingContext2D | null = null;
	// Filled from Open-Meteo: the city's timezone and today's real sun times.
	let tz: string | null = null;
	let sunrise: number | null = null;
	let sunset: number | null = null;

	// Light the static city by the time-of-day grade (multiply), keeping its alpha
	// so the live sky still shows through. A floor stops it going pure black at
	// night. Same grade the room scene uses, so the window stays consistent.
	const tinted = (grade: number[]): HTMLCanvasElement | null => {
		if (!scenery) return null;
		const w = scenery.naturalWidth || scenery.width;
		const h = scenery.naturalHeight || scenery.height;
		if (!w || !h) return null;
		if (!tintCanvas) {
			tintCanvas = document.createElement('canvas');
			tintCtx = tintCanvas.getContext('2d');
		}
		if (!tintCtx) return null;
		if (tintCanvas.width !== w) tintCanvas.width = w;
		if (tintCanvas.height !== h) tintCanvas.height = h;
		const g = `rgb(${Math.max(grade[0], 48)},${Math.max(grade[1], 48)},${Math.max(grade[2], 56)})`;
		tintCtx.globalCompositeOperation = 'source-over';
		tintCtx.clearRect(0, 0, w, h);
		tintCtx.drawImage(scenery, 0, 0);
		tintCtx.globalCompositeOperation = 'multiply';
		tintCtx.fillStyle = g;
		tintCtx.fillRect(0, 0, w, h);
		tintCtx.globalCompositeOperation = 'destination-in'; // re-apply the city's alpha
		tintCtx.drawImage(scenery, 0, 0);
		tintCtx.globalCompositeOperation = 'source-over';
		return tintCanvas;
	};

	// "2026-06-30T05:12" → 5.2 (wall-clock decimal hours).
	const hmToHours = (iso: string): number => {
		const [, t = ''] = iso.split('T');
		const [hh, mm] = t.split(':');
		return (+hh || 0) + (+mm || 0) / 60;
	};

	// Wall-clock hour at the city we're showing (its own timezone once known),
	// remapped so the lighting tracks that city's real sunrise/sunset.
	const sceneHour = (): number => {
		let h: number;
		if (tz) {
			const parts = new Intl.DateTimeFormat('en-GB', {
				timeZone: tz,
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			}).formatToParts(new Date());
			const hh = +(parts.find((p) => p.type === 'hour')?.value ?? '0');
			const mm = +(parts.find((p) => p.type === 'minute')?.value ?? '0');
			h = (hh % 24) + mm / 60;
		} else {
			const d = new Date();
			h = d.getHours() + d.getMinutes() / 60;
		}
		return sunrise != null && sunset != null ? solarHour(h, sunrise, sunset) : h;
	};

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// drawWindow's clipped full-canvas washes assume a 640×360 logical envelope,
		// so we fit the logical space inside it (preserving the box's aspect) and
		// upscale the backing store by dpr for crispness.
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		let LW = 0,
			LH = 0;
		let quad: [Pt, Pt, Pt, Pt] = [
			{ x: 0, y: 0 },
			{ x: 0, y: 0 },
			{ x: 0, y: 0 },
			{ x: 0, y: 0 },
		];

		const resize = () => {
			const r = canvas.getBoundingClientRect();
			if (!r.width || !r.height) return;
			const aspect = r.width / r.height;
			if (aspect >= 640 / 360) {
				LW = 640;
				LH = Math.round(640 / aspect);
			} else {
				LH = 360;
				LW = Math.round(360 * aspect);
			}
			canvas.width = Math.round(LW * dpr);
			canvas.height = Math.round(LH * dpr);
			quad = [
				{ x: 0, y: 0 },
				{ x: LW, y: 0 },
				{ x: LW, y: LH },
				{ x: 0, y: LH },
			];
		};
		resize();

		const frame = (tMs: number) => {
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, LW, LH);
			const lighting = getLighting(sceneHour());
			drawWindow(ctx, quad, weather, lighting, tMs, tinted(lighting.grade), cityZoom);
		};

		// Paint the first frame synchronously on mount so the window shows the
		// instant the island hydrates, rather than a blank gap until the first
		// requestAnimationFrame tick.
		frame(0);

		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

		// Illustrated cityscape (optional) — drawn behind the weather once loaded.
		if (cityImage) {
			const img = new Image();
			img.onload = () => {
				scenery = img;
				if (reduce) frame(0);
			};
			img.src = cityImage;
		}

		// Live weather + the city's real sun times (best effort; on failure the
		// window stays 'clear' and falls back to the visitor's clock).
		fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=sunrise,sunset&timezone=auto`,
		)
			.then((r) => r.json())
			.then((j) => {
				const code = j?.current_weather?.weathercode;
				if (typeof code === 'number') weather = weatherIdFromCode(code);
				if (typeof j?.timezone === 'string') tz = j.timezone;
				const sr = typeof j?.daily?.sunrise?.[0] === 'string' ? hmToHours(j.daily.sunrise[0]) : NaN;
				const ss = typeof j?.daily?.sunset?.[0] === 'string' ? hmToHours(j.daily.sunset[0]) : NaN;
				if (Number.isFinite(sr) && Number.isFinite(ss) && ss > sr) {
					sunrise = sr;
					sunset = ss;
				}
				if (reduce) frame(0);
			})
			.catch(() => {});

		// Re-measure whenever the box resizes (also fires once on observe, which
		// covers the case where layout lands after hydration).
		const ro = new ResizeObserver(() => {
			resize();
			if (reduce) frame(0);
		});
		ro.observe(canvas);

		// Reduced motion: one static frame, no animation loop.
		if (reduce) {
			frame(0);
			return () => ro.disconnect();
		}

		let raf = 0,
			last = 0,
			acc = 0;
		const loop = (ts: number) => {
			const dt = last ? ts - last : 16;
			last = ts;
			acc += dt;
			if (acc >= 33) {
				acc = 0;
				frame(ts);
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>

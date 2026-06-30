// Weather, seen through the west-wall window.
//
// Presets map onto the visuals (sky tint, cloud cover, precipitation, haze) and
// line up with Open-Meteo weather buckets so a future data hookup is a lookup,
// not a rewrite. Driven by the dev panel for now.

import { bilerp, VIEW_W, VIEW_H, type Pt } from './iso';
import { lerpRGB, rgb, rgba, type RGB } from './palette';
import type { Lighting } from './lighting';

type Ctx = CanvasRenderingContext2D;
type Quad = [Pt, Pt, Pt, Pt];

export type WeatherId = 'clear' | 'cloudy' | 'overcast' | 'rain' | 'snow' | 'fog' | 'storm';
export const WEATHER_IDS: WeatherId[] = ['clear', 'cloudy', 'overcast', 'rain', 'snow', 'fog', 'storm'];

/** Map an Open-Meteo WMO weather code to the nearest window preset. */
export function weatherIdFromCode(code: number): WeatherId {
	if (code >= 95) return 'storm'; // thunderstorm (95, 96, 99)
	if (code === 85 || code === 86) return 'snow'; // snow showers
	if (code >= 71 && code <= 77) return 'snow'; // snowfall / grains
	if (code >= 51) return 'rain'; // drizzle, rain, freezing rain, rain showers
	if (code === 45 || code === 48) return 'fog';
	if (code === 3) return 'overcast';
	if (code === 1 || code === 2) return 'cloudy';
	return 'clear';
}

type Preset = { cloud: number; precip: 'none' | 'rain' | 'snow'; heavy: boolean; haze: number; darken: number };
const PRESETS: Record<WeatherId, Preset> = {
	clear: { cloud: 0.0, precip: 'none', heavy: false, haze: 0.0, darken: 1.0 },
	cloudy: { cloud: 0.5, precip: 'none', heavy: false, haze: 0.08, darken: 0.92 },
	overcast: { cloud: 1.0, precip: 'none', heavy: false, haze: 0.22, darken: 0.72 },
	rain: { cloud: 1.0, precip: 'rain', heavy: false, haze: 0.18, darken: 0.62 },
	snow: { cloud: 0.9, precip: 'snow', heavy: false, haze: 0.24, darken: 0.82 },
	fog: { cloud: 0.4, precip: 'none', heavy: false, haze: 0.7, darken: 0.78 },
	storm: { cloud: 1.0, precip: 'rain', heavy: true, haze: 0.2, darken: 0.42 },
};

const GREY_T: RGB = [120, 126, 140];
const GREY_B: RGB = [150, 156, 168];

// Deterministic pseudo-random in [0,1) from an integer (stable across reloads).
function rnd(i: number): number {
	const s = Math.sin(i * 12.9898) * 43758.5453;
	return s - Math.floor(s);
}

function qrect(ctx: Ctx, q: Quad, u0: number, v0: number, u1: number, v1: number, fill: string): void {
	ctx.beginPath();
	const a = bilerp(q, u0, v0), b = bilerp(q, u1, v0), c = bilerp(q, u1, v1), d = bilerp(q, u0, v1);
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(b.x, b.y);
	ctx.lineTo(c.x, c.y);
	ctx.lineTo(d.x, d.y);
	ctx.closePath();
	ctx.fillStyle = fill;
	ctx.fill();
}

/** Storm lightning, 0..1, deterministic from the clock. */
export function lightningFlash(weather: WeatherId, tMs: number): number {
	if (weather !== 'storm') return 0;
	const c = tMs % 5000;
	if (c < 90) return 1 - c / 90;
	if (c > 150 && c < 220) return ((220 - c) / 70) * 0.6;
	return 0;
}

/** How much daylight reaches the room through the window, 0..1 (clear = 1). */
export function weatherDaylight(weather: WeatherId): number {
	return PRESETS[weather].darken;
}

/** A subtle whole-room mood wash so weather is felt across the scene, not just in the window. */
export function drawWeatherMood(ctx: Ctx, weather: WeatherId, light: Lighting): void {
	if (weather === 'clear') return;
	const p = PRESETS[weather];
	const s = ((1 - p.darken) + p.cloud * 0.25) * (0.35 + 0.65 * light.daylight);
	ctx.save();
	if (weather === 'fog') {
		ctx.fillStyle = `rgba(206,210,216,${0.1 + 0.22 * s})`;
		ctx.fillRect(0, 0, VIEW_W, VIEW_H);
		ctx.restore();
		return;
	}
	ctx.globalCompositeOperation = 'multiply';
	const col = weather === 'storm' ? '150,160,188' : weather === 'snow' ? '214,222,232' : '196,204,218';
	ctx.globalAlpha = Math.min(0.42, 0.22 + s * 0.45);
	ctx.fillStyle = `rgb(${col})`;
	ctx.fillRect(0, 0, VIEW_W, VIEW_H);
	ctx.restore();
}

/**
 * Weather effects (cloud / precip / fog) drawn inside an existing window quad.
 * No sky or frame — used in image mode where the illustration already has those.
 * The quad is [TL, TR, BR, BL] in logical space.
 */
export function drawWeatherInWindow(ctx: Ctx, q: Pt[], weather: WeatherId, tMs: number, dim = 1): void {
	if (weather === 'clear' || q.length < 4) return;
	const p = PRESETS[weather];
	const quad = q as Quad;

	ctx.save();
	ctx.beginPath();
	ctx.moveTo(q[0].x, q[0].y);
	ctx.lineTo(q[1].x, q[1].y);
	ctx.lineTo(q[2].x, q[2].y);
	ctx.lineTo(q[3].x, q[3].y);
	ctx.closePath();
	ctx.clip();

	// Grey wash for cloud / overcast / storm (fillRect, clipped to the window).
	const wash = (1 - p.darken) * 0.5 + p.cloud * 0.12;
	if (wash > 0.02) {
		ctx.fillStyle = rgba([138, 144, 158], wash);
		ctx.fillRect(0, 0, VIEW_W, VIEW_H);
	}
	// Drifting clouds.
	if (p.cloud > 0.2) {
		for (let i = 0; i < 5; i++) {
			const u = ((rnd(i) + tMs * 0.00002 * (1 + (i & 1))) % 1.2) - 0.1;
			const v = 0.1 + rnd(i + 9) * 0.4;
			const c = bilerp(quad, u, v);
			ctx.fillStyle = rgba([212, 216, 226], (0.16 + p.cloud * 0.22) * dim);
			ctx.beginPath();
			ctx.ellipse(c.x, c.y, 10 + i * 2, 4, 0, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	// Precipitation.
	if (p.precip === 'rain') {
		const n = p.heavy ? 72 : 50;
		ctx.strokeStyle = rgba([202, 218, 244], (p.heavy ? 0.85 : 0.66) * dim);
		ctx.lineWidth = 1.1;
		ctx.beginPath();
		for (let i = 0; i < n; i++) {
			const u = rnd(i);
			const v = (rnd(i + 7) + tMs * (p.heavy ? 0.0016 : 0.0011)) % 1;
			const s = bilerp(quad, u, v);
			ctx.moveTo(s.x, s.y);
			ctx.lineTo(s.x - 1.4, s.y + (p.heavy ? 9 : 7));
		}
		ctx.stroke();
	} else if (p.precip === 'snow') {
		ctx.fillStyle = rgba([246, 250, 255], 0.95 * dim);
		for (let i = 0; i < 54; i++) {
			const v = (rnd(i + 3) + tMs * 0.00035) % 1;
			const u = (rnd(i) + Math.sin(tMs * 0.001 + i) * 0.04 + 1) % 1;
			const s = bilerp(quad, u, v);
			ctx.fillRect(s.x, s.y, 1.8, 1.8);
		}
	}
	// Fog haze.
	if (p.haze > 0.02) {
		ctx.fillStyle = rgba([200, 206, 216], p.haze * 0.5);
		ctx.fillRect(0, 0, VIEW_W, VIEW_H);
	}
	ctx.restore();
}

/** Fill a polygon given in window-(u,v) space, mapped through the quad. */
function fillUV(ctx: Ctx, q: Quad, uv: [number, number][], fill: string): void {
	ctx.beginPath();
	for (let i = 0; i < uv.length; i++) {
		const s = bilerp(q, uv[i][0], uv[i][1]);
		if (i === 0) ctx.moveTo(s.x, s.y);
		else ctx.lineTo(s.x, s.y);
	}
	ctx.closePath();
	ctx.fillStyle = fill;
	ctx.fill();
}

type Box = { u0: number; u1: number; roof: number };

/** One stepped rooftop silhouette across the window, as window-(u,v) points.
 *  Heights ease between targets (not pure noise) so the line reads calm, not
 *  jagged; collects building boxes for window-lights when `boxes` is given. */
function layerSilhouette(baseV: number, amp: number, seed: number, boxes: Box[] | null): [number, number][] {
	const pts: [number, number][] = [[-0.06, 1.02]];
	let u = -0.06;
	let k = seed;
	let roof = baseV - amp * (0.3 + 0.5 * rnd(k));
	pts.push([u, roof]);
	while (u < 1.06) {
		const w = 0.05 + rnd(k * 1.7 + 1) * 0.08;
		const target = baseV - amp * (0.12 + 0.88 * rnd(k * 2.3 + 2));
		roof = roof * 0.4 + target * 0.6; // ease toward the new height
		const u1 = Math.min(1.06, u + w);
		if (rnd(k * 3.1 + 3) > 0.9) {
			pts.push([u, roof], [(u + u1) / 2, roof - amp * 0.45], [u1, roof]); // pitched peak
		} else {
			pts.push([u, roof], [u1, roof]);
		}
		if (boxes) boxes.push({ u0: u, u1, roof });
		u = u1;
		k++;
	}
	pts.push([1.06, baseV], [1.06, 1.02]);
	return pts;
}

/** A slim spire (church steeple). */
function drawSpire(ctx: Ctx, q: Quad, u: number, baseV: number, h: number, fill: string): void {
	fillUV(ctx, q, [[u - 0.004, baseV - h * 0.45], [u, baseV - h], [u + 0.004, baseV - h * 0.45]], fill);
	fillUV(ctx, q, [[u - 0.006, baseV - h * 0.45], [u + 0.006, baseV - h * 0.45], [u + 0.006, baseV], [u - 0.006, baseV]], fill);
}

/** A domed landmark topped by a spire (the Parliament / Basilica silhouette). */
function drawDomeSpire(ctx: Ctx, q: Quad, u: number, baseV: number, w: number, h: number, fill: string): void {
	fillUV(ctx, q, [[u - w, baseV - h * 0.4], [u + w, baseV - h * 0.4], [u + w, baseV], [u - w, baseV]], fill);
	const dome: [number, number][] = [];
	for (let t = 0; t <= 10; t++) dome.push([u - w + (2 * w * t) / 10, baseV - h * 0.4 - Math.sin((Math.PI * t) / 10) * h * 0.5]);
	fillUV(ctx, q, dome, fill);
	drawSpire(ctx, q, u, baseV - h * 0.9, h * 0.45, fill);
}

/** The view through the glass: a distant city rendered with atmospheric depth —
 *  layers recede into the sky haze, soft gradient tops, low contrast, warm window
 *  glows after dark. The sky colour itself drives the haze, so it tracks weather
 *  and time of day. */
function drawSkyline(ctx: Ctx, q: Quad, light: Lighting, p: Preset): void {
	const day = light.daylight;
	const sky = light.skyBottom; // horizon sky — the colour everything recedes toward
	const solid = lerpRGB([8, 11, 24], [66, 82, 108], day); // a near building at full strength
	const lit = day < 0.5;
	// Bad weather and fog flatten the city toward the sky (less contrast).
	const flat = Math.min(0.82, p.haze * 0.85 + (1 - p.darken) * 0.4);
	const horizon = 0.92; // low, so the sky dominates and the city sits behind him

	const topPt = bilerp(q, 0.5, horizon - 0.2);
	const botPt = bilerp(q, 0.5, 1);
	const nearBoxes: Box[] = [];
	const LAYERS = 3;

	for (let L = 0; L < LAYERS; L++) {
		const t = L / (LAYERS - 1); // 0 far … 1 near
		// Atmospheric perspective: far layers sit close to the sky colour, the near
		// layer is the most saturated. A vertical gradient softens every roofline.
		let colBot = lerpRGB(sky, solid, 0.22 + 0.4 * t);
		let colTop = lerpRGB(sky, colBot, 0.45);
		colBot = lerpRGB(colBot, sky, flat * (0.7 - 0.3 * t));
		colTop = lerpRGB(colTop, sky, Math.min(0.92, flat + 0.18));
		const grad = ctx.createLinearGradient(topPt.x, topPt.y, botPt.x, botPt.y);
		grad.addColorStop(0, rgb(colTop));
		grad.addColorStop(1, rgb(colBot));

		const baseV = horizon - 0.075 * (1 - t); // far layers sit higher, near sits low
		const amp = 0.06 + 0.07 * t;
		const pts = layerSilhouette(baseV, amp, L * 137 + 7, L === LAYERS - 1 ? nearBoxes : null);
		ctx.beginPath();
		for (let i = 0; i < pts.length; i++) {
			const s = bilerp(q, pts[i][0], pts[i][1]);
			i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y);
		}
		ctx.closePath();
		ctx.fillStyle = grad;
		ctx.fill();
	}

	// Two deterministic Budapest landmarks rising out of the near layer.
	const markCol = rgb(lerpRGB(lerpRGB(sky, solid, 0.6), sky, flat * 0.4));
	drawDomeSpire(ctx, q, 0.24, horizon, 0.045, 0.17, markCol);
	drawSpire(ctx, q, 0.79, horizon, 0.2, markCol);

	// Soft warm windows on the near buildings at dusk / night.
	if (lit) {
		const a = 0.4 + 0.45 * (1 - day);
		for (const b of nearBoxes) {
			const cols = Math.max(1, Math.round((b.u1 - b.u0) / 0.02));
			const rows = Math.max(1, Math.round((1 - b.roof) / 0.07));
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					if (rnd(b.u0 * 997 + r * 7 + c * 13 + 1) < 0.62) continue;
					const wu = b.u0 + ((c + 0.5) / cols) * (b.u1 - b.u0);
					const wv = b.roof + 0.05 + ((r + 0.5) / rows) * (1 - b.roof - 0.08);
					const s = bilerp(q, wu, wv);
					const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 3);
					glow.addColorStop(0, rgba([255, 222, 158], a));
					glow.addColorStop(1, rgba([255, 222, 158], 0));
					ctx.fillStyle = glow;
					ctx.fillRect(s.x - 3, s.y - 3, 6, 6);
				}
			}
		}
	}
}

type Scenery = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

/** Draw an illustrated cityscape, anchored to the window's lower edge (the sill)
 *  and scaled by `zoom` × the window width — zoom > 1 enlarges the city and
 *  lifts it up the window, cropping the far edges. Its transparent sky lets the
 *  live sky show above; the image is horizontally centred. */
function drawSceneryImage(ctx: Ctx, q: Quad, img: Scenery, zoom: number): void {
	const iw = img.width, ih = img.height;
	if (!iw || !ih) return;
	const minX = Math.min(q[0].x, q[1].x, q[2].x, q[3].x);
	const maxX = Math.max(q[0].x, q[1].x, q[2].x, q[3].x);
	const maxY = Math.max(q[0].y, q[1].y, q[2].y, q[3].y);
	const w = maxX - minX;
	const drawW = w * zoom;
	const drawH = (drawW * ih) / iw;
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(q[0].x, q[0].y);
	ctx.lineTo(q[1].x, q[1].y);
	ctx.lineTo(q[2].x, q[2].y);
	ctx.lineTo(q[3].x, q[3].y);
	ctx.closePath();
	ctx.clip();
	ctx.drawImage(img, minX - (drawW - w) / 2, maxY - drawH, drawW, drawH);
	ctx.restore();
}

export function drawWindow(ctx: Ctx, q: Quad, weather: WeatherId, light: Lighting, tMs: number, scenery: Scenery | null = null, sceneryZoom = 1): void {
	const p = PRESETS[weather];
	const top = lerpRGB(light.skyTop, GREY_T, p.cloud * 0.7);
	const bot = lerpRGB(light.skyBottom, GREY_B, p.cloud * 0.7);

	ctx.save();
	// Clip everything outside to the window opening.
	ctx.beginPath();
	ctx.moveTo(q[0].x, q[0].y);
	ctx.lineTo(q[1].x, q[1].y);
	ctx.lineTo(q[2].x, q[2].y);
	ctx.lineTo(q[3].x, q[3].y);
	ctx.closePath();
	ctx.clip();

	// Sky gradient (top edge -> bottom edge of the window).
	const tm = { x: (q[0].x + q[1].x) / 2, y: (q[0].y + q[1].y) / 2 };
	const bm = { x: (q[2].x + q[3].x) / 2, y: (q[2].y + q[3].y) / 2 };
	const grad = ctx.createLinearGradient(tm.x, tm.y, bm.x, bm.y);
	const topD: RGB = [top[0] * p.darken, top[1] * p.darken, top[2] * p.darken];
	const botD: RGB = [bot[0] * p.darken, bot[1] * p.darken, bot[2] * p.darken];
	grad.addColorStop(0, rgb(topD));
	grad.addColorStop(1, rgb(botD));
	ctx.fillStyle = grad;
	ctx.fill();

	// Sun or moon, tracking the hour across the window, dimmed by cloud.
	const disc = (1 - p.cloud) * (light.daylight > 0.15 ? 1 : 0.7);
	if (disc > 0.05) {
		// Track the real solar arc: light.hour is sun-normalised so sunrise≈6.5
		// (left) and sunset≈20 (right), giving the disc its east→west path.
		const u = Math.max(0.08, Math.min(0.92, (light.hour - 6.5) / 13.5));
		const c = light.daylight > 0.3 ? '255,238,180' : '226,230,238';
		const pos = bilerp(q, u, 0.28);
		const rg = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 16);
		rg.addColorStop(0, `rgba(${c},${disc})`);
		rg.addColorStop(1, `rgba(${c},0)`);
		ctx.fillStyle = rg;
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
		ctx.fill();
	}

	// Stars at night.
	if (light.stars > 0.05 && p.cloud < 0.6) {
		for (let i = 0; i < 14; i++) {
			const tw = 0.4 + 0.6 * Math.abs(Math.sin(tMs * 0.002 + i));
			const s = bilerp(q, rnd(i), rnd(i + 50) * 0.6);
			ctx.fillStyle = rgba([235, 240, 255], light.stars * tw * (1 - p.cloud));
			ctx.fillRect(s.x, s.y, 1, 1);
		}
	}

	// The view: an illustrated cityscape if supplied, else the procedural skyline.
	// Drawn behind the weather so cloud and rain pass in front.
	if (scenery) drawSceneryImage(ctx, q, scenery, sceneryZoom);
	else drawSkyline(ctx, q, light, p);

	// Drifting clouds.
	if (p.cloud > 0.05) {
		for (let i = 0; i < 5; i++) {
			const u = (rnd(i) + tMs * 0.00002 * (1 + (i & 1))) % 1.2 - 0.1;
			const v = 0.12 + rnd(i + 9) * 0.4;
			const c = bilerp(q, u, v);
			ctx.fillStyle = rgba([210, 214, 224], 0.16 + p.cloud * 0.22);
			ctx.beginPath();
			ctx.ellipse(c.x, c.y, 14 + i * 3, 6, 0, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	// Precipitation.
	if (p.precip === 'rain') {
		const n = p.heavy ? 60 : 34;
		ctx.strokeStyle = rgba([180, 200, 230], p.heavy ? 0.6 : 0.42);
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (let i = 0; i < n; i++) {
			const u = rnd(i);
			const v = (rnd(i + 7) + tMs * (p.heavy ? 0.0016 : 0.0011)) % 1;
			const s = bilerp(q, u, v);
			ctx.moveTo(s.x, s.y);
			ctx.lineTo(s.x - 1, s.y + (p.heavy ? 8 : 6));
		}
		ctx.stroke();
	} else if (p.precip === 'snow') {
		for (let i = 0; i < 40; i++) {
			const v = (rnd(i + 3) + tMs * 0.00035) % 1;
			const u = (rnd(i) + Math.sin(tMs * 0.001 + i) * 0.04 + 1) % 1;
			const s = bilerp(q, u, v);
			ctx.fillStyle = rgba([238, 242, 252], 0.85);
			ctx.fillRect(s.x, s.y, 1.4, 1.4);
		}
	}

	// Haze / fog wash.
	if (p.haze > 0.02) {
		ctx.fillStyle = rgba([198, 204, 214], p.haze * 0.5);
		ctx.fill();
	}
	ctx.restore();

	// Outer frame on top (opaque, outside the clip). No mullions — a single pane.
	const frame = '74,52,32';
	qrect(ctx, q, 0.0, 0.0, 1.0, 0.06, `rgb(${frame})`);
	qrect(ctx, q, 0.0, 0.94, 1.0, 1.0, `rgb(${frame})`);
	qrect(ctx, q, 0.0, 0.0, 0.06, 1.0, `rgb(${frame})`);
	qrect(ctx, q, 0.94, 0.0, 1.0, 1.0, `rgb(${frame})`);
}


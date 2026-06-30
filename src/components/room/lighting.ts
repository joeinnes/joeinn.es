// Time-of-day lighting.
//
// Sprites are pre-shaded, so we never re-render them for the hour — instead we
// (a) multiply the whole room by an ambient grade, then (b) add coloured glow
// from the CRT / TV / lamp on top. Glow strengthens as daylight falls.

import { VIEW_W, VIEW_H } from './iso';
import { lerpRGB, rgb, rgba, type RGB } from './palette';

/** A glow source in screen (logical) space. */
export type GlowLight = {
	x: number;
	y: number;
	color: RGB;
	radius: number;
	intensity: number;
	pulse: number;
	/** ellipse scale, rotation + centre offset for a directional cast (default: circle). */
	sx?: number;
	sy?: number;
	rot?: number;
	ox?: number;
	oy?: number;
	/** when this light is on (default: the lamp schedule) */
	sched?: Sched;
};

/** A polygon (logical space) whose interior masks out glow — drag the corners. */
export type GlowBox = { x: number; y: number }[];

/** A soft glow that emanates from a whole quad (like the window or a screen). */
export type AreaLight = {
	quad: { x: number; y: number }[];
	color: RGB;
	intensity: number;
	/** how far the glow reaches into the room (px) */
	reach?: number;
	/** when this area light is on (default: the lamp schedule) */
	sched?: Sched;
};

type Ctx = CanvasRenderingContext2D;

export type Lighting = {
	/** multiply grade applied to the whole room */
	grade: RGB;
	/** sky colours seen through the window */
	skyTop: RGB;
	skyBottom: RGB;
	/** 0 = pitch night, 1 = noon */
	daylight: number;
	/** 0..1 — are the room's lamps on (the default lamp schedule) */
	lampsOn: number;
	/** twinkle factor for stars */
	stars: number;
	/** current hour (0..24), for custom light schedules */
	hour: number;
};

/** When a light is on: the default lamp schedule, daylight, or a custom hour window. */
export type Sched = 'lamp' | 'day' | { on: number; off: number };

// Sunrise / sunset anchors (local hours). Later these can come from real
// geolocation + date; for now they drive the lamp schedule and dawn/dusk.
const SUNRISE = 6.5;
const SUNSET = 20.0;

type Key = { h: number; grade: RGB; skyTop: RGB; skyBottom: RGB; stars: number };

// Keyframes around the clock. 23:00–06:00 is deep, near-dark.
const KEYS: Key[] = [
	{ h: 0, grade: [16, 18, 32], skyTop: [8, 10, 28], skyBottom: [16, 18, 40], stars: 1 },
	{ h: 5, grade: [30, 32, 52], skyTop: [30, 30, 70], skyBottom: [70, 56, 78], stars: 0.6 },
	{ h: 6.5, grade: [150, 132, 142], skyTop: [120, 150, 210], skyBottom: [245, 180, 130], stars: 0.1 },
	{ h: 8.5, grade: [236, 226, 214], skyTop: [96, 158, 230], skyBottom: [186, 218, 242], stars: 0 },
	{ h: 13, grade: [255, 252, 246], skyTop: [70, 142, 224], skyBottom: [168, 208, 238], stars: 0 },
	{ h: 17, grade: [246, 224, 196], skyTop: [96, 140, 210], skyBottom: [240, 176, 120], stars: 0 },
	{ h: 20, grade: [214, 170, 146], skyTop: [60, 60, 120], skyBottom: [236, 120, 86], stars: 0.1 },
	{ h: 21.5, grade: [96, 90, 132], skyTop: [30, 30, 72], skyBottom: [84, 60, 104], stars: 0.5 },
	{ h: 23, grade: [28, 30, 50], skyTop: [12, 14, 36], skyBottom: [22, 24, 50], stars: 0.9 },
	{ h: 24, grade: [16, 18, 32], skyTop: [8, 10, 28], skyBottom: [16, 18, 40], stars: 1 },
];

/** Trapezoid: 0 outside [a,b], 1 inside, linear `edge`-hour ramps. */
function ramp(t: number, a: number, b: number, edge: number): number {
	return Math.max(0, Math.min(1, (t - a) / edge, (b - t) / edge));
}

// Lamps on in the morning (05:00 → sunrise+1h) and evening (sunset−1h → 23:00);
// off in bright daylight and in the deep-dark 23:00–05:00 window.
function lampSchedule(t: number): number {
	return Math.max(ramp(t, 5, SUNRISE + 1, 0.5), ramp(t, SUNSET - 1, 23, 0.5));
}

export function getLighting(hour: number): Lighting {
	const t = ((hour % 24) + 24) % 24;
	let a = KEYS[0];
	let b = KEYS[KEYS.length - 1];
	for (let i = 0; i < KEYS.length - 1; i++) {
		if (t >= KEYS[i].h && t <= KEYS[i + 1].h) {
			a = KEYS[i];
			b = KEYS[i + 1];
			break;
		}
	}
	const f = b.h === a.h ? 0 : (t - a.h) / (b.h - a.h);
	const grade = lerpRGB(a.grade, b.grade, f);
	const lum = (grade[0] + grade[1] + grade[2]) / 3 / 255;
	return {
		grade,
		skyTop: lerpRGB(a.skyTop, b.skyTop, f),
		skyBottom: lerpRGB(a.skyBottom, b.skyBottom, f),
		daylight: Math.max(0, Math.min(1, (lum - 0.12) / (0.96 - 0.12))),
		lampsOn: lampSchedule(t),
		stars: a.stars + (b.stars - a.stars) * f,
		hour: t,
	};
}

/**
 * Remap a real clock hour so the lighting keyframes — authored against a
 * notional sunrise≈6.5 / sunset≈20 — fire at the location's *actual* sunrise and
 * sunset. Daytime stretches/squeezes to fit real daylight; night does likewise.
 */
export function solarHour(hour: number, sunrise: number, sunset: number): number {
	const h = ((hour % 24) + 24) % 24;
	if (h < sunrise) return (h / Math.max(0.01, sunrise)) * SUNRISE;
	if (h < sunset) return SUNRISE + ((h - sunrise) / Math.max(0.01, sunset - sunrise)) * (SUNSET - SUNRISE);
	return SUNSET + ((h - sunset) / Math.max(0.01, 24 - sunset)) * (24 - SUNSET);
}

/** 0..1 — is a light on, given its schedule and the current lighting. */
export function schedFactor(sched: Sched | undefined, light: Lighting): number {
	if (!sched || sched === 'lamp') return light.lampsOn;
	if (sched === 'day') return light.daylight;
	return ramp(light.hour, sched.on, sched.off, 0.3);
}

/** Multiply the whole buffer by the ambient grade. */
export function applyGrade(ctx: Ctx, light: Lighting): void {
	ctx.save();
	ctx.globalCompositeOperation = 'multiply';
	ctx.fillStyle = rgb(light.grade);
	ctx.fillRect(0, 0, VIEW_W, VIEW_H);
	ctx.restore();
}

/** Additively splash coloured, directional glow from each lamp onto the room. */
export function drawGlow(ctx: Ctx, lights: GlowLight[], light: Lighting, tMs: number, flash: number): void {
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	for (const e of lights) {
		const on = schedFactor(e.sched, light);
		const pulse = 1 + Math.sin(tMs * 0.004 + e.x + e.y) * e.pulse;
		const strength = e.intensity * on * pulse;
		if (strength <= 0.01) continue;
		// Elliptical, offset gradient so the light pools onto a surface rather
		// than sitting as a symmetric dot.
		ctx.save();
		ctx.translate(e.x + (e.ox ?? 0), e.y + (e.oy ?? 0));
		ctx.rotate(e.rot ?? 0);
		ctx.scale(e.sx ?? 1, e.sy ?? 1);
		const g = ctx.createRadialGradient(0, 0, 0, 0, 0, e.radius);
		g.addColorStop(0, rgba(e.color, 0.44 * strength));
		g.addColorStop(0.4, rgba(e.color, 0.16 * strength));
		g.addColorStop(1, rgba(e.color, 0));
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
	if (flash > 0.01) {
		ctx.fillStyle = `rgba(210,224,255,${0.32 * flash})`;
		ctx.fillRect(0, 0, VIEW_W, VIEW_H);
	}
	ctx.restore();
}

/**
 * Soft daylight spilling into the room from the WHOLE window (an area, not a
 * point), tinted by the sky and dimmed by the weather. Fades to nothing at night.
 */
export function drawAreaLight(
	ctx: Ctx,
	quad: { x: number; y: number }[],
	color: RGB,
	intensity: number,
	tMs: number,
	reach = 74,
): void {
	if (intensity < 0.02 || quad.length < 4) return;
	let cx = 0, cy = 0;
	for (const p of quad) {
		cx += p.x;
		cy += p.y;
	}
	cx /= quad.length;
	cy /= quad.length;
	// Direction from the quad toward the room interior.
	let dx = VIEW_W * 0.45 - cx, dy = VIEW_H * 0.56 - cy;
	const dl = Math.hypot(dx, dy) || 1;
	dx /= dl;
	dy /= dl;
	const a = intensity * (1 + Math.sin(tMs * 0.0013) * 0.03); // gentle shimmer
	ctx.save();
	ctx.globalCompositeOperation = 'lighter';
	ctx.translate(cx + dx * 26, cy + dy * 26);
	ctx.rotate(Math.atan2(dy, dx));
	ctx.scale(2.1, 0.95); // elongated into the room
	const g = ctx.createRadialGradient(0, 0, 0, 0, 0, reach);
	g.addColorStop(0, rgba(color, 0.32 * a));
	g.addColorStop(0.5, rgba(color, 0.12 * a));
	g.addColorStop(1, rgba(color, 0));
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.arc(0, 0, reach, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}

/** Daylight spilling from the window — an area light tinted by sky, dimmed by weather. */
export function drawWindowLight(
	ctx: Ctx,
	quad: { x: number; y: number }[],
	light: Lighting,
	weatherDim: number,
	tMs: number,
): void {
	const intensity = light.daylight * weatherDim;
	if (intensity < 0.02) return;
	let col = lerpRGB(light.skyBottom, [255, 252, 244], 0.4); // daylight-tinted sky
	col = lerpRGB(col, [156, 158, 162], (1 - weatherDim) * 0.6); // greyer when overcast
	drawAreaLight(ctx, quad, col, intensity, tMs, 78);
}

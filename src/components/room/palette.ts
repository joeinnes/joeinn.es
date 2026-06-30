// The 32-bit "unify" pass.
//
// PS1/Saturn-era pixel art gets its coherence from a shared palette plus
// ordered dithering. Everything we draw — placeholders today, real sprites
// later — is funnelled through quantisation to ONE palette so the room reads as
// a single artwork rather than a ransom note of mismatched assets.

export type RGB = [number, number, number];

// A curated ~56-colour palette: cool neutrals plus tight 4-6 step ramps for the
// materials in the room (wood, screen-cyan, TV-blue, plant-green, lamp-amber,
// upholstery red/purple, skin for a future avatar). Ramps share a light
// direction so shaded faces land on sensible neighbours.
const HEX = [
	// cool neutrals (shadow -> highlight)
	'0d0e14', '1b1d29', '2c2f3f', '3f4357', '565b73', '6f7591', '8a90ad', 'a8aec8', 'c8cde0', 'eef1fb',
	// warm wood / floor
	'2a1a12', '4a2c1c', '6e4128', '935a34', 'b87a45', 'd99a5c', 'ecc187', 'f7e0b0',
	// reds (sofa, accents)
	'3a1220', '6e1f2e', 'a32f3a', 'd24f4a', 'ef7e6b',
	// greens (plant)
	'13301d', '1f4a2c', '2f6b3c', '4a9a55', '79c46f', 'b6e69a',
	// teal / cyan (CRT screen glow)
	'06303a', '0a5566', '0e8aa0', '1fc3d6', '7defee',
	// blue (TV, sky)
	'10204a', '1c3a78', '2f5fb0', '4f93e0', '8fc2f5', 'cfe6ff',
	// purple / pink
	'2a1640', '4a2870', '6f44a8', '9b6fd6', 'c79bf0', 'f0b8d8',
	// yellow / amber (lamp, VU meters)
	'4a3410', '7a5616', 'b5841f', 'e6b53a', 'ffd970', 'fff0b0',
	// skin (reserved for a future avatar / warm dressing)
	'6e4534', '9c6a4e', 'c98e6a', 'ecbf9a',
];

export const PALETTE: RGB[] = HEX.map((h) => [
	parseInt(h.slice(0, 2), 16),
	parseInt(h.slice(2, 4), 16),
	parseInt(h.slice(4, 6), 16),
]);

// 32x32x32 RGB -> nearest palette index lookup, built once. Quantising a frame
// then costs one array read per pixel instead of a full nearest-colour search.
let LUT: Uint8Array | null = null;
function buildLUT(): Uint8Array {
	const lut = new Uint8Array(32 * 32 * 32);
	for (let r = 0; r < 32; r++) {
		for (let g = 0; g < 32; g++) {
			for (let b = 0; b < 32; b++) {
				const R = (r << 3) | (r >> 2);
				const G = (g << 3) | (g >> 2);
				const B = (b << 3) | (b >> 2);
				let best = 0;
				let bestD = Infinity;
				for (let i = 0; i < PALETTE.length; i++) {
					const p = PALETTE[i];
					const dr = R - p[0];
					const dg = G - p[1];
					const db = B - p[2];
					const d = dr * dr + dg * dg + db * db;
					if (d < bestD) {
						bestD = d;
						best = i;
					}
				}
				lut[(r << 10) | (g << 5) | b] = best;
			}
		}
	}
	return lut;
}

// 4x4 Bayer matrix, centred to roughly [-0.5, 0.5] for ordered dithering.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.5);

// Deterministic low-frequency noise tile for film grain (no Math.random, so SSR
// and first paint stay stable). Simple LCG.
const NOISE = (() => {
	const n = new Int8Array(64 * 64);
	let s = 0x9e3779b9;
	for (let i = 0; i < n.length; i++) {
		s = (s * 1664525 + 1013904223) & 0xffffffff;
		n[i] = ((s >>> 24) & 0xff) - 128;
	}
	return n;
})();

export type PostFXOptions = {
	palette: boolean;
	dither: boolean;
	scanlines: boolean;
	grain: boolean;
	frame: number;
};

/** Run the unify pass over a full-frame ImageData, in place. */
export function applyPostFX(img: ImageData, o: PostFXOptions): void {
	if (!LUT) LUT = buildLUT();
	const lut = LUT;
	const d = img.data;
	const w = img.width;
	const h = img.height;
	const ditherAmt = o.dither ? 6 : 0;
	const gx = (o.frame * 7) & 63;
	const gy = (o.frame * 13) & 63;

	let i = 0;
	for (let y = 0; y < h; y++) {
		// 2px-period lines at low contrast (readable at the higher backing res).
		const scan = o.scanlines && (y >> 1) & 1 ? 0.92 : 1;
		const brow = (y & 3) << 2;
		for (let x = 0; x < w; x++, i += 4) {
			let r = d[i];
			let g = d[i + 1];
			let b = d[i + 2];

			if (scan !== 1) {
				r *= scan;
				g *= scan;
				b *= scan;
			}
			if (o.grain) {
				const nz = NOISE[((y + gy) & 63) * 64 + ((x + gx) & 63)] * 0.03;
				r += nz;
				g += nz;
				b += nz;
			}
			if (o.palette) {
				if (ditherAmt) {
					const dz = BAYER[brow | (x & 3)] * ditherAmt;
					r += dz;
					g += dz;
					b += dz;
				}
				const ri = r < 0 ? 0 : r > 255 ? 31 : (r | 0) >> 3;
				const gi = g < 0 ? 0 : g > 255 ? 31 : (g | 0) >> 3;
				const bi = b < 0 ? 0 : b > 255 ? 31 : (b | 0) >> 3;
				const p = PALETTE[lut[(ri << 10) | (gi << 5) | bi]];
				d[i] = p[0];
				d[i + 1] = p[1];
				d[i + 2] = p[2];
			} else {
				d[i] = r < 0 ? 0 : r > 255 ? 255 : r;
				d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
				d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
			}
		}
	}
}

// ---- colour helpers (kept here so scene + lighting share one definition) ----

/** Scale a colour toward black (f<1) or white (f>1). */
export function shade(c: RGB, f: number): RGB {
	if (f <= 1) return [c[0] * f, c[1] * f, c[2] * f];
	const t = f - 1;
	return [c[0] + (255 - c[0]) * t, c[1] + (255 - c[1]) * t, c[2] + (255 - c[2]) * t];
}

export function rgb(c: RGB): string {
	return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
}

export function rgba(c: RGB, a: number): string {
	return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
}

export function lerpRGB(a: RGB, b: RGB, t: number): RGB {
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

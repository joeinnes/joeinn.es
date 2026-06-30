// Isometric projection maths for the studio-apartment scene.
//
// Classic 2:1 dimetric ("pixel isometric") projection: a tile is twice as wide
// as it is tall, so diagonals land on clean pixel steps. The room is a grid of
// ROOM_W x ROOM_D tiles. gx grows toward screen-right-and-down, gy toward
// screen-left-and-down. The far corner where the two back walls meet is (0, 0);
// the near corner closest to the camera is (ROOM_W, ROOM_D).

export const TILE_W = 50;
export const TILE_H = 25;
export const HALF_W = TILE_W / 2; // 25
export const HALF_H = TILE_H / 2; // 12.5

// Object heights and WALL_H were authored against a 36px tile. Scale every z by
// this so furniture and walls keep their proportions when the tile size changes
// — tweak TILE_W to resize the whole room and heights track automatically.
export const Z_SCALE = TILE_W / 36;

export const ROOM_W = 9; // tiles along gx (east wall sits at gy = 0)
export const ROOM_D = 8; // tiles along gy (west wall sits at gx = 0)
export const WALL_H = 92; // wall height in authoring px (rendered × Z_SCALE)

// Drawing happens in this *logical* 640x360 space; the actual backing store is
// SCALE times bigger so pixels are finer and the post-fx reads as texture, not
// a crude overlay. Bump SCALE for more density (heavier post-fx pass).
export const VIEW_W = 640;
export const VIEW_H = 360;
export const SCALE = 2;
export const BUFFER_W = VIEW_W * SCALE;
export const BUFFER_H = VIEW_H * SCALE;

// Chosen so the room sits centred horizontally and a touch below middle,
// leaving headroom above for the walls. See the corner maths in scene.ts.
export const ORIGIN_X = 308;
export const ORIGIN_Y = 136;

export type Pt = { x: number; y: number };

/** Project a grid coordinate (gx, gy) at height z (px) to screen space. */
export function worldToScreen(gx: number, gy: number, z = 0): Pt {
	return {
		x: (gx - gy) * HALF_W + ORIGIN_X,
		y: (gx + gy) * HALF_H + ORIGIN_Y - z * Z_SCALE,
	};
}

/** Painter's-algorithm depth key: smaller = further from camera = drawn first. */
export function depthKey(gx: number, gy: number, z = 0): number {
	return gx + gy + z * 0.0015;
}

/** Bilinear interpolation across four ordered corners (TL, TR, BR, BL). */
export function bilerp(c: [Pt, Pt, Pt, Pt], u: number, v: number): Pt {
	const top = { x: c[0].x + (c[1].x - c[0].x) * u, y: c[0].y + (c[1].y - c[0].y) * u };
	const bot = { x: c[3].x + (c[2].x - c[3].x) * u, y: c[3].y + (c[2].y - c[3].y) * u };
	return { x: top.x + (bot.x - top.x) * v, y: top.y + (bot.y - top.y) * v };
}

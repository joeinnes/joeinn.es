import type { APIRoute } from "astro";
import { appleMusicArtwork } from "../../lib/now";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) {
    return Response.json({ cover: null }, { status: 400 });
  }

  return Response.json(
    { cover: await appleMusicArtwork(id) },
    {
      headers: {
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    },
  );
};

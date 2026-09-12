import { beforeEach, describe, expect, it, vi } from "vitest";

const appleMusicArtwork = vi.hoisted(() => vi.fn());

vi.mock("./now", () => ({ appleMusicArtwork }));

import { GET } from "../pages/api/track-artwork";

function request(path: string) {
  return { url: new URL(`https://joeinn.es${path}`) } as Parameters<typeof GET>[0];
}

describe("track artwork endpoint", () => {
  beforeEach(() => {
    appleMusicArtwork.mockReset();
  });

  it("resolves a validated Apple Music track id", async () => {
    appleMusicArtwork.mockResolvedValue(
      "https://is1-ssl.mzstatic.com/image/thumb/Music/cover.jpg/250x250bb.jpg",
    );

    const response = await GET(request("/api/track-artwork?id=123"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      cover: "https://is1-ssl.mzstatic.com/image/thumb/Music/cover.jpg/250x250bb.jpg",
    });
    expect(appleMusicArtwork).toHaveBeenCalledWith("123");
  });

  it("rejects missing or non-numeric ids", async () => {
    const response = await GET(request("/api/track-artwork?id=not-an-id"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ cover: null });
    expect(appleMusicArtwork).not.toHaveBeenCalled();
  });
});

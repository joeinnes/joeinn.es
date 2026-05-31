import type { APIRoute } from "astro";
import { generatePublicationWellKnown } from "@bryanguffey/astro-standard-site";
import config from "../../../standard-site.config.json";

// Verification endpoint: returns the AT-URI of the site.standard.publication
// record, proving this site owns it. Prerendered to a static file.
export const prerender = true;

export const GET: APIRoute = () =>
  new Response(
    generatePublicationWellKnown({
      did: config.did,
      publicationRkey: config.publicationRkey,
    }),
    { headers: { "Content-Type": "text/plain" } },
  );

import type { APIRoute } from "astro";

// Served per-origin (not prerendered) so OAuth works on the production domain
// AND on Vercel preview URLs: the client_id IS this document's URL, so it must
// match whichever origin actually fetched it. Keep `scope` in sync with
// SCOPE in src/components/admin/atproto/oauthClient.ts.
export const prerender = false;

export const GET: APIRoute = ({ request, url }) => {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const origin = `${proto}://${host}`;

  const metadata = {
    client_id: `${origin}/client-metadata.json`,
    client_name: "joeinn.es admin",
    client_uri: origin,
    redirect_uris: [`${origin}/admin`],
    scope: "atproto transition:generic",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    application_type: "web",
    dpop_bound_access_tokens: true,
  };

  return new Response(JSON.stringify(metadata, null, 2), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=300",
    },
  });
};

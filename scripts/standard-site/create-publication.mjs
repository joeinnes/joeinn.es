// One-time setup: create (or reuse) the site.standard.publication record for the
// blog, and print its rkey. Idempotent — re-running will not create duplicates.
//
// Run locally with a Bluesky app password (Settings → Privacy and security →
// App passwords). The password never leaves your machine:
//
//   ATPROTO_APP_PASSWORD='xxxx-xxxx-xxxx-xxxx' node scripts/standard-site/create-publication.mjs
//
// Copy the printed rkey into src/pages/.well-known/site.standard.publication.ts.

import { StandardSitePublisher } from "@bryanguffey/astro-standard-site/publisher";

const HANDLE = "joeinn.es";
const SITE_URL = "https://joeinn.es";

const password = process.env.ATPROTO_APP_PASSWORD;
if (!password) {
  console.error(
    "Missing ATPROTO_APP_PASSWORD. Create an app password at\n" +
      "https://bsky.app/settings/app-passwords and run:\n\n" +
      "  ATPROTO_APP_PASSWORD='xxxx-xxxx-xxxx-xxxx' node scripts/standard-site/create-publication.mjs",
  );
  process.exit(1);
}

const publisher = new StandardSitePublisher({ identifier: HANDLE, password });

await publisher.login();
console.log(`Logged in as ${publisher.getDid()} via ${publisher.getPdsUrl()}`);

// Reuse an existing publication for this site if one is already present.
const existing = await publisher.listPublications();
const match = existing.find((p) => p.value?.url === SITE_URL);
if (match) {
  console.log("\nPublication already exists — nothing to do.");
  console.log(`AT-URI : ${match.uri}`);
  console.log(`rkey   : ${match.uri.split("/").pop()}`);
  process.exit(0);
}

const result = await publisher.publishPublication({
  name: "Joe Innes",
  url: SITE_URL,
  description: "Personal website and blog of Joe Innes.",
});

console.log("\nPublication created.");
console.log(`AT-URI : ${result.uri}`);
console.log(`rkey   : ${result.uri.split("/").pop()}`);
console.log(
  "\nNext: paste that rkey into src/pages/.well-known/site.standard.publication.ts",
);

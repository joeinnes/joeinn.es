---
name: add-i-shipped
description: Publish i-shipped records directly to ATProto when the user explicitly requests direct PDS publishing. Daily maintenance and local content authoring use the update-i-shipped-entries automation.
---

# Publish i-shipped Records Directly to ATProto

Use this workflow only when the user explicitly asks to create records directly
in the `es.joeinn.shipped` collection on the `joeinn.es` ATProto repo. Daily
maintenance and contribution authoring use local
`src/content/i-shipped/*.mdx` files through the `update-i-shipped-entries`
automation. This skill does not define or override that workflow.

## Safety

- Do not run `pnpm run standard-site:sync`. That command treats local MDX as
  desired state and can delete canonical ATProto records that are absent locally.
- Plan all candidates before writing. Create records only; never update or
  delete existing `es.joeinn.shipped` records.
- Require `ATPROTO_APP_PASSWORD` before any write. Without it, perform only a
  read-only discovery/dry run and report that nothing was published.
- Never print the app password or include it in command output.
- If a write fails after earlier records were created, stop and report the
  successfully created record URIs. Do not blindly retry or attempt cleanup.
- Do not change local content, dependency files, the manifest, branches,
  commits, or remotes for this workflow.

## Read the canonical collection

Use the public PDS endpoint with repo `joeinn.es` and collection
`es.joeinn.shipped`:

```text
https://bsky.social/xrpc/com.atproto.repo.listRecords?repo=joeinn.es&collection=es.joeinn.shipped&limit=100
```

Follow `cursor` until it is absent. Build the covered set from each record's
`value.repo` and `value.prNumber` pair; PR numbers are only unique within a
repository. Read `value.mergedAt` to find the newest existing merge date. Do
not infer coverage from filenames, local MDX, PR titles, or PR numbers alone.

For writes, use the reusable helper below with `ATPROTO_APP_PASSWORD` loaded
from `.env`:

```bash
node --env-file-if-exists=.env scripts/standard-site/add-shipped-record.mjs \
  --repo owner/repository \
  --pr 1234 \
  --summary "a natural phrase completing I shipped..." \
  --description "I fixed ... by ..." \
  --merged-at 2026-07-15T12:34:56.000Z
```

The helper rechecks the live collection, skips an existing `(repo, prNumber)`
pair, creates with `com.atproto.repo.createRecord`, and verifies the returned
URI is visible afterward. Use `--dry-run` to inspect the exact record without
logging in or writing.

## Discover qualifying pull requests

Search GitHub for merged pull requests authored by the exact login `joeinnes`.
When records exist, search from 30 days before the newest `mergedAt` to provide
an overlap window; when none exist, search all history. Paginate through every
relevant result. For every candidate:

1. Verify the individual pull request has `user.login === "joeinnes"` and a
   non-null `merged_at`.
2. Fetch `/repos/{owner}/{repo}` and require `private === false`.
3. Skip `joeinnes/joeinn.es`.
4. Skip the `(repo, prNumber)` pair if it is already in the PDS covered set.
5. Fetch the individual pull request endpoint when the search result does not
   provide enough context for a useful description. Do not invent details.

Use the UTC calendar date from `merged_at` for the contribution's `mergedAt`.
Sort candidates by merge time before presenting the write plan. Recheck the
PDS covered set immediately before creating records so a concurrent run cannot
create an obvious duplicate.

## Record shape

Create one record per new pull request:

```json
{
  "$type": "es.joeinn.shipped",
  "summary": "a natural phrase completing I shipped...",
  "repo": "owner/repository",
  "prNumber": "1234",
  "url": "https://github.com/owner/repository/pull/1234",
  "description": "I fixed ... by ...",
  "mergedAt": "2026-07-15T12:34:56.000Z",
  "createdAt": "2026-07-15T13:00:00.000Z"
}
```

Use the exact `merged_at` instant for `mergedAt`, not the local timezone. Set
`createdAt` to the current UTC instant when the ATProto record is created. Keep
`prNumber` as a string. Omit `description` only when there is genuinely no
useful explanation.

The `summary` should be a short, conversational rephrasing, not a verbatim PR
title, and should complete “I shipped...”. The `description` should be one to
four first-person ELI5-style sentences explaining the problem and the change;
avoid unexplained jargon. Respect the lexicon limits: summaries are at most
300 graphemes/3000 bytes and descriptions at most 3000 graphemes/30000 bytes.

## Publish and verify

Before writing, print or otherwise inspect a plan containing each repo, PR
number, summary, and merge timestamp. Validate required fields and URL format.
The helper retains the returned URI and verifies it with a fresh
`listRecords` read. Never use `putRecord` for this maintenance task: an
existing pair must be skipped, not overwritten.

If there are no qualifying PRs, make no changes and finish as a successful
no-op. If records were created, report the record URIs and the qualifying PRs;
there is no local commit or push step because the PDS is the canonical store.

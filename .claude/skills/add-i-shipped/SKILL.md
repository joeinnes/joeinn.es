---
name: add-i-shipped
description: Add new "i-shipped" entries for recently merged GitHub PRs by joeinnes. Use when the user wants to update the i-shipped section with their latest contributions.
argument-hint: [optional: specific PR number or repo]
---

# Add i-shipped Content Entries

This skill adds new entries to the "i-shipped" section of the website, which tracks merged pull requests by Joe Innes across open source projects.

## Entry format

Each entry is an MDX file at `src/content/i-shipped/<slug>.mdx` with this structure:

```mdx
---
summary: short description of what was shipped
repo: owner/repo-name
mergeDate: YYYY-MM-DD
prNumber: '1234'
---
A 1-4 sentence ELI5 description written in first person. Explain what the problem was and what you did to fix it. Avoid jargon, or explain it if you must use it.
```

### Frontmatter fields

- **summary**: Must complete the sentence "I shipped...". Don't just use the PR title verbatim -- rephrase it so it reads naturally (e.g., "a fix for...", "a new...", "contextual error hints for..."). If it contains special characters like colons or backticks, use YAML `>-` multiline syntax
- **repo**: The GitHub repo in `owner/repo` format (e.g., `garden-co/jazz`)
- **mergeDate**: The date the PR was merged, in `YYYY-MM-DD` format
- **prNumber**: The PR number as a string, wrapped in single quotes (e.g., `'3465'`)

### Slug (filename)

The filename is derived from the summary: lowercase, spaces become hyphens, special characters removed. For example:
- "add a hash" -> `add-a-hash.mdx`
- "fix(react-native): clear stored session ID" -> `fixreact-native-clear-stored-session-id-when-clearing-user-credentials.mdx`

### Body text guidelines

- Write in **first person** ("I added...", "I fixed...")
- **1-4 sentences** maximum
- **ELI5 style**: explain things simply, avoid or define jargon
- Explain **what the problem was** and **what you did**
- Be conversational, not formal

## How to find new PRs

1. The GitHub username is `joeinnes`
2. The main repo is `garden-co/jazz` (most PRs are here)
3. Check existing entries to find the highest PR number already covered:
   ```
   grep -h "prNumber:" src/content/i-shipped/*.mdx | sed "s/prNumber: //;s/['\"]//g" | sort -n | tail -5
   ```
4. Search for merged PRs newer than the latest entry:
   - Fetch `https://github.com/garden-co/jazz/pulls?q=is%3Apr+author%3Ajoeinnes+is%3Amerged+sort%3Aupdated-desc`
   - Also check other repos the user contributes to
5. For each new PR, fetch the PR page to understand the full context before writing the description

## Step-by-step process

1. **Find existing entries**: Check what's already been added by scanning existing MDX files
2. **Find new PRs**: Search GitHub for merged PRs by joeinnes that aren't yet covered
3. **Fetch PR details**: For each new PR, read the GitHub PR page to understand the change
4. **Create MDX files**: Write one file per PR following the format above
5. **Commit and push**: Group all new entries in a single commit with a descriptive message

## Schema reference

The content collection schema is defined in `src/content/config.ts`:
```typescript
const iShipped = defineCollection({
  type: "content",
  schema: z.object({
    summary: z.string(),
    repo: z.string(),
    mergeDate: z.date(),
    prNumber: z.string(),
    content: z.string(),
  }),
});
```

## Important notes

- The `gh` CLI may not be authenticated -- use WebFetch to read GitHub PR pages instead
- Always preserve existing entries unchanged
- Don't add PRs to the user's own `joeinnes/joeinn.es` repo (that's this website itself)

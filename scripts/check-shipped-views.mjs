import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const output = [".vercel/output/static", "dist/client"].find((dir) =>
  existsSync(join(dir, "i-shipped/index.html")),
);
assert.ok(output, "Build the site before checking the i-shipped views.");

function readMain(route) {
  const html = readFileSync(join(output, route, "index.html"), "utf8");
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main, `${route} must contain a main element.`);
  return main;
}

function checkTabs(main, active) {
  const links = [...main.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  for (const [label, href] of [
    ["Daily", "/i-shipped"],
    ["Monthly", "/i-shipped/monthly"],
  ]) {
    const link = links.find((match) => match[2].trim() === label);
    assert.ok(link, `Missing ${label} navigation link.`);
    assert.equal(link[1].match(/\bhref="([^"]+)"/)?.[1].replace(/\/$/, ""), href);
    assert.equal(/\baria-current="page"/.test(link[1]), label === active,
      `${label} must ${label === active ? "be" : "not be"} the current view.`);
  }
}

for (const [route, page] of [["i-shipped", 1], ["i-shipped/2", 2]]) {
  const main = readMain(route);
  checkTabs(main, "Daily");
  assert.match(main, /<article\b/, `${route} must show contributions.`);
  assert.match(main, /https:\/\/github\.com\/[^"<>]+\/pull\/\d+/);
  assert.doesNotMatch(main, /<section\b[^>]*class="digest"/);
  assert.match(main, new RegExp(`Page\\s+${page}\\s+of\\s+\\d+`));
}

const monthly = readMain("i-shipped/monthly");
checkTabs(monthly, "Monthly");
assert.match(monthly, /<section\b[^>]*class="digest"/);
assert.doesNotMatch(monthly, /<details\b|class="pagination"|class="pr-link-row"/);
const text = monthly.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
for (const month of ["2026-08", "2026-09"]) {
  const source = readFileSync(`src/content/shipped-digests/${month}.mdx`, "utf8");
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
    .replace(/\s+/g, " ").trim();
  assert.ok(text.includes(body), `${month} must render its complete summary.`);
}
const headings = [...monthly.matchAll(/<h2\b[^>]*>([^<]+)<\/h2>/g)]
  .map((match) => match[1].trim());
assert.ok(headings.includes("September 2026") && headings.includes("August 2026"));
assert.ok(headings.indexOf("September 2026") < headings.indexOf("August 2026"),
  "Monthly summaries must appear newest first.");
console.log("Daily and monthly i-shipped views passed.");

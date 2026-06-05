import { defineConfig } from "vitest/config";

// Admin-dashboard unit tests cover the pure logic only (lexicon validation,
// the NSID registry, record<->form serialisation, repo pagination). They run in
// a plain Node environment with no DOM — storage and the atproto agent are
// injected, so nothing here needs jsdom.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

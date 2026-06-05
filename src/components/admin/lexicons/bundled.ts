// Lexicon docs shipped with the dashboard. Empty for iteration 1: the dashboard
// is fully generic (raw-JSON editor for every collection), and schema-driven
// forms light up for any lexicon you register in the UI (persisted to
// localStorage). Bundling partial copies of app.bsky.* would break validation,
// since their records reference other lexicons (strongRef, selfLabels, ...) that
// would also need bundling. Custom es.joeinn.* lexicons get added here in phase 2.
export const bundledDocs: unknown[] = [];

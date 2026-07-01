// Fire the site's Vercel Deploy Hook after a publish so the static build
// regenerates with the new/edited/deleted record. Best-effort and
// non-blocking: a missing or failed hook never blocks the edit itself — the
// record is already written to the PDS regardless.
//
// PUBLIC_DEPLOY_HOOK_URL is a build-time public env var (the URL only triggers
// a rebuild, so exposure is low-risk).
const DEPLOY_HOOK_URL = import.meta.env.PUBLIC_DEPLOY_HOOK_URL as string | undefined;

export async function triggerRebuild(): Promise<void> {
  if (!DEPLOY_HOOK_URL) return;
  try {
    await fetch(DEPLOY_HOOK_URL, { method: "POST" });
  } catch {
    // Best-effort; the write already succeeded.
  }
}

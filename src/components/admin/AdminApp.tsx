import { useCallback, useEffect, useMemo, useState } from "react";
import { Agent } from "@atproto/api";
import type { BrowserOAuthClient, OAuthSession } from "@atproto/oauth-client-browser";
import { ensureDevLoopbackOrigin, getOAuthClient, SCOPE } from "./atproto/oauthClient";
import type { RepoAgent } from "./atproto/repo";
import { buildLexicons, loadCustomDocs, saveCustomDocs } from "./lexicons/registry";
import { bundledDocs } from "./lexicons/bundled";
import { SignIn } from "./SignIn";
import { CollectionList } from "./CollectionList";
import { RecordList } from "./RecordList";
import { RecordEditor } from "./RecordEditor";
import "./admin.css";

type View =
  | { name: "collections" }
  | { name: "records"; nsid: string }
  | { name: "editor"; nsid: string; rkey?: string };

type Phase = "loading" | "signedout" | "signedin";

interface BootstrapResult {
  client: BrowserOAuthClient;
  session: OAuthSession | null;
}

// Module-scoped so the OAuth callback is processed exactly once per page load,
// even with React StrictMode's double-mounted effects.
let bootstrapPromise: Promise<BootstrapResult> | null = null;
function bootstrap(): Promise<BootstrapResult> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const client = await getOAuthClient();
      const result = await client.init();
      return { client, session: result?.session ?? null } as BootstrapResult;
    })();
  }
  return bootstrapPromise;
}

export default function AdminApp() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [did, setDid] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ name: "collections" });
  const [customDocs, setCustomDocs] = useState<unknown[]>([]);

  const lex = useMemo(() => buildLexicons([...bundledDocs, ...customDocs]).lex, [customDocs]);
  const repoAgent = agent as unknown as RepoAgent | null;

  useEffect(() => {
    if (ensureDevLoopbackOrigin()) return; // bouncing localhost -> 127.0.0.1
    setCustomDocs(loadCustomDocs(localStorage));

    let cancelled = false;
    bootstrap()
      .then(({ session }) => {
        if (cancelled) return;
        if (session) {
          setAgent(new Agent(session));
          setDid(session.sub);
          setPhase("signedin");
        } else {
          setPhase("signedout");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setAuthError(err instanceof Error ? err.message : String(err));
        setPhase("signedout");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const onSignIn = useCallback(async (handle: string) => {
    setAuthError(null);
    const client = await getOAuthClient();
    await client.signIn(handle, { scope: SCOPE }); // redirects away
  }, []);

  const onSignOut = useCallback(async () => {
    try {
      if (did) {
        const client = await getOAuthClient();
        await client.revoke(did);
      }
    } finally {
      setAgent(null);
      setDid(null);
      setPhase("signedout");
      setView({ name: "collections" });
    }
  }, [did]);

  const onRegisterLexicon = useCallback((doc: unknown): string | null => {
    if (!doc || typeof doc !== "object" || typeof (doc as { id?: unknown }).id !== "string") {
      return null;
    }
    const id = (doc as { id: string }).id;
    setCustomDocs((prev) => {
      const next = [...prev.filter((d) => (d as { id?: unknown })?.id !== id), doc];
      saveCustomDocs(localStorage, next);
      return next;
    });
    return id;
  }, []);

  if (phase === "loading") {
    return (
      <div className="admin">
        <p className="admin__muted">Loading…</p>
      </div>
    );
  }

  if (phase === "signedout" || !repoAgent || !did) {
    return (
      <div className="admin">
        <header className="admin__header">
          <h1 className="admin__title">Admin</h1>
        </header>
        <SignIn defaultHandle="joeinn.es" onSignIn={onSignIn} error={authError} />
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <h1 className="admin__title">Admin</h1>
        <span className="admin__who">
          {did}{" "}
          <button
            type="button"
            className="admin__btn"
            style={{ padding: "0.1rem 0.5rem", fontSize: "0.8rem" }}
            onClick={() => void onSignOut()}
          >
            Sign out
          </button>
        </span>
      </header>

      <nav className="admin__crumbs">
        <button
          type="button"
          className="admin__btn"
          style={{ padding: "0.1rem 0.5rem" }}
          onClick={() => setView({ name: "collections" })}
        >
          Collections
        </button>
        {view.name !== "collections" ? (
          <>
            <span className="admin__muted">/</span>
            <button
              type="button"
              className="admin__btn"
              style={{ padding: "0.1rem 0.5rem" }}
              onClick={() => setView({ name: "records", nsid: view.nsid })}
            >
              {view.nsid}
            </button>
          </>
        ) : null}
        {view.name === "editor" ? (
          <>
            <span className="admin__muted">/</span>
            <span className="admin__muted">{view.rkey ?? "new"}</span>
          </>
        ) : null}
      </nav>

      {view.name === "collections" ? (
        <CollectionList
          agent={repoAgent}
          repo={did}
          lex={lex}
          onOpen={(nsid) => setView({ name: "records", nsid })}
          onNewIn={(nsid) => setView({ name: "editor", nsid })}
          onRegisterLexicon={onRegisterLexicon}
        />
      ) : null}

      {view.name === "records" ? (
        <RecordList
          agent={repoAgent}
          repo={did}
          nsid={view.nsid}
          onEdit={(rkey) => setView({ name: "editor", nsid: view.nsid, rkey })}
          onNew={() => setView({ name: "editor", nsid: view.nsid })}
        />
      ) : null}

      {view.name === "editor" ? (
        <RecordEditor
          agent={repoAgent}
          repo={did}
          nsid={view.nsid}
          rkey={view.rkey}
          lex={lex}
          onSaved={() => setView({ name: "records", nsid: view.nsid })}
          onCancel={() => setView({ name: "records", nsid: view.nsid })}
        />
      ) : null}
    </div>
  );
}

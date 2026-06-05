import { useState } from "react";

interface SignInProps {
  defaultHandle?: string;
  onSignIn: (handle: string) => Promise<void>;
  error?: string | null;
}

export function SignIn({ defaultHandle = "", onSignIn, error }: SignInProps) {
  const [handle, setHandle] = useState(defaultHandle);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!handle.trim()) return;
    setSubmitting(true);
    try {
      // signIn redirects away; the promise resolving here is the unusual path.
      await onSignIn(handle.trim());
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <p className="admin__muted">Sign in with your AT Protocol account to manage content.</p>
      <div className="admin__field">
        <label htmlFor="admin-handle">Handle or DID</label>
        <input
          id="admin-handle"
          type="text"
          autoComplete="username"
          placeholder="you.example.com"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
        />
      </div>
      {error ? <div className="admin__error">{error}</div> : null}
      <div className="admin__actions">
        <button type="submit" className="admin__btn admin__btn--primary" disabled={submitting}>
          {submitting ? "Redirecting…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}

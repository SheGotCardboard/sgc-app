"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMagicSent(true);
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Caveat:wght@700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --terracotta: #d97757;
          --terracotta-deep: #c4653f;
          --slate: #3d3935;
          --slate-soft: #5a5550;
          --slate-ghost: #9a948e;
          --cream: #faf6f1;
          --forest: #3d6b4a;
          --forest-light: #6b9d7a;
        }
        .auth-page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .auth-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 24px rgba(61,57,53,0.08);
        }
        .auth-logo {
          font-family: 'Caveat', cursive;
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--slate);
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .auth-logo span { color: var(--terracotta); }
        .auth-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.8rem;
          color: var(--slate);
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .auth-subtitle {
          font-size: 0.875rem;
          color: var(--slate-ghost);
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-field { margin-bottom: 1rem; }
        .auth-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--slate-soft);
          margin-bottom: 0.375rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .auth-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid rgba(61,57,53,0.15);
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          color: var(--slate);
          background: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .auth-input:focus { border-color: var(--terracotta); }
        .auth-btn {
          width: 100%;
          padding: 0.8rem;
          background: var(--terracotta);
          color: white;
          border: none;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 0.5rem;
        }
        .auth-btn:hover { background: var(--terracotta-deep); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-btn-ghost {
          width: 100%;
          padding: 0.8rem;
          background: transparent;
          color: var(--slate-soft);
          border: 1.5px solid rgba(61,57,53,0.15);
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.75rem;
        }
        .auth-btn-ghost:hover { border-color: var(--terracotta); color: var(--terracotta); }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.25rem 0;
        }
        .auth-divider-line { flex: 1; height: 1px; background: rgba(61,57,53,0.1); }
        .auth-divider-text { font-size: 0.75rem; color: var(--slate-ghost); }
        .auth-error {
          background: rgba(196,101,63,0.08);
          border: 1px solid rgba(196,101,63,0.2);
          color: var(--terracotta-deep);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .auth-success {
          background: rgba(61,107,74,0.08);
          border: 1px solid rgba(61,107,74,0.2);
          color: var(--forest);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          text-align: center;
          line-height: 1.5;
        }
        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: var(--slate-ghost);
        }
        .auth-footer a {
          color: var(--terracotta);
          text-decoration: none;
          font-weight: 600;
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">She Got <span>Cardboard</span></div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your SGC account</p>

          {magicSent ? (
            <div className="auth-success">
              ✉️ Check your email — we sent a magic link to <strong>{email}</strong>
            </div>
          ) : (
            <>
              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input
                    className="auth-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <input
                    className="auth-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">or</span>
                <div className="auth-divider-line" />
              </div>

              <button className="auth-btn-ghost" onClick={handleMagicLink} disabled={loading}>
                ✉️ Send magic link
              </button>
            </>
          )}

          <div className="auth-footer">
            No account? <a href="/signup">Join SGC</a>
          </div>
        </div>
      </div>
    </>
  );
}
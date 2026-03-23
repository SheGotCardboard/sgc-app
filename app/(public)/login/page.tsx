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
      router.push("/dashboard");
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
       `}</style>

      <div className="sgc-auth-page">
        <div className="sgc-auth-card">
          <div className="sgc-auth-logo">She Got <span>Cardboard</span></div>
          <h1 className="sgc-auth-title">Welcome back</h1>
          <p className="sgc-auth-subtitle">Sign in to your SGC account</p>

          {magicSent ? (
            <div className="sgc-auth-success">
              ✉️ Check your email — we sent a magic link to <strong>{email}</strong>
            </div>
          ) : (
            <>
              {error && <div className="sgc-auth-error">{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="sgc-auth-field">
                  <label className="sgc-auth-label">Email</label>
                  <input
                    className="sgc-auth-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="sgc-auth-field">
                  <label className="sgc-auth-label">Password</label>
                  <input
                    className="sgc-auth-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div style={{textAlign: 'right', marginTop: '4px'}}>
                  <a href="/forgot-password" style={{fontSize: '0.8rem', color: 'var(--terracotta)', textDecoration: 'none'}}>Forgot password?</a>
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="sgc-auth-divider">
                <div className="sgc-auth-divider-line" />
                <span className="sgc-auth-divider-text">or</span>
                <div className="sgc-auth-divider-line" />
              </div>

              <button className="sgc-auth-btn-ghost" onClick={handleMagicLink} disabled={loading}>
                ✉️ Send magic link
              </button>
            </>
          )}

          <div className="sgc-auth-footer">
            No account? <a href="/membership">Join SGC</a>
          </div>
        </div>
      </div>
    </>
  );
}
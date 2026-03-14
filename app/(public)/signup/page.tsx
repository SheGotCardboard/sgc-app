"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback` ,
        data: {
          first_name: firstName, 
        }
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Caveat:wght@700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --terracotta: #d97757; --terracotta-deep: #c4653f;
          --slate: #3d3935; --slate-soft: #5a5550; --slate-ghost: #9a948e;
          --cream: #faf6f1; --forest: #3d6b4a;
        }
        .auth-page { min-height: 100vh; background: var(--cream); font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .auth-card { background: white; border-radius: 16px; padding: 2.5rem; width: 100%; max-width: 420px; box-shadow: 0 4px 24px rgba(61,57,53,0.08); }
        .auth-logo { font-family: 'Caveat', cursive; font-size: 1.6rem; font-weight: 700; color: var(--slate); margin-bottom: 1.5rem; text-align: center; }
        .auth-logo span { color: var(--terracotta); }
        .auth-title { font-family: 'DM Serif Display', serif; font-size: 1.8rem; color: var(--slate); margin-bottom: 0.5rem; text-align: center; }
        .auth-subtitle { font-size: 0.875rem; color: var(--slate-ghost); text-align: center; margin-bottom: 2rem; }
        .auth-field { margin-bottom: 1rem; }
        .auth-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--slate-soft); margin-bottom: 0.375rem; letter-spacing: 0.04em; text-transform: uppercase; }
        .auth-input { width: 100%; padding: 0.75rem 1rem; border: 1.5px solid rgba(61,57,53,0.15); border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; color: var(--slate); background: white; outline: none; transition: border-color 0.2s; }
        .auth-input:focus { border-color: var(--terracotta); }
        .auth-btn { width: 100%; padding: 0.8rem; background: var(--terracotta); color: white; border: none; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; }
        .auth-btn:hover { background: var(--terracotta-deep); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-error { background: rgba(196,101,63,0.08); border: 1px solid rgba(196,101,63,0.2); color: var(--terracotta-deep); padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }
        .auth-success { background: rgba(61,107,74,0.08); border: 1px solid rgba(61,107,74,0.2); color: var(--forest); padding: 1rem; border-radius: 8px; font-size: 0.9rem; text-align: center; line-height: 1.5; }
        .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: var(--slate-ghost); }
        .auth-footer a { color: var(--terracotta); text-decoration: none; font-weight: 600; }
        .auth-fine { font-size: 0.75rem; color: var(--slate-ghost); text-align: center; margin-top: 1rem; line-height: 1.5; }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">She Got <span>Cardboard</span></div>
          <h1 className="auth-title">Join SGC</h1>
          <p className="auth-subtitle">Create your free account to get started</p>

          {done ? (
            <div className="auth-success">
              ✉️ Check your email to confirm your account — then you're in.
            </div>
          ) : (
            <>
              {error && <div className="auth-error">{error}</div>}
              <form onSubmit={handleSignup}>
                <div className="auth-field">
                  <label className="auth-label">First Name</label>
                  <input
                    className="auth-input"
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
                </div>
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <input className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} />
                </div>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
              <p className="auth-fine">By joining you agree to our terms. No spam, ever.</p>
            </>
          )}

          <div className="auth-footer">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </div>
      </div>
    </>
  );
}
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
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
       `}</style>

      <div className="sgc-auth-page">
        <div className="sgc-auth-card">
          <div className="sgc-auth-logo">She Got <span>Cardboard</span></div>
          <h1 className="sgc-auth-title">Reset password</h1>
          <p className="sgc-auth-subtitle">Enter your email and we'll send you a link to reset your password.</p>

          {done ? (
            <div className="sgc-auth-success">
              ✉️ Check your email — we sent a reset link to <strong>{email}</strong>
            </div>
          ) : (
            <>
              {error && <div className="sgc-auth-error">{error}</div>}
              <form onSubmit={handleReset}>
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
                <button className="sgc-btn" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}

          <div className="sgc-auth-footer">
            <a href="/login">← Back to sign in</a>
          </div>
        </div>
      </div>
    </>
  );
}
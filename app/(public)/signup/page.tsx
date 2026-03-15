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
      `}</style>

      <div className="sgc-auth-page">
        <div className="sgc-auth-card">
          <div className="sgc-auth-logo">She Got <span>Cardboard</span></div>
          <h1 className="sgc-auth-title">Join SGC</h1>
          <p className="sgc-auth-subtitle">Create your free account to get started</p>

          {done ? (
            <div className="sgc-auth-success">
              ✉️ Check your email to confirm your account — then you're in.
            </div>
          ) : (
            <>
              {error && <div className="sgc-auth-error">{error}</div>}
              <form onSubmit={handleSignup}>
                <div className="sgc-auth-field">
                  <label className="sgc-auth-label">First Name</label>
                  <input
                    className="sgc-auth-input"
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div className="sgc-auth-field">
                  <label className="sgc-auth-label">Email</label>
                  <input className="sgc-auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
                </div>
                <div className="sgc-auth-field">
                  <label className="sgc-auth-label">Password</label>
                  <input className="sgc-auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} />
                </div>
                <button className="sgc-auth-btn" type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
              <p className="sgc-auth-fine">By joining you agree to our terms. No spam, ever.</p>
            </>
          )}

          <div className="sgc-auth-footer">
            Already have an account? <a href="/login">Sign in</a>
          </div>
        </div>
      </div>
    </>
  );
}
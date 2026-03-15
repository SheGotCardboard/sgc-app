"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/"), 2000);
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
          <h1 className="sgc-auth-title">New password</h1>
          <p className="sgc-auth-subtitle">Choose a strong password for your account.</p>

          {done ? (
            <div className="sgc-auth-success">
              ✅ Password updated — redirecting you now...
            </div>
          ) : (
            <>
              {error && <div className="sgc-auth-error">{error}</div>}
              <form onSubmit={handleReset}>
                <div className="sgc-auth-field">
                  <label className="sgc-auth-label">New Password</label>
                  <input
                    className="sgc-auth-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                  />
                </div>
                <div className="sgc-auth-field">
                  <label className="sgc-auth-label">Confirm Password</label>
                  <input
                    className="sgc-auth-input"
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    minLength={8}
                  />
                </div>
                <button className="sgc-btn" type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
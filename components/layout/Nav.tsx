import { createClient } from "@/lib/supabase/server";

interface NavProps {
  activePage?: string;
  variant?: "public" | "member";
}

export default async function Nav({ activePage, variant = "public" }: NavProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (variant === "member") {
    return (
      <nav className="sgc-nav">
        <a href="/" className="sgc-nav-logo">She Got <span>Cardboard</span></a>
        <div className="sgc-nav-links">
          <a href="/dashboard" className={`sgc-nav-link${activePage === "dashboard" ? " active" : ""}`}>Dashboard</a>
          <a href="/" className={`sgc-nav-link${activePage === "editorial" ? " active" : ""}`}>Editorial</a>
          <a href="/membership" className={`sgc-nav-link${activePage === "membership" ? " active" : ""}`}>Membership</a>
          {activePage === "account" && (
            <a href="/dashboard/account" className="sgc-nav-link active">Account</a>
          )}
        </div>
        <div className="sgc-nav-right">
          <span style={{fontSize: '0.8rem', color: 'var(--slate-ghost)'}}>{user?.email}</span>
          <form action="/api/auth/signout" method="post">
            <button type="submit" style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--slate-ghost)',
              padding: '6px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--white)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
            }}>Sign out</button>
          </form>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sgc-nav">
      <a href="/" className="sgc-nav-logo">She Got <span>Cardboard</span></a>
      <div className="sgc-nav-right">
        {user ? (
          <a href="/dashboard" className="sgc-nav-link">Dashboard →</a>
        ) : (
          <>
            <a href="/login" className="sgc-nav-link">Sign in</a>
            <a href="/signup" className="sgc-nav-link sgc-btn-outline-terracotta" style={{
              border: '1.5px solid rgba(217,119,87,0.4)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--terracotta)',
              padding: '6px 14px',
            }}>Join free</a>
          </>
        )}
      </div>
    </nav>
  );
}
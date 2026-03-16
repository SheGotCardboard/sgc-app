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
       <a href="/" className="sgc-nav-logo">
          <svg width="18" height="25" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
            <rect x="1.5" y="1.5" width="27" height="39" rx="3.5" fill="white" stroke="#d97757" strokeWidth="2.25"/>
            <rect x="4.5" y="4.5" width="21" height="24" rx="1.5" fill="#f5ede4"/>
            <path d="M15 8 L15.8 15.2 L22.5 16.5 L15.8 17.8 L15 25 L14.2 17.8 L7.5 16.5 L14.2 15.2 Z" fill="#c9921a" opacity="0.75"/>
            <rect x="7" y="32" width="16" height="1.5" rx="0.75" fill="#3d3935" opacity="0.15"/>
            <rect x="9" y="35.5" width="12" height="1.5" rx="0.75" fill="#3d3935" opacity="0.1"/>
          </svg>
          <span className="sgc-nav-logo-she">She</span>
          <span className="sgc-nav-logo-sub">got cardboard</span>
        </a>
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
     <a href="/" className="sgc-nav-logo">
  <svg width="18" height="25" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
    <rect x="1.5" y="1.5" width="27" height="39" rx="3.5" fill="white" stroke="#d97757" strokeWidth="2.25"/>
    <rect x="4.5" y="4.5" width="21" height="24" rx="1.5" fill="#f5ede4"/>
    <path d="M15 8 L15.8 15.2 L22.5 16.5 L15.8 17.8 L15 25 L14.2 17.8 L7.5 16.5 L14.2 15.2 Z" fill="#c9921a" opacity="0.75"/>
    <rect x="7" y="32" width="16" height="1.5" rx="0.75" fill="#3d3935" opacity="0.15"/>
    <rect x="9" y="35.5" width="12" height="1.5" rx="0.75" fill="#3d3935" opacity="0.1"/>
  </svg>
  <span className="sgc-nav-logo-she">She</span>
  <span className="sgc-nav-logo-sub">got cardboard</span>
</a>
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
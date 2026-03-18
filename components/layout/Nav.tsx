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
          <form action="/auth/signout" method="post">
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
    <>
      <style>{`
        .sgc-nav-public { background: rgba(250,246,241,0.96); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 200; }
        .sgc-nav-public-inner { max-width: 1100px; margin: 0 auto; padding: 0 48px; height: 64px; display: flex; align-items: center; gap: 8px; }
        .sgc-nav-pub-logo { display: flex; align-items: center; gap: 7px; text-decoration: none; flex-shrink: 0; margin-right: 8px; }
        .sgc-nav-pub-logo-she { font-family: var(--font-logo); font-size: 1.6rem; font-weight: 700; color: var(--terracotta); line-height: 1; }
        .sgc-nav-pub-logo-sub { font-size: 0.82rem; font-weight: 500; color: var(--slate-soft); }
        .sgc-nav-pub-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .sgc-nav-pub-link { font-size: 0.85rem; font-weight: 600; color: var(--slate-soft); text-decoration: none; padding: 6px 12px; border-radius: var(--radius-sm); transition: all 0.15s; white-space: nowrap; position: relative; }
        .sgc-nav-pub-link:hover { color: var(--terracotta); background: rgba(217,119,87,0.07); }
        .sgc-nav-pub-link.active { color: var(--terracotta); background: rgba(217,119,87,0.08); }
        .sgc-nav-pub-link.soon { opacity: 0.4; pointer-events: none; }
        .sgc-nav-pub-link.soon::after { content: 'Soon'; font-size: 7px; font-weight: 800; background: var(--gold); color: var(--slate); padding: 1px 4px; border-radius: 3px; position: absolute; top: 2px; right: 1px; }
        .sgc-nav-pub-right { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }
        .sgc-nav-pub-signin { font-size: 0.85rem; font-weight: 600; color: var(--slate-soft); text-decoration: none; padding: 6px 14px; border-radius: var(--radius-sm); transition: color 0.15s; }
        .sgc-nav-pub-signin:hover { color: var(--slate); }
        .sgc-nav-pub-join { font-size: 0.85rem; font-weight: 700; color: white; background: var(--terracotta); text-decoration: none; padding: 7px 16px; border-radius: var(--radius-pill); transition: background 0.15s; }
        .sgc-nav-pub-join:hover { background: var(--terracotta-deep); }
        .sgc-nav-pub-dashboard { font-size: 0.85rem; font-weight: 600; color: var(--slate-soft); text-decoration: none; padding: 6px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); transition: all 0.15s; }
        .sgc-nav-pub-dashboard:hover { border-color: var(--terracotta); color: var(--terracotta); }
        @media (max-width: 768px) { .sgc-nav-pub-links { display: none; } .sgc-nav-public-inner { padding: 0 24px; } }
      `}</style>
      <nav className="sgc-nav-public">
        <div className="sgc-nav-public-inner">
          <a href="/" className="sgc-nav-pub-logo">
            <svg width="18" height="25" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
              <rect x="1.5" y="1.5" width="27" height="39" rx="3.5" fill="white" stroke="#d97757" strokeWidth="2.25"/>
              <rect x="4.5" y="4.5" width="21" height="24" rx="1.5" fill="#f5ede4"/>
              <path d="M15 8 L15.8 15.2 L22.5 16.5 L15.8 17.8 L15 25 L14.2 17.8 L7.5 16.5 L14.2 15.2 Z" fill="#c9921a" opacity="0.75"/>
              <rect x="7" y="32" width="16" height="1.5" rx="0.75" fill="#3d3935" opacity="0.15"/>
              <rect x="9" y="35.5" width="12" height="1.5" rx="0.75" fill="#3d3935" opacity="0.1"/>
            </svg>
            <span className="sgc-nav-pub-logo-she">She</span>
            <span className="sgc-nav-pub-logo-sub">got cardboard</span>
          </a>
          <div className="sgc-nav-pub-links">
            <a href="/" className={`sgc-nav-pub-link${activePage === "home" ? " active" : ""}`}>Home</a>
            <a href="/player" className={`sgc-nav-pub-link${activePage === "players" ? " active" : ""}`}>Players</a>
            <a href="/spotlight" className={`sgc-nav-pub-link${activePage === "spotlights" ? " active" : ""}`}>Spotlight</a>
            <a href="/celebrate" className={`sgc-nav-pub-link${activePage === "celebrates" ? " active" : ""}`}>Celebrate</a>
            <a href="/collect" className={`sgc-nav-pub-link${activePage === "collecting" ? " active" : ""}`}>Collect</a>
            <a href="#" className="sgc-nav-pub-link soon">SGC Wire</a>
          </div>
          <div className="sgc-nav-pub-right">
            {user ? (
              <a href="/dashboard" className="sgc-nav-pub-dashboard">Dashboard →</a>
            ) : (
              <>
                <a href="/login" className="sgc-nav-pub-signin">Sign in</a>
                <a href="/signup" className="sgc-nav-pub-join">Join free</a>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
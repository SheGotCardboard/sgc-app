export default function Footer() {
  return (
    <footer className="sgc-footer">
      <style>{`
        .sgc-footer { background: var(--slate); border-top: 1px solid rgba(255,255,255,0.06); padding: 52px 0 36px; }
        .sgc-footer-inner {
          max-width: 1100px; margin: 0 auto; padding: 0 48px;
          display: grid; grid-template-columns: 2fr 1fr 1fr;
          gap: 48px; margin-bottom: 40px;
        }
        .sgc-footer-logo-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .sgc-footer-logo-she { font-family: var(--font-logo); font-size: 2rem; font-weight: 700; color: var(--terracotta); line-height: 1; }
        .sgc-footer-logo-rest { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.5); }
        .sgc-footer-tagline { font-size: 0.8rem; color: rgba(255,255,255,0.35); font-style: italic; line-height: 1.6; max-width: 240px; }
        .sgc-footer-col-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: rgba(255,255,255,0.3); margin-bottom: 14px; }
        .sgc-footer-links { display: flex; flex-direction: column; gap: 10px; }
        .sgc-footer-link { font-size: 0.85rem; color: rgba(255,255,255,0.45); text-decoration: none; transition: color 0.15s; }
        .sgc-footer-link:hover { color: var(--terracotta); }
        .sgc-footer-bottom {
          max-width: 1100px; margin: 0 auto; padding: 24px 48px 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px;
        }
        .sgc-footer-copy { font-size: 11px; color: rgba(255,255,255,0.2); }
        .sgc-footer-home { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); text-decoration: none; transition: color 0.15s; }
        .sgc-footer-home:hover { color: var(--terracotta); }
        @media (max-width: 768px) { .sgc-footer-inner { grid-template-columns: 1fr; } .sgc-footer-inner { padding: 0 24px; } .sgc-footer-bottom { padding: 24px 24px 0; } }
      `}</style>

      <div className="sgc-footer-inner">
        <div>
          <div className="sgc-footer-logo-row">
            <svg width="18" height="25" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.5" y="1.5" width="27" height="39" rx="3.5" fill="white" stroke="#d97757" strokeWidth="2.25"/>
              <rect x="4.5" y="4.5" width="21" height="24" rx="1.5" fill="#f5ede4"/>
              <path d="M15 8 L15.8 15.2 L22.5 16.5 L15.8 17.8 L15 25 L14.2 17.8 L7.5 16.5 L14.2 15.2 Z" fill="#c9921a" opacity="0.75"/>
              <rect x="7" y="32" width="16" height="1.5" rx="0.75" fill="white" opacity="0.15"/>
              <rect x="9" y="35.5" width="12" height="1.5" rx="0.75" fill="white" opacity="0.1"/>
            </svg>
            <span className="sgc-footer-logo-she">She</span>
            <span className="sgc-footer-logo-rest">got Cardboard</span>
          </div>
          <p className="sgc-footer-tagline">The editorial home for celebrating women athletes through collecting. Built with heart.</p>
        </div>

        <div>
          <div className="sgc-footer-col-title">Explore</div>
          <div className="sgc-footer-links">
            <a href="/player" className="sgc-footer-link">Players</a>
            <a href="/spotlight" className="sgc-footer-link">Spotlight</a>
            <a href="/celebrate" className="sgc-footer-link">Celebrate</a>
            <a href="/collect" className="sgc-footer-link">Collecting 101</a>
          </div>
        </div>

        <div>
          <div className="sgc-footer-col-title">Account</div>
          <div className="sgc-footer-links">
            <a href="/membership" className="sgc-footer-link">Membership</a>
            <a href="/login" className="sgc-footer-link">Sign in</a>
            <a href="/signup" className="sgc-footer-link">Join free</a>
            <a href="/about/contact" className="sgc-footer-link">Contact</a>
          </div>
        </div>
      </div>

      <div className="sgc-footer-bottom">
        <div className="sgc-footer-copy">© 2026 She Got Cardboard</div>
        <a href="/" className="sgc-footer-home">← Home</a>
        <div className="sgc-footer-copy">Collect Her Story · Celebrate Her Wins · Honor Her Legacy</div>
      </div>
    </footer>
  );
}
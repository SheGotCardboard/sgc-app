import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/layout/Nav";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch latest published content for each section
  const now = new Date().toISOString();

  const [spotlights, celebrates, collecting] = await Promise.all([
    supabase
      .from("ed_calendar")
      .select("ed_cal_id, title, teaser, slug, publish_date, free_publish_date, ed_type_id")
      .lte("free_publish_date", now)
      .eq("ed_type_id", 1) // spotlight
      .order("publish_date", { ascending: false })
      .limit(3),
    supabase
      .from("ed_calendar")
      .select("ed_cal_id, title, teaser, slug, publish_date, free_publish_date, ed_type_id")
      .lte("free_publish_date", now)
      .eq("ed_type_id", 2) // celebrates
      .order("publish_date", { ascending: false })
      .limit(3),
    supabase
      .from("ed_calendar")
      .select("ed_cal_id, title, teaser, slug, publish_date, free_publish_date, ed_type_id")
      .lte("publish_date", now)
      .eq("ed_type_id", 3) // collecting 101
      .order("publish_date", { ascending: false })
      .limit(3),
  ]);

  const spotlightItems = spotlights.data ?? [];
  const celebratesItems = celebrates.data ?? [];
  const collectingItems = collecting.data ?? [];

  return (
    <>
      <style>{`
        /* ── HERO ── */
        .hero {
          background: linear-gradient(160deg, var(--cream) 0%, var(--warm-white) 100%);
          padding: 80px 48px 72px;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 10% 50%, rgba(217,119,87,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 70% at 90% 30%, rgba(61,107,74,0.05) 0%, transparent 60%);
          pointer-events: none;
        }
        .hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 64px;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .hero-kicker {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--terracotta);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hero-kicker::before {
          content: '';
          width: 24px;
          height: 2px;
          background: var(--terracotta);
          display: block;
        }
        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 5vw, 4rem);
          line-height: 1.08;
          color: var(--slate);
          margin-bottom: 20px;
        }
        .hero-title em { font-style: italic; color: var(--terracotta); }
        .hero-sub {
          font-size: 1.05rem;
          color: var(--slate-soft);
          line-height: 1.7;
          margin-bottom: 36px;
          max-width: 480px;
        }
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        /* Hero card illustration */
        .hero-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          height: 360px;
        }
        .hero-card-stack {
          position: relative;
          width: 200px;
          height: 280px;
        }
        .hero-card {
          position: absolute;
          width: 160px;
          height: 224px;
          border-radius: 10px;
          background: white;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        .hero-card-1 {
          transform: rotate(-8deg) translate(-40px, 10px);
          background: linear-gradient(135deg, #f5ede4, #faf6f1);
          z-index: 1;
        }
        .hero-card-2 {
          transform: rotate(5deg) translate(30px, -10px);
          background: linear-gradient(135deg, var(--lavender-mist), white);
          z-index: 2;
        }
        .hero-card-3 {
          transform: rotate(-1deg);
          background: white;
          z-index: 3;
        }
        .hero-card-inner {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
        }
        .hero-card-star {
          font-size: 2rem;
          opacity: 0.4;
        }
        .hero-card-line {
          width: 60%;
          height: 6px;
          border-radius: 3px;
          background: var(--border);
        }
        .hero-card-line-sm {
          width: 40%;
          height: 4px;
          border-radius: 2px;
          background: var(--border);
          opacity: 0.6;
        }

        /* ── SECTIONS ── */
        .home-section {
          padding: 72px 48px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-divider {
          height: 1px;
          background: var(--border);
          max-width: 1100px;
          margin: 0 auto;
        }
        .section-kicker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--terracotta);
          margin-bottom: 12px;
        }
        .section-kicker.lavender { color: var(--lavender); }
        .section-kicker.forest { color: var(--forest); }
        .section-title {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          color: var(--slate);
          margin-bottom: 8px;
        }
        .section-desc {
          font-size: 0.95rem;
          color: var(--slate-soft);
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 560px;
        }

        /* ── CONTENT GRID ── */
        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }
        .content-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .content-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .content-card-thumb {
          height: 160px;
          background: linear-gradient(135deg, var(--cream), var(--terracotta-blush));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        }
        .content-card-thumb.lavender-bg {
          background: linear-gradient(135deg, var(--lavender-mist), rgba(155,136,196,0.2));
        }
        .content-card-thumb.forest-bg {
          background: linear-gradient(135deg, var(--forest-mist), rgba(61,107,74,0.1));
        }
        .content-card-body { padding: 20px; }
        .content-card-type {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--terracotta);
          margin-bottom: 6px;
        }
        .content-card-type.lavender { color: var(--lavender); }
        .content-card-type.forest { color: var(--forest); }
        .content-card-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          color: var(--slate);
          margin-bottom: 8px;
          line-height: 1.25;
        }
        .content-card-teaser {
          font-size: 0.85rem;
          color: var(--slate-soft);
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .content-card.featured .content-card-thumb { height: 220px; }
        .content-card.featured .content-card-title { font-size: 1.4rem; }

        /* Empty state */
        .empty-state {
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          padding: 48px;
          text-align: center;
          color: var(--slate-ghost);
        }
        .empty-state-icon { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4; }
        .empty-state-text { font-family: var(--font-display); font-size: 1.2rem; color: var(--slate-soft); margin-bottom: 6px; }
        .empty-state-desc { font-size: 0.875rem; }

        /* ── MEMBERSHIP STRIP ── */
        .membership-strip {
          background: var(--slate);
          padding: 64px 48px;
          text-align: center;
        }
        .membership-strip-inner { max-width: 640px; margin: 0 auto; }
        .membership-strip-eyebrow {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--terracotta);
          margin-bottom: 16px;
        }
        .membership-strip-title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          color: white;
          margin-bottom: 16px;
          line-height: 1.15;
        }
        .membership-strip-title em { font-style: italic; color: var(--terracotta-blush); }
        .membership-strip-sub {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.55);
          line-height: 1.65;
          margin-bottom: 32px;
        }
        .membership-strip-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* ── FOOTER ── */
        .home-footer {
          background: var(--slate);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 40px 48px;
        }
        .home-footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .home-footer-logo {
          font-family: var(--font-logo);
          font-size: 1.3rem;
          font-weight: 700;
          color: white;
        }
        .home-footer-logo span { color: var(--terracotta); }
        .home-footer-tagline {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.35);
          font-style: italic;
        }
        .home-footer-links {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .home-footer-link {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.15s;
        }
        .home-footer-link:hover { color: rgba(255,255,255,0.8); }
        .home-footer-copy {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
          width: 100%;
          text-align: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>

      <div className="sgc-page">
        <Nav />

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-left">
              <p className="hero-kicker">Collect Her Story</p>
              <h1 className="hero-title">
                The editorial home<br />
                for <em>women's</em><br />
                sports cards.
              </h1>
              <p className="hero-sub">
                Player spotlights, card deep dives, and the stories behind the women whose names belong on cardboard. Every week, one athlete. Always her story first.
              </p>
              <div className="hero-actions">
                <a href="/membership" className="sgc-btn sgc-btn-primary">Join SGC →</a>
                <a href="#spotlights" className="sgc-btn sgc-btn-ghost">Read the latest</a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card-stack">
                <div className="hero-card hero-card-1">
                  <div className="hero-card-inner">
                    <div className="hero-card-star">⭐</div>
                    <div className="hero-card-line" />
                    <div className="hero-card-line-sm" />
                  </div>
                </div>
                <div className="hero-card hero-card-2">
                  <div className="hero-card-inner">
                    <div className="hero-card-star">🏆</div>
                    <div className="hero-card-line" />
                    <div className="hero-card-line-sm" />
                  </div>
                </div>
                <div className="hero-card hero-card-3">
                  <div className="hero-card-inner">
                    <div className="hero-card-star">✨</div>
                    <div className="hero-card-line" />
                    <div className="hero-card-line-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PLAYER SPOTLIGHT ── */}
        <div id="spotlights">
          <div className="section-divider" />
          <div className="home-section">
            <div className="section-kicker">⭐ Player Spotlight</div>
            <h2 className="section-title">Celebrating This Week</h2>
            <p className="section-desc">Every week, one athlete. Her story, her significance, the card that connects you to her legacy.</p>

            {spotlightItems.length > 0 ? (
              <div className="content-grid">
                {spotlightItems.map((item, i) => (
                  <a key={item.ed_cal_id} href={`/spotlights/${item.slug}`} className={`content-card${i === 0 ? " featured" : ""}`}>
                    <div className="content-card-thumb">🏀</div>
                    <div className="content-card-body">
                      <div className="content-card-type">Player Spotlight</div>
                      <div className="content-card-title">{item.title}</div>
                      {item.teaser && <p className="content-card-teaser">{item.teaser}</p>}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">⭐</div>
                <div className="empty-state-text">First spotlight coming soon</div>
                <div className="empty-state-desc">Our first player spotlight drops with launch week.</div>
              </div>
            )}
          </div>
        </div>

        {/* ── SGC CELEBRATES ── */}
        <div style={{background: 'rgba(155,136,196,0.04)'}}>
          <div className="section-divider" />
          <div className="home-section">
            <div className="section-kicker lavender">🏆 SGC Celebrates</div>
            <h2 className="section-title">Stories Worth Celebrating</h2>
            <p className="section-desc">Dynasties, duos, milestones, and moments. The stories that shaped women's sports — told through the cards that capture them.</p>

            {celebratesItems.length > 0 ? (
              <div className="content-grid">
                {celebratesItems.map((item, i) => (
                  <a key={item.ed_cal_id} href={`/celebrates/${item.slug}`} className={`content-card${i === 0 ? " featured" : ""}`}>
                    <div className="content-card-thumb lavender-bg">🏆</div>
                    <div className="content-card-body">
                      <div className="content-card-type lavender">SGC Celebrates</div>
                      <div className="content-card-title">{item.title}</div>
                      {item.teaser && <p className="content-card-teaser">{item.teaser}</p>}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🏆</div>
                <div className="empty-state-text">First celebration coming soon</div>
                <div className="empty-state-desc">Stories worth celebrating — dropping at launch.</div>
              </div>
            )}
          </div>
        </div>

        {/* ── COLLECTING 101 ── */}
        <div>
          <div className="section-divider" />
          <div className="home-section">
            <div className="section-kicker forest">📚 Collecting 101</div>
            <h2 className="section-title">Her Card, Your Collection</h2>
            <p className="section-desc">The editorial perspective on collecting women's sports cards — about relationship and meaning, not just markets.</p>

            {collectingItems.length > 0 ? (
              <div className="content-grid">
                {collectingItems.map((item, i) => (
                  <a key={item.ed_cal_id} href={`/collecting/${item.slug}`} className={`content-card${i === 0 ? " featured" : ""}`}>
                    <div className="content-card-thumb forest-bg">📚</div>
                    <div className="content-card-body">
                      <div className="content-card-type forest">Collecting 101</div>
                      <div className="content-card-title">{item.title}</div>
                      {item.teaser && <p className="content-card-teaser">{item.teaser}</p>}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <div className="empty-state-text">Guides coming soon</div>
                <div className="empty-state-desc">Start with Her Card, Your Collection — dropping at launch.</div>
              </div>
            )}
          </div>
        </div>

        {/* ── MEMBERSHIP STRIP ── */}
        <div className="membership-strip">
          <div className="membership-strip-inner">
            <p className="membership-strip-eyebrow">Membership</p>
            <h2 className="membership-strip-title">
              Read it first.<br /><em>Go deeper.</em>
            </h2>
            <p className="membership-strip-sub">
              Join The Chronicle or The Legacy for early access, the full archive, and exclusive content that celebrates the women behind the cards.
            </p>
            <div className="membership-strip-actions">
              <a href="/membership" className="sgc-btn sgc-btn-primary">See membership options →</a>
              <a href="/signup" className="sgc-btn" style={{background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)'}}>Join free</a>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="home-footer">
          <div className="home-footer-inner">
            <div>
              <div className="home-footer-logo">She Got <span>Cardboard</span></div>
              <div className="home-footer-tagline">Collect Her Story.</div>
            </div>
            <div className="home-footer-links">
              <a href="/membership" className="home-footer-link">Membership</a>
              <a href="/login" className="home-footer-link">Sign in</a>
              <a href="/signup" className="home-footer-link">Join free</a>
              <a href="mailto:editor@shegotcardboard.com" className="home-footer-link">Contact</a>
            </div>
            <div className="home-footer-copy">© 2026 She Got Cardboard · shegotcardboard.com</div>
          </div>
        </footer>

      </div>
    </>
  );
}
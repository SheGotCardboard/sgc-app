import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/access";
import Nav from "@/components/layout/Nav";
import CardImage from "@/components/card/CardImage";
import Footer from "@/components/layout/Footer";

type EdItem = {
  ed_cal_id: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  slug: string;
  publish_date: string;
  free_publish_date: string | null;
  story_card_id: string | null;
  card_filename: string | null;
};

export default async function HomePage() {
  const supabase = await createClient();
  const access = await getAccess();
  const now = new Date().toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: edTypesRaw } = await supabase
    .from("ed_type_lkp")
    .select("ed_type_id, value");

  const edTypes = (edTypesRaw ?? []) as { ed_type_id: string; value: string }[];
  const spotlightTypeId = edTypes.find(t => t.value === "spotlight")?.ed_type_id;
  const celebratesTypeId = edTypes.find(t => t.value === "celebrates")?.ed_type_id;
  const collectTypeId = edTypes.find(t => t.value === "collect")?.ed_type_id;

  const [spotlights, celebrates, collecting] = await Promise.all([
    spotlightTypeId ? supabase
      .from("ed_calendar")
      .select("ed_cal_id, title, subtitle, excerpt, slug, publish_date, free_publish_date, story_card_id")
      .eq("ed_type_id", spotlightTypeId)
      .eq("is_hidden", false)
      .lte("publish_date", now)
      .gte("publish_date", thirtyDaysAgo)
      .order("publish_date", { ascending: false })
      .limit(4) : { data: [] },

    celebratesTypeId ? supabase
      .from("ed_calendar")
      .select("ed_cal_id, title, subtitle, excerpt, slug, publish_date, free_publish_date, story_card_id")
      .eq("ed_type_id", celebratesTypeId)
      .eq("is_hidden", false)
      .lte("publish_date", now)
      .gte("publish_date", thirtyDaysAgo)
      .order("publish_date", { ascending: false })
      .limit(4) : { data: [] },

    collectTypeId ? supabase
      .from("ed_calendar")
      .select("ed_cal_id, title, subtitle, excerpt, slug, publish_date, free_publish_date, story_card_id")
      .eq("ed_type_id", collectTypeId)
      .eq("is_hidden", false)
      .lte("publish_date", now)
      .order("publish_date", { ascending: true })
      .limit(4) : { data: [] },
  ]);

  const spotlightItems = (spotlights.data ?? []) as EdItem[];
  const celebratesItems = (celebrates.data ?? []) as EdItem[];
  const collectingItems = (collecting.data ?? []) as EdItem[];

  const storyCardIds = [
    ...spotlightItems,
    ...celebratesItems,
    ...collectingItems,
  ].map(i => i.story_card_id).filter(Boolean) as string[];

  const { data: cardFilenames } = await supabase
    .from("card")
    .select("card_id, filename")
    .in("card_id", storyCardIds);

  const filenameMap = Object.fromEntries(
    (cardFilenames ?? []).map(c => [(c as any).card_id, (c as any).filename])
  );

  const STORAGE_URL = "https://smgqjzddhzcpatwwqlci.supabase.co/storage/v1/object/public/cards";

  const collectNewestId = collectingItems.length > 1
    ? collectingItems[collectingItems.length - 1].ed_cal_id
    : null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const cardImgStyle = {
    width: '65%',
    height: '90%',
    objectFit: 'cover' as const,
    objectPosition: 'center top',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(61,57,53,0.2)',
  };

  const placeholderSVG = (
    <div className="tile-ph">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
    </div>
  );

  return (
    <>
      <style>{`
        .hero { background: var(--cream); padding: 80px 0 72px; position: relative; overflow: hidden; }
        .hero-inner { max-width: 1100px; margin: 0 auto; padding: 0 48px; display: grid; grid-template-columns: 1fr 420px; gap: 64px; align-items: center; }
        .hero-kicker { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--slate-soft); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .hero-kicker::before { content: ''; width: 24px; height: 2px; background: var(--terracotta); display: block; }
        .hero-title { font-family: var(--font-display); font-size: clamp(2.8rem, 5vw, 4rem); font-weight: 400; line-height: 1.08; color: var(--slate); margin-bottom: 20px; }
        .hero-title .highlight { color: var(--terracotta); font-style: italic; }
        .hero-sub { font-size: 1.05rem; color: var(--slate-soft); line-height: 1.7; margin-bottom: 36px; max-width: 480px; }
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-visual { display: flex; align-items: center; justify-content: center; height: 360px; }
        .hero-card-stack { position: relative; width: 200px; height: 280px; }
        .hero-card { position: absolute; width: 160px; height: 224px; border-radius: 10px; border: 1px solid var(--border); box-shadow: var(--shadow-lg); }
        .hero-card-1 { transform: rotate(-8deg) translate(-40px, 10px); background: linear-gradient(135deg, #f5ede4, #faf6f1); z-index: 1; }
        .hero-card-2 { transform: rotate(5deg) translate(30px, -10px); background: linear-gradient(135deg, var(--lavender-mist), white); z-index: 2; }
        .hero-card-3 { transform: rotate(-1deg); background: white; z-index: 3; }
        .hero-card-inner { width: 100%; height: 100%; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px; }
        .hero-card-star { font-size: 2rem; opacity: 0.4; }
        .hero-card-line { width: 60%; height: 6px; border-radius: 3px; background: var(--border); }
        .hero-card-line-sm { width: 40%; height: 4px; border-radius: 2px; background: var(--border); opacity: 0.6; }
        .home-section-wrap { width: 100%; }
        .home-section { max-width: 1100px; margin: 0 auto; padding: 56px 48px; }
        .section-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px; gap: 20px; flex-wrap: wrap; }
        .section-head-left { flex: 1; min-width: 0; max-width: 700px; }
        .section-kicker-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 10px; }
        .kicker-s { background: rgba(217,119,87,0.15); color: var(--terracotta); }
        .kicker-c { background: rgba(155,136,196,0.15); color: var(--lavender); }
        .kicker-g { background: rgba(61,107,74,0.12); color: var(--forest); }
        .section-head-title { font-family: var(--font-display); font-size: clamp(1.4rem, 2.5vw, 1.8rem); color: var(--slate); margin-bottom: 5px; line-height: 1.2; }
        .section-head-desc { font-size: 0.85rem; color: var(--slate-soft); line-height: 1.6; }
        .see-all { font-size: 12px; font-weight: 700; color: var(--slate-ghost); text-decoration: none; white-space: nowrap; padding-top: 4px; flex-shrink: 0; transition: color 0.15s; }
        .see-all:hover { color: var(--slate-soft); }
        .see-all::after { content: ' →'; }
        .window-note { display: inline-flex; align-items: center; gap: 7px; font-size: 11px; color: var(--slate-ghost); background: rgba(255,255,255,0.7); border: 1px solid var(--border); border-radius: 20px; padding: 4px 12px; margin-bottom: 18px; }
        .wdot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .tile-grid { display: grid; gap: 16px; grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 1100px) { .tile-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 800px)  { .tile-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px)  { .tile-grid { grid-template-columns: 1fr; } }
        .teaser-tile { background: white; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-sm); text-decoration: none; color: inherit; display: flex; flex-direction: column; transition: box-shadow 0.2s, transform 0.2s; }
        .teaser-tile:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .tile-bar { height: 4px; flex-shrink: 0; }
        .bar-s { background: var(--terracotta); }
        .bar-c { background: var(--lavender); }
        .bar-g { background: var(--forest); }
        .tile-image { flex-shrink: 0; display: flex; align-items: center; justify-content: center; height: 116px; overflow: hidden; position: relative; }
        .img-s { background: rgba(217,119,87,0.07); }
        .img-c { background: rgba(155,136,196,0.08); }
        .img-g { background: rgba(61,107,74,0.07); }
        .tile-ph { display: flex; align-items: center; justify-content: center; opacity: 0.2; color: var(--slate); }
        .guide-num { font-family: var(--font-display); font-size: 52px; line-height: 1; color: rgba(61,107,74,0.10); position: absolute; right: 12px; bottom: 2px; user-select: none; }
        .tile-new-badge { position: absolute; top: 10px; left: 10px; font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; background: var(--forest); color: white; padding: 3px 8px; border-radius: 20px; }
        .tile-body { padding: 14px 16px; flex: 1; display: flex; flex-direction: column; }
        .tile-type { font-size: 10px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 5px; }
        .type-s { color: var(--terracotta); }
        .type-c { color: var(--lavender); }
        .type-g { color: var(--forest); }
        .tile-date { font-size: 11px; color: var(--slate-ghost); margin-bottom: 4px; }
        .tile-title { font-family: var(--font-display); font-size: 16px; line-height: 1.25; color: var(--slate); margin-bottom: 3px; }
        .tile-subtitle { font-size: 11px; font-style: italic; color: var(--slate-ghost); margin-bottom: 8px; line-height: 1.4; }
        .tile-excerpt { font-size: 12px; line-height: 1.6; color: var(--slate-soft); flex: 1; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .tile-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--border); margin-top: auto; }
        .tile-cta { font-size: 11px; font-weight: 700; }
        .tile-cta::after { content: ' →'; }
        .cta-s { color: var(--terracotta); }
        .cta-c { color: var(--lavender); }
        .cta-g { color: var(--forest); }
        .tile-gate { font-size: 10px; color: var(--slate-ghost); font-style: italic; }
        .tile-featured { display: flex; flex-direction: row; grid-column: span 2; }
        @media (max-width: 800px) { .tile-featured { grid-column: span 2; } }
        @media (max-width: 520px) { .tile-featured { flex-direction: column; grid-column: span 1; } .feat-sidebar { width: 100%; min-width: unset; height: 70px; } }
        .feat-sidebar { width: 130px; min-width: 130px; display: flex; flex-direction: column; }
        .feat-sidebar .tile-bar { width: 100%; }
        .feat-img { flex: 1; background: rgba(61,107,74,0.07); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .feat-num { font-family: var(--font-display); font-size: 72px; line-height: 1; color: rgba(61,107,74,0.12); user-select: none; }
        .feat-main { display: flex; flex-direction: column; flex: 1; }
        .feat-main .tile-bar { width: 100%; }
        .feat-main .tile-title { font-size: 19px !important; }
        .feat-main .tile-excerpt { -webkit-line-clamp: 4 !important; }
        .gate-banner { margin-top: 28px; padding: 24px 0 4px; border-top: 1px solid rgba(61,57,53,0.12); display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .gate-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--slate-ghost); margin-bottom: 4px; }
        .gate-msg { font-family: var(--font-display); font-size: 18px; color: var(--slate); margin-bottom: 3px; }
        .gate-sub { font-size: 12px; color: var(--slate-soft); line-height: 1.5; }
        .gate-actions { display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }
        .gate-btn { font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 20px; cursor: pointer; border: none; white-space: nowrap; text-decoration: none; display: inline-block; transition: all 0.15s; }
        .gate-btn-primary { background: var(--terracotta); color: white; }
        .gate-btn-primary:hover { background: var(--terracotta-deep); }
        .gate-btn-ghost { background: transparent; color: var(--slate-soft); border: 1px solid rgba(61,57,53,0.18); }
        .bg-s { background: var(--terracotta-blush); }
        .bg-c { background: var(--lavender-mist); }
        .bg-g { background: var(--forest-mist); }
        .membership-strip { background: var(--slate); padding: 72px 48px; text-align: center; }
        .membership-strip-inner { max-width: 640px; margin: 0 auto; }
        .membership-strip-eyebrow { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 16px; }
        .membership-strip-title { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.6rem); color: white; margin-bottom: 16px; line-height: 1.15; }
        .membership-strip-title em { font-style: italic; color: var(--terracotta-blush); }
        .membership-strip-sub { font-size: 0.95rem; color: rgba(255,255,255,0.55); line-height: 1.65; margin-bottom: 32px; }
        .membership-strip-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .home-footer { background: var(--slate); border-top: 1px solid rgba(255,255,255,0.06); padding: 52px 0 36px; }
        .home-footer-inner { max-width: 1100px; margin: 0 auto; padding: 0 48px; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
        .home-footer-logo-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .home-footer-logo-she { font-family: var(--font-logo); font-size: 2rem; font-weight: 700; color: var(--terracotta); line-height: 1; }
        .home-footer-logo-rest { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.5); }
        .home-footer-tagline { font-size: 0.8rem; color: rgba(255,255,255,0.35); font-style: italic; line-height: 1.6; max-width: 240px; }
        .home-footer-col-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: rgba(255,255,255,0.3); margin-bottom: 14px; }
        .home-footer-links { display: flex; flex-direction: column; gap: 10px; }
        .home-footer-link { font-size: 0.85rem; color: rgba(255,255,255,0.45); text-decoration: none; transition: color 0.15s; }
        .home-footer-link:hover { color: var(--terracotta); }
        .home-footer-bottom { max-width: 1100px; margin: 0 auto; padding: 24px 48px 0; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .home-footer-copy { font-size: 11px; color: rgba(255,255,255,0.2); }
        @media (max-width: 768px) { .hero-inner { grid-template-columns: 1fr; } .hero-visual { display: none; } .home-footer-inner { grid-template-columns: 1fr; } }
      `}</style>

      <div className="sgc-page">
        <Nav />

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-inner">
            <div>
              <p className="hero-kicker">Collect Her Story</p>
              <h1 className="hero-title">Every card tells <span className="highlight">her story</span></h1>
              <p className="hero-sub">The editorial home for celebrating women athletes through collecting. Join a community that collects with heart, celebrates with joy, and honors the women who made history.</p>
              <div className="hero-actions">
                <a href="/membership" className="sgc-btn sgc-btn-primary">Join Our Community</a>
                <a href="/players" className="sgc-btn sgc-btn-ghost">Meet the Players</a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card-stack">
                <div className="hero-card hero-card-1"><div className="hero-card-inner"><div className="hero-card-star">⭐</div><div className="hero-card-line" /><div className="hero-card-line-sm" /></div></div>
                <div className="hero-card hero-card-2"><div className="hero-card-inner"><div className="hero-card-star">🏆</div><div className="hero-card-line" /><div className="hero-card-line-sm" /></div></div>
                <div className="hero-card hero-card-3"><div className="hero-card-inner"><div className="hero-card-star">✨</div><div className="hero-card-line" /><div className="hero-card-line-sm" /></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PLAYER SPOTLIGHT ── */}
        <div className="home-section-wrap bg-s">
          <div className="home-section">
            <div className="section-head">
              <div className="section-head-left">
                <div className="section-kicker-pill kicker-s">⭐ Player Spotlight</div>
                <h2 className="section-head-title">Introducing&hellip;</h2>
                <p className="section-head-desc">One athlete. Her story, her significance, the card that connects you to her legacy.</p>
              </div>
              <a href="/spotlight" className="see-all">All Spotlights</a>
            </div>
            <div className="window-note">
              <span className="wdot" style={{background: 'var(--terracotta)'}} />
              Last 30 days · sign in to read
            </div>
            {spotlightItems.length > 0 ? (
              <div className="tile-grid">
                {spotlightItems.map((item) => {
                  const filename = filenameMap[item.story_card_id ?? ""];
                  return (
                    <a key={item.ed_cal_id} href={`/spotlight/${item.slug}`} className="teaser-tile">
                      <div className="tile-bar bar-s" />
                      <div className="tile-image img-s" data-card-id={item.story_card_id ?? undefined}>
                        {filename
                          ? <CardImage src={`${STORAGE_URL}/${filename}`} alt={item.title} style={cardImgStyle} placeholder={placeholderSVG} />
                          : placeholderSVG}
                      </div>
                      <div className="tile-body">
                        <div className="tile-type type-s">Player Spotlight</div>
                        <div className="tile-date">{formatDate(item.publish_date)}</div>
                        <div className="tile-title">{item.title}</div>
                        {item.subtitle && <div className="tile-subtitle">{item.subtitle}</div>}
                        {item.excerpt && <p className="tile-excerpt">{item.excerpt}</p>}
                        <div className="tile-footer">
                          <span className="tile-cta cta-s">Read her story</span>
                          <span className="tile-gate">{access.isAuthenticated ? "Read now" : "Sign in to read"}</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">⭐</div>
                <div className="empty-state-text">First spotlight coming soon</div>
                <div className="empty-state-desc">Our first player spotlight drops with launch week.</div>
              </div>
            )}
            {!access.isAuthenticated && (
              <div className="gate-banner">
                <div>
                  <div className="gate-eyebrow">Members only</div>
                  <div className="gate-msg">Read every story. Free to start.</div>
                  <p className="gate-sub">Sign up free and read every article — no paywall. Chronicle and Legacy members read 72 hours early.</p>
                </div>
                <div className="gate-actions">
                  <a href="/signup" className="gate-btn gate-btn-primary">Create free account</a>
                  <a href="/login" className="gate-btn gate-btn-ghost">Sign in</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SGC CELEBRATES ── */}
        <div className="home-section-wrap bg-c">
          <div className="home-section">
            <div className="section-head">
              <div className="section-head-left">
                <div className="section-kicker-pill kicker-c">🏆 SGC Celebrates</div>
                <h2 className="section-head-title">Stories Worth Celebrating</h2>
                <p className="section-head-desc">Dynasties, duos, milestones, and moments. The stories that shaped women&apos;s sports — told through the cards that capture them.</p>
              </div>
              <a href="/celebrate" className="see-all">All Celebrations</a>
            </div>
            <div className="window-note">
              <span className="wdot" style={{background: 'var(--lavender)'}} />
              Last 30 days · Chronicle members unlock the full card gallery
            </div>
            {celebratesItems.length > 0 ? (
              <div className="tile-grid">
                {celebratesItems.map((item) => {
                  const filename = filenameMap[item.story_card_id ?? ""];
                  return (
                    <a key={item.ed_cal_id} href={`/celebrate/${item.slug}`} className="teaser-tile">
                      <div className="tile-bar bar-c" />
                      <div className="tile-image img-c" data-card-id={item.story_card_id ?? undefined}>
                        {filename
                          ? <CardImage src={`${STORAGE_URL}/${filename}`} alt={item.title} style={cardImgStyle} placeholder={placeholderSVG} />
                          : placeholderSVG}
                      </div>
                      <div className="tile-body">
                        <div className="tile-type type-c">SGC Celebrates</div>
                        <div className="tile-date">{formatDate(item.publish_date)}</div>
                        <div className="tile-title">{item.title}</div>
                        {item.subtitle && <div className="tile-subtitle">{item.subtitle}</div>}
                        {item.excerpt && <p className="tile-excerpt">{item.excerpt}</p>}
                        <div className="tile-footer">
                          <span className="tile-cta cta-c">Read the story</span>
                          <span className="tile-gate">{access.isAuthenticated ? "Read now" : "Sign in to read"}</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🏆</div>
                <div className="empty-state-text">First celebration coming soon</div>
                <div className="empty-state-desc">Stories worth celebrating — dropping at launch.</div>
              </div>
            )}
            {!access.isAuthenticated && (
              <div className="gate-banner">
                <div>
                  <div className="gate-eyebrow">Chronicle members</div>
                  <div className="gate-msg">The full card gallery unlocks at Chronicle.</div>
                  <p className="gate-sub">3–5 editorially chosen cards tell the narrative. Chronicle members see every card — $7/mo.</p>
                </div>
                <div className="gate-actions">
                  <a href="/membership" className="gate-btn gate-btn-primary" style={{background: 'var(--lavender)'}}>Join Chronicle — $7/mo</a>
                  <a href="/login" className="gate-btn gate-btn-ghost">Sign in</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── COLLECTING 101 ── */}
        <div className="home-section-wrap bg-g">
          <div className="home-section">
            <div className="section-head">
              <div className="section-head-left">
                <div className="section-kicker-pill kicker-g">📚 Collecting 101</div>
                <h2 className="section-head-title">Her Card, Your Collection</h2>
                <p className="section-head-desc">The editorial perspective on collecting women&apos;s sports cards — about relationship and meaning, not markets.</p>
              </div>
              <a href="/collecting" className="see-all">All Guides</a>
            </div>
            <div className="window-note" style={{borderColor: 'rgba(61,107,74,0.2)'}}>
              <span className="wdot" style={{background: 'var(--forest-light)'}} />
              <span style={{color: 'var(--forest)'}}>Full archive · no time restriction · free with sign-in</span>
            </div>
            {collectingItems.length > 0 ? (
              <div className="tile-grid">
                {collectingItems.map((item, i) => {
                  const isFeatured = i === 0;
                  const isNewest = item.ed_cal_id === collectNewestId;
                  const filename = filenameMap[item.story_card_id ?? ""];

                  if (isFeatured) {
                    return (
                      <a key={item.ed_cal_id} href={`/collect/${item.slug}`} className="teaser-tile tile-featured">
                        <div className="feat-sidebar">
                          <div className="tile-bar bar-g" />
                          <div className="feat-img" data-card-id={item.story_card_id ?? undefined}>
                            {filename
                              ? <CardImage src={`${STORAGE_URL}/${filename}`} alt={item.title} style={{width: '80%', height: '90%', objectFit: 'cover', objectPosition: 'center top', borderRadius: '6px', boxShadow: '0 4px 12px rgba(61,57,53,0.2)'}} placeholder={<div className="feat-num">01</div>} />
                              : <div className="feat-num">01</div>}
                          </div>
                        </div>
                        <div className="feat-main">
                          <div className="tile-bar bar-g" />
                          <div className="tile-body">
                            <div className="tile-type type-g">Collecting 101 · Start Here</div>
                            <div className="tile-title" style={{fontSize: '19px'}}>{item.title}</div>
                            {item.subtitle && <div className="tile-subtitle">{item.subtitle}</div>}
                            {item.excerpt && <p className="tile-excerpt" style={{WebkitLineClamp: 4}}>{item.excerpt}</p>}
                            <div className="tile-footer">
                              <span className="tile-cta cta-g">Start reading</span>
                              <span className="tile-gate">Free · sign in</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  }

                  return (
                    <a key={item.ed_cal_id} href={`/collect/${item.slug}`} className="teaser-tile">
                      <div className="tile-bar bar-g" />
                      <div className="tile-image img-g" style={{position: 'relative'}} data-card-id={item.story_card_id ?? undefined}>
                        {filename
                          ? <CardImage src={`${STORAGE_URL}/${filename}`} alt={item.title} style={cardImgStyle} placeholder={<div className="guide-num">0{i + 1}</div>} />
                          : <div className="guide-num">0{i + 1}</div>}
                        {isNewest && <div className="tile-new-badge">New</div>}
                      </div>
                      <div className="tile-body">
                        <div className="tile-type type-g">Collecting 101</div>
                        <div className="tile-title">{item.title}</div>
                        {item.subtitle && <div className="tile-subtitle">{item.subtitle}</div>}
                        {item.excerpt && <p className="tile-excerpt">{item.excerpt}</p>}
                        <div className="tile-footer">
                          <span className="tile-cta cta-g">Read the guide</span>
                          <span className="tile-gate">Free · sign in</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <div className="empty-state-text">Guides coming soon</div>
                <div className="empty-state-desc">Start with Her Card, Your Collection — dropping at launch.</div>
              </div>
            )}
            {!access.isAuthenticated && (
              <div className="gate-banner" style={{background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(61,107,74,0.15)'}}>
                <div>
                  <div className="gate-eyebrow" style={{color: 'var(--forest)'}}>Free archive</div>
                  <div className="gate-msg">Every guide, always available.</div>
                  <p className="gate-sub">Collecting 101 has no time restriction. Create a free account and read every guide we&apos;ve ever published.</p>
                </div>
                <div className="gate-actions">
                  <a href="/signup" className="gate-btn gate-btn-primary" style={{background: 'var(--forest)'}}>Create free account</a>
                  <a href="/login" className="gate-btn gate-btn-ghost">Sign in</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MEMBERSHIP STRIP ── */}
        <div className="membership-strip">
          <div className="membership-strip-inner">
            <p className="membership-strip-eyebrow">Membership</p>
            <h2 className="membership-strip-title">Read it first.<br /><em>Go deeper.</em></h2>
            <p className="membership-strip-sub">Join Chronicle or Legacy for early access, the full archive, and exclusive content that celebrates the women behind the cards.</p>
            <div className="membership-strip-actions">
              <a href="/membership" className="sgc-btn sgc-btn-primary">See membership options →</a>
              <a href="/signup" className="sgc-btn" style={{background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)'}}>Join free</a>
            </div>
          </div>
        </div>
/*
        {/* ── FOOTER ── */}

        <Footer />

      </div>
    </>
  );
}

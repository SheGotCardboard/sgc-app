import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/access";
import Nav from "@/components/layout/Nav";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const access = await getAccess();

  const tierLabels: Record<string, { name: string; tagline: string; color: string }> = {
    story:     { name: "The Story",     tagline: "Every story, always free.",    color: "#6b9d7a" },
    chronicle: { name: "The Chronicle", tagline: "Read it first. Go deeper.",    color: "#b5a3d8" },
    legacy:    { name: "The Legacy",    tagline: "The story in your hands.",     color: "#e8b44c" },
  };

  const tier = tierLabels[access.tier ?? "story"];
  const firstName = user.user_metadata?.first_name ?? "collector";

  return (
    <>
      <style>{`
        .dash-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px;
        }
        .dash-welcome { margin-bottom: 40px; }
        .dash-welcome-eyebrow {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--slate-ghost);
          margin-bottom: 8px;
        }
        .dash-welcome-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 400;
          color: var(--slate);
          margin-bottom: 8px;
        }
        .dash-welcome-title em { font-style: italic; color: var(--terracotta); }
        .dash-welcome-sub { font-size: 0.95rem; color: var(--slate-soft); }
        .tier-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          border: 1px solid var(--border);
          border-left: 4px solid var(--tier-color, var(--terracotta));
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: var(--shadow-sm);
        }
        .tier-card-info { flex: 1; }
        .tier-card-name {
          font-family: var(--font-display);
          font-size: 1.4rem;
          color: var(--slate);
          margin-bottom: 4px;
        }
        .tier-card-tagline { font-size: 0.875rem; color: var(--slate-soft); font-style: italic; }
        .tier-card-badge {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          background: var(--cream);
          color: var(--slate-soft);
        }
        .tier-upgrade-btn {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--white);
          background: var(--terracotta);
          padding: 10px 20px;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .tier-upgrade-btn:hover { background: var(--terracotta-deep); }
        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }
        .dash-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          text-decoration: none;
          color: inherit;
          display: block;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .dash-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .dash-card.locked { opacity: 0.5; cursor: default; pointer-events: none; }
        .dash-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .dash-card-icon { font-size: 1.5rem; }
        .dash-card-lock {
          font-size: 0.75rem;
          color: var(--slate-ghost);
          background: var(--cream);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          font-weight: 600;
        }
        .dash-card-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          color: var(--slate);
          margin-bottom: 6px;
        }
        .dash-card-desc { font-size: 0.85rem; color: var(--slate-soft); line-height: 1.5; }
        .benefits-section {
          background: var(--white);
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
        }
        .benefits-title {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--slate-ghost);
          margin-bottom: 16px;
        }
        .benefit-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.9rem;
        }
        .benefit-row:last-child { border-bottom: none; }
        .benefit-check { font-size: 1rem; color: var(--forest-light); }
        .benefit-no { font-size: 1rem; color: rgba(61,57,53,0.15); }
        .benefit-label { flex: 1; color: var(--slate-soft); }
        .benefit-label.active { color: var(--slate); font-weight: 500; }
        .benefit-tier { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-ghost); }
      `}</style>

      <div className="sgc-page">
        <Nav variant="member" activePage="dashboard" />

        <main className="dash-main">
          <div className="dash-welcome">
            <p className="dash-welcome-eyebrow">Member Dashboard</p>
            <h1 className="dash-welcome-title">
              Welcome back, <em>{firstName}.</em>
            </h1>
            <p className="dash-welcome-sub">You're signed in as {user.email}</p>
          </div>

          <div className="tier-card" style={{"--tier-color": tier.color} as React.CSSProperties}>
            <div className="tier-card-info">
              <div className="tier-card-name">{tier.name}</div>
              <div className="tier-card-tagline">{tier.tagline}</div>
            </div>
            <span className="tier-card-badge">Current plan</span>
            {access.tier === "story" && (
              <a href="/membership" className="tier-upgrade-btn">Upgrade →</a>
            )}
            {access.tier === "chronicle" && (
              <a href="/membership" className="tier-upgrade-btn">Upgrade to Legacy →</a>
            )}
          </div>

          <div className="dash-grid">
            <a href="/" className="dash-card">
              <div className="dash-card-header">
                <span className="dash-card-icon">📰</span>
              </div>
              <div className="dash-card-title">Latest Editorial</div>
              <p className="dash-card-desc">Player spotlights, SGC Celebrates, and Collecting 101 — all your member content in one place.</p>
            </a>

            <a href={access.hasEarlyAccess ? "/members/early" : "#"} className={`dash-card${access.hasEarlyAccess ? "" : " locked"}`}>
              <div className="dash-card-header">
                <span className="dash-card-icon">⚡</span>
                {!access.hasEarlyAccess && <span className="dash-card-lock">Chronicle+</span>}
              </div>
              <div className="dash-card-title">Early Access</div>
              <p className="dash-card-desc">Read new spotlights and celebrates 72 hours before the free release window.</p>
            </a>

            <a href={access.hasFullArchive ? "/members/archive" : "#"} className={`dash-card${access.hasFullArchive ? "" : " locked"}`}>
              <div className="dash-card-header">
                <span className="dash-card-icon">📚</span>
                {!access.hasFullArchive && <span className="dash-card-lock">Chronicle+</span>}
              </div>
              <div className="dash-card-title">Full Archive</div>
              <p className="dash-card-desc">Every piece of SGC editorial, unlimited. No rolling 30-day window.</p>
            </a>

            <a href={access.hasEzineAccess ? "/members/ezine" : "#"} className={`dash-card${access.hasEzineAccess ? "" : " locked"}`}>
              <div className="dash-card-header">
                <span className="dash-card-icon">✨</span>
                {!access.hasEzineAccess && <span className="dash-card-lock">Legacy only</span>}
              </div>
              <div className="dash-card-title">Quarterly E-Zine</div>
              <p className="dash-card-desc">The director's cut — extended card curation and commentary, every quarter.</p>
            </a>

            <a href={access.hasChecklistDownload ? "/members/checklist" : "#"} className={`dash-card${access.hasChecklistDownload ? "" : " locked"}`}>
              <div className="dash-card-header">
                <span className="dash-card-icon">📋</span>
                {!access.hasChecklistDownload && <span className="dash-card-lock">Legacy only</span>}
              </div>
              <div className="dash-card-title">Collector's Checklist</div>
              <p className="dash-card-desc">Downloadable PDF — every featured card this quarter with editorial notes.</p>
            </a>

            <a href="/dashboard/account" className="dash-card">
              <div className="dash-card-header">
                <span className="dash-card-icon">⚙️</span>
              </div>
              <div className="dash-card-title">Account Settings</div>
              <p className="dash-card-desc">Manage your email, password, and subscription.</p>
            </a>
          </div>

          <div className="benefits-section">
            <div className="benefits-title">Your Benefits</div>
            <div className="benefit-row">
              <span className="benefit-check">✓</span>
              <span className="benefit-label active">Full editorial access</span>
              <span className="benefit-tier">All tiers</span>
            </div>
            <div className="benefit-row">
              {access.hasEarlyAccess ? <span className="benefit-check">✓</span> : <span className="benefit-no">—</span>}
              <span className={`benefit-label${access.hasEarlyAccess ? " active" : ""}`}>Early access — 72hr before free release</span>
              <span className="benefit-tier">Chronicle+</span>
            </div>
            <div className="benefit-row">
              {access.hasFullArchive ? <span className="benefit-check">✓</span> : <span className="benefit-no">—</span>}
              <span className={`benefit-label${access.hasFullArchive ? " active" : ""}`}>Full unlimited archive</span>
              <span className="benefit-tier">Chronicle+</span>
            </div>
            <div className="benefit-row">
              {access.hasCelebratesGallery ? <span className="benefit-check">✓</span> : <span className="benefit-no">—</span>}
              <span className={`benefit-label${access.hasCelebratesGallery ? " active" : ""}`}>SGC Celebrates full card gallery</span>
              <span className="benefit-tier">Chronicle+</span>
            </div>
            <div className="benefit-row">
              {access.hasEzineAccess ? <span className="benefit-check">✓</span> : <span className="benefit-no">—</span>}
              <span className={`benefit-label${access.hasEzineAccess ? " active" : ""}`}>Quarterly E-Zine</span>
              <span className="benefit-tier">Legacy</span>
            </div>
            <div className="benefit-row">
              {access.hasChecklistDownload ? <span className="benefit-check">✓</span> : <span className="benefit-no">—</span>}
              <span className={`benefit-label${access.hasChecklistDownload ? " active" : ""}`}>Collector's Checklist PDF download</span>
              <span className="benefit-tier">Legacy</span>
            </div>
            <div className="benefit-row">
              {access.hasMerchEarlyAccess ? <span className="benefit-check">✓</span> : <span className="benefit-no">—</span>}
              <span className={`benefit-label${access.hasMerchEarlyAccess ? " active" : ""}`}>Card drop early access (48hr)</span>
              <span className="benefit-tier">Legacy</span>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
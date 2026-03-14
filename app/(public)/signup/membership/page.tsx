import { createClient } from "@/lib/supabase/server";

const CHECKOUT_LINKS = {
  chronicle: "https://buy.polar.sh/polar_cl_mAm7OX8HlwpCUoMG00L9NNR5f8N7I6ejnfR7C1XhYid",
  legacy: "https://buy.polar.sh/polar_cl_3pfgLCwUzfybSSaTFMLW4qoCbQ0heQftyKlZ52gvjnZ",
};

export default async function MembershipPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Caveat:wght@700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --terracotta: #d97757;
          --terracotta-deep: #c4653f;
          --terracotta-blush: #f0cbb8;
          --slate: #3d3935;
          --slate-soft: #5a5550;
          --slate-ghost: #9a948e;
          --forest: #3d6b4a;
          --forest-light: #6b9d7a;
          --forest-mist: #d4e8da;
          --lavender: #9b88c4;
          --lavender-soft: #b5a3d8;
          --lavender-mist: #e8e3f5;
          --gold: #e8b44c;
          --gold-mist: #fdf3d9;
          --cream: #faf6f1;
          --border: rgba(61,57,53,0.1);
        }
        .mem-page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--slate);
        }
        /* Nav */
        .mem-nav {
          background: white;
          border-bottom: 1px solid var(--border);
          padding: 0 48px;
          display: flex;
          align-items: center;
          height: 64px;
          gap: 24px;
        }
        .mem-logo {
          font-family: 'Caveat', cursive;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--slate);
          text-decoration: none;
        }
        .mem-logo span { color: var(--terracotta); }
        .mem-nav-right { margin-left: auto; display: flex; gap: 12px; align-items: center; }
        .mem-nav-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--slate-ghost);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .mem-nav-link:hover { color: var(--slate); background: var(--cream); }
        /* Hero */
        .mem-hero {
          text-align: center;
          padding: 72px 48px 48px;
          max-width: 720px;
          margin: 0 auto;
        }
        .mem-hero-eyebrow {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--terracotta);
          margin-bottom: 16px;
        }
        .mem-hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 400;
          color: var(--slate);
          line-height: 1.15;
          margin-bottom: 16px;
        }
        .mem-hero-title em { font-style: italic; color: var(--terracotta); }
        .mem-hero-sub {
          font-size: 1rem;
          color: var(--slate-soft);
          line-height: 1.65;
          max-width: 560px;
          margin: 0 auto;
        }
        /* Tier grid */
        .tier-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 48px 72px;
        }
        .tier-card {
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(61,57,53,0.06);
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .tier-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(61,57,53,0.1);
        }
        .tier-card.featured {
          border-color: var(--lavender);
          box-shadow: 0 4px 24px rgba(155,136,196,0.2);
        }
        .tier-featured-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--lavender);
          color: white;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .tier-header {
          padding: 28px 28px 20px;
          border-bottom: 1px solid var(--border);
        }
        .tier-name {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem;
          color: var(--slate);
          margin-bottom: 4px;
        }
        .tier-tagline {
          font-size: 0.85rem;
          color: var(--slate-ghost);
          font-style: italic;
          margin-bottom: 20px;
        }
        .tier-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .tier-price-amount {
          font-family: 'DM Serif Display', serif;
          font-size: 2.4rem;
          color: var(--slate);
          line-height: 1;
        }
        .tier-price-period {
          font-size: 0.85rem;
          color: var(--slate-ghost);
        }
        .tier-price-free {
          font-family: 'DM Serif Display', serif;
          font-size: 2rem;
          color: var(--forest-light);
        }
        /* Benefits list */
        .tier-benefits {
          padding: 24px 28px;
          flex: 1;
        }
        .tier-benefit {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
          font-size: 0.875rem;
          color: var(--slate-soft);
          line-height: 1.45;
        }
        .tier-benefit-check {
          color: var(--forest-light);
          font-size: 0.9rem;
          margin-top: 1px;
          flex-shrink: 0;
        }
        .tier-benefit-check.gold { color: var(--gold); }
        .tier-benefit-check.lav { color: var(--lavender-soft); }
        .tier-benefit strong { color: var(--slate); font-weight: 600; }
        /* CTA */
        .tier-cta {
          padding: 20px 28px 28px;
        }
        .tier-btn {
          display: block;
          width: 100%;
          padding: 14px;
          text-align: center;
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
        }
        .tier-btn-ghost {
          background: var(--cream);
          color: var(--slate-soft);
          border: 1.5px solid var(--border);
        }
        .tier-btn-ghost:hover { border-color: var(--slate-soft); color: var(--slate); }
        .tier-btn-lav {
          background: var(--lavender);
          color: white;
        }
        .tier-btn-lav:hover { background: var(--lavender); filter: brightness(1.05); }
        .tier-btn-gold {
          background: var(--gold);
          color: var(--slate);
        }
        .tier-btn-gold:hover { filter: brightness(1.05); }
        .tier-btn-green {
          background: var(--forest-mist);
          color: var(--forest);
        }
        .tier-btn-green:hover { background: #c4deca; }
        /* Color bar on top */
        .tier-bar {
          height: 4px;
          width: 100%;
        }
        /* FAQ / fine print */
        .mem-fine {
          text-align: center;
          padding: 0 48px 72px;
          max-width: 640px;
          margin: 0 auto;
        }
        .mem-fine-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.4rem;
          color: var(--slate);
          margin-bottom: 20px;
        }
        .mem-fine p {
          font-size: 0.875rem;
          color: var(--slate-soft);
          line-height: 1.7;
          margin-bottom: 12px;
        }
        .mem-fine a { color: var(--terracotta); text-decoration: none; }
      `}</style>

      <div className="mem-page">
        {/* Nav */}
        <nav className="mem-nav">
          <a href="/" className="mem-logo">She Got <span>Cardboard</span></a>
          <div className="mem-nav-right">
            {user ? (
              <a href="/dashboard" className="mem-nav-link">Dashboard →</a>
            ) : (
              <>
                <a href="/login" className="mem-nav-link">Sign in</a>
                <a href="/signup" className="mem-nav-link" style={{color: 'var(--terracotta)', border: '1.5px solid var(--terracotta)', borderRadius: '8px'}}>Join free</a>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <div className="mem-hero">
          <p className="mem-hero-eyebrow">Membership</p>
          <h1 className="mem-hero-title">
            Choose how you<br /><em>collect her story.</em>
          </h1>
          <p className="mem-hero-sub">
            Every tier gets the full editorial experience. Paid members get early access, the full archive, and exclusive content that goes deeper into the cards and the women behind them.
          </p>
        </div>

        {/* Tier grid */}
        <div className="tier-grid">

          {/* The Story */}
          <div className="tier-card">
            <div className="tier-bar" style={{background: 'var(--forest-mist)'}} />
            <div className="tier-header">
              <div className="tier-name">The Story</div>
              <div className="tier-tagline">Every story, always free.</div>
              <div className="tier-price">
                <span className="tier-price-free">Free</span>
              </div>
            </div>
            <div className="tier-benefits">
              <div className="tier-benefit">
                <span className="tier-benefit-check">✓</span>
                <span><strong>Full editorial access</strong> — every player spotlight, SGC Celebrates, and Collecting 101</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check">✓</span>
                <span>New content available <strong>72 hours</strong> after paid member release</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check">✓</span>
                <span>Rolling <strong>30-day archive</strong> access</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check">✓</span>
                <span>Hero card image on SGC Celebrates features</span>
              </div>
            </div>
            <div className="tier-cta">
              {user ? (
                <a href="/dashboard" className="tier-btn tier-btn-green">Go to dashboard</a>
              ) : (
                <a href="/signup" className="tier-btn tier-btn-green">Start free →</a>
              )}
            </div>
          </div>

          {/* The Chronicle */}
          <div className="tier-card featured">
            <div className="tier-bar" style={{background: 'var(--lavender)'}} />
            <span className="tier-featured-badge">Most popular</span>
            <div className="tier-header">
              <div className="tier-name">The Chronicle</div>
              <div className="tier-tagline">Read it first. Go deeper.</div>
              <div className="tier-price">
                <span className="tier-price-amount">$7</span>
                <span className="tier-price-period">/month</span>
              </div>
            </div>
            <div className="tier-benefits">
              <div className="tier-benefit">
                <span className="tier-benefit-check lav">✓</span>
                <span><strong>Everything in The Story</strong></span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check lav">✓</span>
                <span><strong>Early access</strong> — read new content 72 hours before free release</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check lav">✓</span>
                <span><strong>Full unlimited archive</strong> — every piece of SGC editorial, no time limit</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check lav">✓</span>
                <span><strong>Full card gallery</strong> on SGC Celebrates features (3–5 cards)</span>
              </div>
            </div>
            <div className="tier-cta">
              <a href={CHECKOUT_LINKS.chronicle} className="tier-btn tier-btn-lav">Subscribe — $7/mo →</a>
            </div>
          </div>

          {/* The Legacy */}
          <div className="tier-card">
            <div className="tier-bar" style={{background: 'var(--gold)'}} />
            <div className="tier-header">
              <div className="tier-name">The Legacy</div>
              <div className="tier-tagline">The story in your hands.</div>
              <div className="tier-price">
                <span className="tier-price-amount">$18</span>
                <span className="tier-price-period">/month</span>
              </div>
            </div>
            <div className="tier-benefits">
              <div className="tier-benefit">
                <span className="tier-benefit-check gold">✓</span>
                <span><strong>Everything in The Chronicle</strong></span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check gold">✓</span>
                <span><strong>Quarterly E-Zine</strong> — director's cut card curation + commentary</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check gold">✓</span>
                <span><strong>Collector's Checklist PDF</strong> — every featured card with editorial notes</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check gold">✓</span>
                <span><strong>Card drop early access</strong> — 48hr before general release</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check gold">✓</span>
                <span>Grandfathered into future Legacy benefits as they launch</span>
              </div>
            </div>
            <div className="tier-cta">
              <a href={CHECKOUT_LINKS.legacy} className="tier-btn tier-btn-gold">Subscribe — $18/mo →</a>
            </div>
          </div>

        </div>

        {/* Fine print */}
        <div className="mem-fine">
          <h2 className="mem-fine-title">Good to know</h2>
          <p>Cancel anytime — no questions asked. Your access continues until the end of your billing period.</p>
          <p>Paid subscriptions are processed securely by <strong>Polar</strong>, our merchant of record. They handle taxes so we don't have to.</p>
          <p>Questions? <a href="mailto:hello@shegotcardboard.com">hello@shegotcardboard.com</a></p>
        </div>

      </div>
    </>
  );
}
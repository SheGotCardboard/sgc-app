import Nav from "@/components/layout/Nav";

const CHECKOUT_LINKS = {
  chronicle: "https://buy.polar.sh/polar_cl_mAm7OX8HlwpCUoMG00L9NNR5f8N7I6ejnfR7C1XhYid",
  legacy: "https://buy.polar.sh/polar_cl_3pfgLCwUzfybSSaTFMLW4qoCbQ0heQftyKlZ52gvjnZ",
};

export default async function MembershipPage() {
  return (
    <>
      <style>{`
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
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 3rem);
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
        .tier-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 48px 72px;
        }
        .mem-tier-card {
          background: var(--white);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .mem-tier-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
        .mem-tier-card.featured { border-color: var(--lavender); }
        .tier-featured-badge {
          position: absolute;
          top: 16px; right: 16px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--lavender);
          color: var(--white);
          padding: 4px 10px;
          border-radius: var(--radius-pill);
        }
        .tier-bar { height: 4px; width: 100%; }
        .tier-header {
          padding: 28px 28px 20px;
          border-bottom: 1px solid var(--border);
        }
        .tier-name {
          font-family: var(--font-display);
          font-size: 1.5rem;
          color: var(--slate);
          margin-bottom: 4px;
        }
        .tier-tagline { font-size: 0.85rem; color: var(--slate-ghost); font-style: italic; margin-bottom: 20px; }
        .tier-price { display: flex; align-items: baseline; gap: 4px; }
        .tier-price-amount { font-family: var(--font-display); font-size: 2.4rem; color: var(--slate); line-height: 1; }
        .tier-price-period { font-size: 0.85rem; color: var(--slate-ghost); }
        .tier-price-free { font-family: var(--font-display); font-size: 2rem; color: var(--tier-story); }
        .tier-benefits { padding: 24px 28px; flex: 1; }
        .tier-benefit {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
          font-size: 0.875rem;
          color: var(--slate-soft);
          line-height: 1.45;
        }
        .tier-benefit-check { font-size: 0.9rem; margin-top: 1px; flex-shrink: 0; }
        .tier-benefit strong { color: var(--slate); font-weight: 600; }
        .tier-cta { padding: 20px 28px 28px; }
        .mem-fine {
          text-align: center;
          padding: 0 48px 72px;
          max-width: 640px;
          margin: 0 auto;
        }
        .mem-fine-title {
          font-family: var(--font-display);
          font-size: 1.4rem;
          color: var(--slate);
          margin-bottom: 20px;
        }
        .mem-fine p { font-size: 0.875rem; color: var(--slate-soft); line-height: 1.7; margin-bottom: 12px; }
        .mem-fine a { color: var(--terracotta); }
      `}</style>

      <div className="sgc-page">
        <Nav />

        <div className="mem-hero">
          <p className="mem-hero-eyebrow">Membership</p>
          <h1 className="mem-hero-title">
            Choose how you<br /><em>collect her story.</em>
          </h1>
          <p className="mem-hero-sub">
            Every tier gets the full editorial experience. Paid members get early access, the full archive, and exclusive content that goes deeper into the cards and the women behind them.
          </p>
        </div>

        <div className="tier-grid">

          {/* The Story */}
          <div className="mem-tier-card">
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
                <span className="tier-benefit-check" style={{color: 'var(--tier-story)'}}>✓</span>
                <span><strong>Full editorial access</strong> — every player spotlight, SGC Celebrates, and Collecting 101</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check" style={{color: 'var(--tier-story)'}}>✓</span>
                <span>New content available <strong>72 hours</strong> after paid member release</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check" style={{color: 'var(--tier-story)'}}>✓</span>
                <span>Rolling <strong>30-day archive</strong> access</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check" style={{color: 'var(--tier-story)'}}>✓</span>
                <span>Hero card image on SGC Celebrates features</span>
              </div>
            </div>
            <div className="tier-cta">
              <a href="/signup" className="sgc-btn sgc-btn-full" style={{background: 'var(--forest-mist)', color: 'var(--forest)'}}>
                Start free →
              </a>
            </div>
          </div>

          {/* The Chronicle */}
          <div className="mem-tier-card featured">
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
                <span className="tier-benefit-check" style={{color: 'var(--tier-chronicle)'}}>✓</span>
                <span><strong>Everything in The Story</strong></span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check" style={{color: 'var(--tier-chronicle)'}}>✓</span>
                <span><strong>Early access</strong> — read new content 72 hours before free release</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check" style={{color: 'var(--tier-chronicle)'}}>✓</span>
                <span><strong>Full unlimited archive</strong> — every piece of SGC editorial, no time limit</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check" style={{color: 'var(--tier-chronicle)'}}>✓</span>
                <span><strong>Full card gallery</strong> on SGC Celebrates features (3–5 cards)</span>
              </div>
            </div>
            <div className="tier-cta">
              <a href={CHECKOUT_LINKS.chronicle} className="sgc-btn sgc-btn-full" style={{background: 'var(--lavender)', color: 'var(--white)'}}>
                Subscribe — $7/mo →
              </a>
            </div>
          </div>

          {/* The Legacy */}
          <div className="mem-tier-card">
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
                <span className="tier-benefit-check" style={{color: 'var(--gold)'}}>✓</span>
                <span><strong>Everything in The Chronicle</strong></span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check" style={{color: 'var(--gold)'}}>✓</span>
                <span><strong>Quarterly E-Zine</strong> — director's cut card curation + commentary</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check" style={{color: 'var(--gold)'}}>✓</span>
                <span><strong>Collector's Checklist PDF</strong> — every featured card with editorial notes</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check" style={{color: 'var(--gold)'}}>✓</span>
                <span><strong>Card drop early access</strong> — 48hr before general release</span>
              </div>
              <div className="tier-benefit">
                <span className="tier-benefit-check" style={{color: 'var(--gold)'}}>✓</span>
                <span>Grandfathered into future Legacy benefits as they launch</span>
              </div>
            </div>
            <div className="tier-cta">
              <a href={CHECKOUT_LINKS.legacy} className="sgc-btn sgc-btn-full" style={{background: 'var(--gold)', color: 'var(--slate)'}}>
                Subscribe — $18/mo →
              </a>
            </div>
          </div>

        </div>

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
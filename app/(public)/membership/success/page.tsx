import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout_id?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await searchParams;

  return (
    <>
      <style>{`
        .success-page {
          min-height: 100vh;
          background: var(--cream);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        .success-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(61,107,74,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(232,180,76,0.05) 0%, transparent 60%);
          pointer-events: none;
        }
        .success-card {
          background: var(--white);
          border-radius: var(--radius-xl);
          padding: 3rem;
          max-width: 520px;
          width: 100%;
          box-shadow: var(--shadow-lg);
          text-align: center;
          position: relative;
          z-index: 1;
          border: 1px solid var(--border);
        }
        .success-logo {
          font-family: var(--font-logo);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--slate);
          margin-bottom: 24px;
          display: block;
        }
        .success-logo span { color: var(--terracotta); }
        .success-icon {
          width: 72px; height: 72px;
          background: var(--forest-mist);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 2rem;
        }
        .success-title {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--slate);
          margin-bottom: 12px;
          line-height: 1.2;
        }
        .success-title em { font-style: italic; color: var(--terracotta); }
        .success-sub {
          font-size: 0.95rem;
          color: var(--slate-soft);
          line-height: 1.65;
          margin-bottom: 32px;
        }
        .success-divider { height: 1px; background: var(--border); margin: 28px 0; }
        .success-next-title {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--slate-ghost);
          margin-bottom: 16px;
        }
        .success-steps { text-align: left; margin-bottom: 28px; }
        .success-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 0.9rem;
          color: var(--slate-soft);
          line-height: 1.5;
        }
        .success-step-num {
          width: 22px; height: 22px;
          background: var(--forest-mist);
          color: var(--forest);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .success-fine {
          margin-top: 20px;
          font-size: 0.75rem;
          color: var(--slate-ghost);
          line-height: 1.6;
        }
        .success-fine a { color: var(--terracotta); }
      `}</style>

      <div className="success-page">
        <div className="success-card">
          <span className="success-logo">She Got <span>Cardboard</span></span>

          <div className="success-icon">🎉</div>

          <h1 className="success-title">
            You're in,<br /><em>collector.</em>
          </h1>

          <p className="success-sub">
            Your membership is active. Welcome to the SGC community — the editorial home for women's sports cards.
          </p>

          <div className="success-divider" />

          <p className="success-next-title">What happens next</p>

          <div className="success-steps">
            <div className="success-step">
              <span className="success-step-num">1</span>
              <span>Check your email — a confirmation from Polar is on its way with your receipt.</span>
            </div>
            <div className="success-step">
              <span className="success-step-num">2</span>
              <span>Your dashboard is already unlocked — head there now to see your full benefits.</span>
            </div>
            <div className="success-step">
              <span className="success-step-num">3</span>
              <span>Early access content drops every week — you'll see it 72 hours before free members.</span>
            </div>
          </div>

          <a href="/dashboard" className="sgc-btn sgc-btn-primary sgc-btn-full" style={{marginBottom: '10px'}}>
            Go to my dashboard →
          </a>
          <a href="/" className="sgc-btn sgc-btn-ghost sgc-btn-full">
            Explore editorial
          </a>

          <p className="success-fine">
            Questions? <a href="mailto:members@shegotcardboard.com">members@shegotcardboard.com</a>
          </p>
        </div>
      </div>
    </>
  );
}
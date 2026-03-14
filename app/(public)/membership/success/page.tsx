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

  const { checkout_id } = await searchParams;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Caveat:wght@700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --terracotta: #d97757;
          --terracotta-deep: #c4653f;
          --slate: #3d3935;
          --slate-soft: #5a5550;
          --slate-ghost: #9a948e;
          --cream: #faf6f1;
          --forest: #3d6b4a;
          --forest-light: #6b9d7a;
          --forest-mist: #d4e8da;
          --gold: #e8b44c;
          --border: rgba(61,57,53,0.1);
        }
        .success-page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--slate);
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
          background: white;
          border-radius: 20px;
          padding: 3rem;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 4px 32px rgba(61,57,53,0.08);
          text-align: center;
          position: relative;
          z-index: 1;
          border: 1px solid var(--border);
        }
        .success-icon {
          width: 72px;
          height: 72px;
          background: var(--forest-mist);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 2rem;
        }
        .success-logo {
          font-family: 'Caveat', cursive;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--slate);
          margin-bottom: 24px;
          display: block;
        }
        .success-logo span { color: var(--terracotta); }
        .success-title {
          font-family: 'DM Serif Display', serif;
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
        .success-divider {
          height: 1px;
          background: var(--border);
          margin: 28px 0;
        }
        .success-next-title {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--slate-ghost);
          margin-bottom: 16px;
        }
        .success-steps {
          text-align: left;
          margin-bottom: 28px;
        }
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
          width: 22px;
          height: 22px;
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
        .success-btn {
          display: block;
          width: 100%;
          padding: 14px;
          background: var(--terracotta);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          transition: background 0.2s;
          margin-bottom: 10px;
        }
        .success-btn:hover { background: var(--terracotta-deep); }
        .success-btn-ghost {
          display: block;
          width: 100%;
          padding: 14px;
          background: transparent;
          color: var(--slate-soft);
          text-decoration: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          border: 1.5px solid var(--border);
          transition: all 0.2s;
        }
        .success-btn-ghost:hover { border-color: var(--slate-soft); color: var(--slate); }
        .success-fine {
          margin-top: 20px;
          font-size: 0.75rem;
          color: var(--slate-ghost);
          line-height: 1.6;
        }
        .success-fine a { color: var(--terracotta); text-decoration: none; }
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

          <a href="/dashboard" className="success-btn">Go to my dashboard →</a>
          <a href="/" className="success-btn-ghost">Explore editorial</a>

          <p className="success-fine">
            Questions about your membership? <a href="mailto:members@shegotcardboard.com">members@shegotcardboard.com</a>
          </p>
        </div>
      </div>
    </>
  );
}
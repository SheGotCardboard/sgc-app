import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAccess } from "@/lib/access";
import { Polar } from "@polar-sh/sdk";

async function getCustomerPortalUrl(email: string): Promise<string | null> {
  try {
    const polar = new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN! });
    const customers = await polar.customers.list({ email });
    const customer = customers.result.items[0];
    if (!customer) return null;
    const session = await polar.customerSessions.create({
      customerId: customer.id,
    });
    return session.customerPortalUrl;
  } catch {
    return null;
  }
}

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const access = await getAccess();
  const portalUrl = await getCustomerPortalUrl(user.email!);

  const tierLabels: Record<string, { name: string; color: string }> = {
    story:     { name: "The Story",     color: "#6b9d7a" },
    chronicle: { name: "The Chronicle", color: "#b5a3d8" },
    legacy:    { name: "The Legacy",    color: "#e8b44c" },
  };

  const tier = tierLabels[access.tier ?? "story"];

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
          --forest-light: #6b9d7a;
          --border: rgba(61,57,53,0.1);
        }
        .account-page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--slate);
        }
        .account-nav {
          background: white;
          border-bottom: 1px solid var(--border);
          padding: 0 48px;
          display: flex;
          align-items: center;
          height: 64px;
          gap: 24px;
        }
        .account-logo {
          font-family: 'Caveat', cursive;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--slate);
          text-decoration: none;
        }
        .account-logo span { color: var(--terracotta); }
        .account-nav-links { display: flex; gap: 4px; margin-left: 16px; }
        .account-nav-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--slate-ghost);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .account-nav-link:hover { background: var(--cream); color: var(--slate); }
        .account-nav-link.active { color: var(--slate); background: var(--cream); }
        .account-nav-right { margin-left: auto; }
        .account-signout {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--slate-ghost);
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          transition: all 0.15s;
          background: white;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .account-signout:hover { border-color: var(--terracotta); color: var(--terracotta); }
        .account-main {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px;
        }
        .account-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2rem;
          color: var(--slate);
          margin-bottom: 32px;
        }
        .account-section {
          background: white;
          border-radius: 14px;
          border: 1px solid var(--border);
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 0 1px 6px rgba(61,57,53,0.05);
        }
        .account-section-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--slate-ghost);
        }
        .account-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
        }
        .account-row:last-child { border-bottom: none; }
        .account-row-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--slate-soft);
          margin-bottom: 2px;
        }
        .account-row-value {
          font-size: 0.9rem;
          color: var(--slate);
        }
        .account-row-action {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--terracotta);
          text-decoration: none;
          padding: 6px 14px;
          border: 1.5px solid rgba(217,119,87,0.3);
          border-radius: 6px;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .account-row-action:hover { background: rgba(217,119,87,0.05); }
        .tier-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 100px;
          background: var(--cream);
        }
        .account-portal-btn {
          display: inline-block;
          padding: 10px 20px;
          background: var(--terracotta);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          transition: background 0.2s;
        }
        .account-portal-btn:hover { background: var(--terracotta-deep); }
        .account-portal-note {
          font-size: 0.8rem;
          color: var(--slate-ghost);
          margin-top: 8px;
          line-height: 1.5;
        }
        .account-danger-btn {
          font-size: 0.85rem;
          font-weight: 600;
          color: #c0392b;
          background: none;
          border: 1.5px solid rgba(192,57,43,0.2);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s;
        }
        .account-danger-btn:hover { background: rgba(192,57,43,0.05); border-color: rgba(192,57,43,0.4); }
      `}</style>

      <div className="account-page">
        <nav className="account-nav">
          <a href="/" className="account-logo">She Got <span>Cardboard</span></a>
          <div className="account-nav-links">
            <a href="/dashboard" className="account-nav-link">Dashboard</a>
            <a href="/dashboard/account" className="account-nav-link active">Account</a>
          </div>
          <div className="account-nav-right">
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="account-signout">Sign out</button>
            </form>
          </div>
        </nav>

        <main className="account-main">
          <h1 className="account-title">Account Settings</h1>

          {/* Profile */}
          <div className="account-section">
            <div className="account-section-header">Profile</div>
            <div className="account-row">
              <div>
                <div className="account-row-label">Email</div>
                <div className="account-row-value">{user.email}</div>
              </div>
            </div>
            <div className="account-row">
              <div>
                <div className="account-row-label">First name</div>
                <div className="account-row-value">
                  {user.user_metadata?.first_name ?? "—"}
                </div>
              </div>
            </div>
            <div className="account-row">
              <div>
                <div className="account-row-label">Password</div>
                <div className="account-row-value">••••••••</div>
              </div>
              <a href="/forgot-password" className="account-row-action">Change</a>
            </div>
          </div>

          {/* Membership */}
          <div className="account-section">
            <div className="account-section-header">Membership</div>
            <div className="account-row">
              <div>
                <div className="account-row-label">Current plan</div>
                <div className="account-row-value">
                  <span className="tier-badge" style={{color: tier.color}}>
                    {tier.name}
                  </span>
                </div>
              </div>
              {access.tier === "story" && (
                <a href="/membership" className="account-row-action">Upgrade →</a>
              )}
            </div>
            {access.tier !== "story" && (
              <div className="account-row">
                <div>
                  <div className="account-row-label">Manage subscription</div>
                  <p className="account-portal-note">
                    Update payment method, view invoices, or cancel your subscription.
                  </p>
                </div>
                <div style={{marginLeft: '16px', flexShrink: 0}}>
                  {portalUrl ? (
                    <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="account-portal-btn">
                      Open portal →
                    </a>
                  ) : (
                    <a href="mailto:members@shegotcardboard.com" className="account-portal-btn">
                      Contact us
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="account-section">
            <div className="account-section-header">Account</div>
            <div className="account-row">
              <div>
                <div className="account-row-label">Delete account</div>
                <div className="account-row-value" style={{fontSize: '0.8rem', color: 'var(--slate-ghost)'}}>
                  Permanently delete your account and all data.
                </div>
              </div>
              <a href="mailto:hello@shegotcardboard.com?subject=Delete my account" className="account-danger-btn">
                Request deletion
              </a>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
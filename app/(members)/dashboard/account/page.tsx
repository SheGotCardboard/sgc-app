import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAccess } from "@/lib/access";
import { Polar } from "@polar-sh/sdk";
import Nav from "@/components/layout/Nav";

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
    story:     { name: "The Story",     color: "var(--tier-story)" },
    chronicle: { name: "The Chronicle", color: "var(--tier-chronicle)" },
    legacy:    { name: "The Legacy",    color: "var(--tier-legacy)" },
  };

  const tier = tierLabels[access.tier ?? "story"];

  return (
    <>
      <style>{`
        .account-main {
          max-width: 720px;
          margin: 0 auto;
          padding: var(--space-2xl);
        }
        .account-title {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--slate);
          margin-bottom: var(--space-xl);
        }
        .account-section {
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow: hidden;
          margin-bottom: var(--space-md);
          box-shadow: var(--shadow-sm);
        }
        .account-section-header {
          padding: var(--space-md) var(--space-lg);
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
          padding: 18px var(--space-lg);
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
          border-radius: var(--radius-sm);
          transition: all 0.15s;
          white-space: nowrap;
        }
        .account-row-action:hover { background: rgba(217,119,87,0.05); }
        .tier-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-pill);
          background: var(--cream);
        }
        .account-portal-note {
          font-size: 0.8rem;
          color: var(--slate-ghost);
          margin-top: 4px;
          line-height: 1.5;
        }
        .account-danger-btn {
          font-size: 0.85rem;
          font-weight: 600;
          color: #c0392b;
          background: none;
          border: 1.5px solid rgba(192,57,43,0.2);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-body);
          transition: all 0.15s;
          text-decoration: none;
          display: inline-block;
        }
        .account-danger-btn:hover {
          background: rgba(192,57,43,0.05);
          border-color: rgba(192,57,43,0.4);
        }
      `}</style>

      <div className="sgc-page">
        <Nav variant="member" activePage="account" />

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
                <div style={{marginLeft: 'var(--space-md)', flexShrink: 0}}>
                  {portalUrl ? (
                    <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="sgc-btn sgc-btn-primary">
                      Open portal →
                    </a>
                  ) : (
                    <a href="mailto:members@shegotcardboard.com" className="sgc-btn sgc-btn-primary">
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
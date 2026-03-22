import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/access";
import { notFound } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import CardImage from "@/components/card/CardImage";

const STORAGE_URL = "https://smgqjzddhzcpatwwqlci.supabase.co/storage/v1/object/public/cards";

export default async function CollectArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const access = await getAccess();
  const now = new Date();

  const { data: typeRow } = await supabase
    .from("ed_type_lkp")
    .select("ed_type_id")
    .eq("value", "collect")
    .single();

  const collectTypeId = (typeRow as any)?.ed_type_id;

  const { data: articleRaw } = await supabase
    .from("ed_calendar")
    .select("ed_cal_id, title, subtitle, excerpt, slug, publish_date, free_publish_date, story_card_id, is_hidden, body_html")
    .eq("slug", slug)
    .eq("is_hidden", false)
    .single();

  const article = articleRaw as any;
  if (!article) notFound();

  const publishDate = new Date(article.publish_date);
  const isFuture = publishDate > now;
  const canRead = !isFuture && access.isAuthenticated;

  const { data: cardRaw } = article.story_card_id
    ? await supabase.from("card").select("card_id, filename").eq("card_id", article.story_card_id).single()
    : { data: null };
  const card = cardRaw as any;

  const { data: sidebarRaw } = await supabase
    .from("ed_calendar")
    .select("ed_cal_id, title, excerpt, slug, publish_date, story_card_id")
    .eq("ed_type_id", collectTypeId)
    .eq("is_hidden", false)
    .lte("publish_date", now.toISOString())
    .neq("slug", slug)
    .order("publish_date", { ascending: true })
    .limit(6);

  const sidebarArticles = (sidebarRaw ?? []) as any[];

  const sidebarCardIds = sidebarArticles.map((a: any) => a.story_card_id).filter(Boolean);
  const { data: sidebarCardsRaw } = sidebarCardIds.length > 0
    ? await supabase.from("card").select("card_id, filename").in("card_id", sidebarCardIds)
    : { data: [] };
  const sidebarFilenameMap: Record<string, string> = Object.fromEntries(
    ((sidebarCardsRaw ?? []) as any[]).map((c: any) => [c.card_id, c.filename])
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });

  const placeholderDiv = (
    <div style={{
      width: '160px', height: '224px',
      background: '#f5f0e8', borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4b8a8" strokeWidth="1.25">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
    </div>
  );

  return (
    <div className="sgc-page">
      <Nav activePage="collect" />
      <style>{`
        .art-wrap { max-width: 1100px; margin: 0 auto; padding: 56px 48px; }
        .art-layout { display: grid; grid-template-columns: 1fr 260px; gap: 48px; align-items: start; }
        @media (max-width: 900px) { .art-layout { grid-template-columns: 1fr; } .art-wrap { padding: 40px 24px; } }

        .art-kicker { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--forest); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .art-kicker::before { content: ''; width: 24px; height: 2px; background: var(--forest); display: block; }
        .art-title { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); color: var(--slate); line-height: 1.1; margin-bottom: 8px; }
        .art-subtitle { font-size: 1rem; font-style: italic; color: var(--slate-soft); margin-bottom: 20px; line-height: 1.5; }
        .art-date { font-size: 0.82rem; color: var(--slate-ghost); margin-bottom: 28px; }

        .art-lede { display: flex; gap: 28px; align-items: flex-start; margin-bottom: 32px; }
        .art-lede-card { flex-shrink: 0; }
        .art-excerpt { font-size: 1.05rem; line-height: 1.8; color: var(--slate-soft); font-style: italic; border-left: 3px solid var(--forest); padding-left: 20px; margin: 0; flex: 1; }
        @media (max-width: 600px) { .art-lede { flex-direction: column; } }

        .art-body { font-size: 1rem; line-height: 1.8; color: var(--slate-soft); }
        .art-body p { margin-bottom: 1.6em; }
        .art-body h2 { font-family: var(--font-display); font-size: 1.6rem; color: var(--slate); margin: 2em 0 0.6em; line-height: 1.2; }
        .art-body h3 { font-family: var(--font-display); font-size: 1.2rem; color: var(--forest); margin: 1.6em 0 0.5em; line-height: 1.2; }

        .art-gate { background: var(--forest-mist); border-radius: 12px; padding: 32px; text-align: center; margin-top: 32px; }
        .art-gate-eyebrow { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--forest); margin-bottom: 10px; }
        .art-gate-title { font-family: var(--font-display); font-size: 1.6rem; color: var(--slate); margin-bottom: 8px; }
        .art-gate-desc { font-size: 0.9rem; color: var(--slate-soft); line-height: 1.6; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto; }
        .art-gate-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .art-gate-btn { font-size: 0.85rem; font-weight: 700; padding: 10px 22px; border-radius: 20px; text-decoration: none; transition: all 0.15s; }
        .art-gate-primary { background: var(--forest); color: white; }
        .art-gate-primary:hover { opacity: 0.9; }
        .art-gate-ghost { background: transparent; color: var(--slate-soft); border: 1px solid rgba(61,57,53,0.2); }

        .art-coming { text-align: center; padding: 60px 0; }
        .art-coming-icon { font-size: 2.5rem; margin-bottom: 16px; }
        .art-coming-title { font-family: var(--font-display); font-size: 1.6rem; color: var(--slate); margin-bottom: 8px; }
        .art-coming-desc { font-size: 0.9rem; color: var(--slate-ghost); }

        .art-sidebar { position: sticky; top: 80px; }
        .art-sidebar-title { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--slate-ghost); margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
        .art-sidebar-list { display: flex; flex-direction: column; gap: 12px; }
        .art-sidebar-item { display: flex; gap: 12px; text-decoration: none; color: inherit; padding: 10px; border-radius: 10px; border: 1px solid var(--border); background: white; transition: all 0.15s; }
        .art-sidebar-item:hover { border-color: var(--forest); background: rgba(61,107,74,0.03); }
        .art-sidebar-img-wrap { flex-shrink: 0; width: 56px; height: 78px; background: rgba(61,107,74,0.07); border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .art-sidebar-img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
        .art-sidebar-ph { opacity: 0.2; color: var(--slate); }
        .art-sidebar-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 3px; }
        .art-sidebar-type { font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--forest); }
        .art-sidebar-name { font-family: var(--font-display); font-size: 13px; color: var(--slate); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .art-sidebar-date { font-size: 10px; color: var(--slate-ghost); }
      `}</style>

      <div className="art-wrap">
        <div className="art-layout">

          {/* ── MAIN ── */}
          <main>
            <p className="art-kicker">📚 Collecting 101</p>
            <h1 className="art-title">{article.title}</h1>
            {article.subtitle && <p className="art-subtitle">{article.subtitle}</p>}
            <p className="art-date">{formatDate(article.publish_date)}</p>

            {isFuture && (
              <div className="art-coming">
                <div className="art-coming-icon">📚</div>
                <div className="art-coming-title">Coming Soon</div>
                <div className="art-coming-desc">This guide drops on {formatDate(article.publish_date)}.</div>
              </div>
            )}

            {!isFuture && (
              <div className="art-lede">
                <div className="art-lede-card">
                  {card?.filename ? (
                    <CardImage
                      src={`${STORAGE_URL}/${card.filename}`}
                      alt={article.title}
                      style={{ width: '160px', height: '224px', objectFit: 'cover', objectPosition: 'center top', borderRadius: '10px', boxShadow: '0 8px 32px rgba(61,57,53,0.18)' }}
                      placeholder={placeholderDiv}
                    />
                  ) : placeholderDiv}
                </div>
                {article.excerpt && (
                  <p className="art-excerpt">{article.excerpt}</p>
                )}
              </div>
            )}

            {!isFuture && canRead && article.body_html && (
              <div className="art-body" dangerouslySetInnerHTML={{ __html: article.body_html }} />
            )}

            {!isFuture && !access.isAuthenticated && (
              <div className="art-gate">
                <div className="art-gate-eyebrow">Free to read</div>
                <div className="art-gate-title">Create a free account to read</div>
                <p className="art-gate-desc">Every Collecting 101 guide is free with a Story account. No credit card needed.</p>
                <div className="art-gate-actions">
                  <a href="/signup" className="art-gate-btn art-gate-primary">Join free</a>
                  <a href="/login" className="art-gate-btn art-gate-ghost">Sign in</a>
                </div>
              </div>
            )}
          </main>

          {/* ── SIDEBAR ── */}
          {sidebarArticles.length > 0 && (
            <aside className="art-sidebar">
              <div className="art-sidebar-title">More Guides</div>
              <div className="art-sidebar-list">
                {sidebarArticles.map((s: any) => {
                  const sf = sidebarFilenameMap[s.story_card_id ?? ""];
                  return (
                    <a key={s.ed_cal_id} href={`/collect/${s.slug}`} className="art-sidebar-item">
                      <div className="art-sidebar-img-wrap">
                        {sf ? (
                          <img src={`${STORAGE_URL}/${sf}`} alt={s.title} className="art-sidebar-img" />
                        ) : (
                          <div className="art-sidebar-ph">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <path d="m21 15-5-5L5 21"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="art-sidebar-body">
                        <span className="art-sidebar-type">Collecting 101</span>
                        <span className="art-sidebar-name">{s.title}</span>
                        <span className="art-sidebar-date">{new Date(s.publish_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </aside>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
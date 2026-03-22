import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/access";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import CardImage from "@/components/card/CardImage";

const STORAGE_URL = "https://smgqjzddhzcpatwwqlci.supabase.co/storage/v1/object/public/cards";
const PAGE_SIZE = 12;

export default async function SpotlightIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const supabase = await createClient();
  const access = await getAccess();
  const offset = (currentPage - 1) * PAGE_SIZE;
  const now = new Date().toISOString();

  // Get spotlight type id
  const { data: typeRow } = await supabase
    .from("ed_type_lkp")
    .select("ed_type_id")
    .eq("value", "spotlight")
    .single();

  const spotlightTypeId = (typeRow as any)?.ed_type_id;

  // Fetch articles — not hidden, ordered newest first
  const { data: articlesRaw, count } = await supabase
    .from("ed_calendar")
    .select("ed_cal_id, title, subtitle, excerpt, slug, publish_date, free_publish_date, story_card_id, is_hidden", { count: "exact" })
    .eq("ed_type_id", spotlightTypeId)
    .eq("is_hidden", false)
    .order("publish_date", { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1);

  const articles = (articlesRaw ?? []) as any[];
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Fetch card filenames
  const storyCardIds = articles.map((a: any) => a.story_card_id).filter(Boolean);
  const { data: cardsRaw } = storyCardIds.length > 0
    ? await supabase.from("card").select("card_id, filename").in("card_id", storyCardIds)
    : { data: [] };
  const filenameMap: Record<string, string> = Object.fromEntries(
    ((cardsRaw ?? []) as any[]).map((c: any) => [c.card_id, c.filename])
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });

  const getBadge = (article: any) => {
    const publishDate = new Date(article.publish_date);
    const freePublishDate = article.free_publish_date ? new Date(article.free_publish_date) : null;
    const nowDate = new Date();
    if (publishDate > nowDate) return "coming-soon";
    if (freePublishDate && freePublishDate > nowDate) return "members-only";
    return null;
  };

  const isClickable = (article: any) => new Date(article.publish_date) <= new Date();

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
    <div className="sgc-page">
      <Nav activePage="spotlights" />
      <style>{`
        .si-wrap { max-width: 1100px; margin: 0 auto; padding: 56px 48px; }
        .si-header { margin-bottom: 40px; }
        .si-kicker { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .si-kicker::before { content: ''; width: 24px; height: 2px; background: var(--terracotta); display: block; }
        .si-title { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 2.8rem); color: var(--slate); margin-bottom: 8px; line-height: 1.1; }
        .si-desc { font-size: 0.95rem; color: var(--slate-soft); line-height: 1.6; max-width: 560px; }
        .si-count { font-size: 0.8rem; color: var(--slate-ghost); margin-top: 6px; }

        /* Grid */
        .si-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 900px) { .si-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .si-grid { grid-template-columns: 1fr; } .si-wrap { padding: 40px 24px; } }

        /* Tile */
        .si-tile {
          background: white; border: 1px solid var(--border); border-radius: 14px;
          overflow: hidden; box-shadow: var(--shadow-sm);
          text-decoration: none; color: inherit;
          display: flex; flex-direction: column;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .si-tile:not(.si-tile-disabled):hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .si-tile-disabled { cursor: default; opacity: 0.75; }
        .si-tile-bar { height: 4px; background: var(--terracotta); flex-shrink: 0; }

        /* Image area */
        .si-tile-image {
          height: 160px; background: rgba(217,119,87,0.07);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .tile-ph { display: flex; align-items: center; justify-content: center; opacity: 0.2; color: var(--slate); }

        /* Badges — upper right */
        .si-badge {
          position: absolute; top: 10px; right: 10px;
          font-size: 9px; font-weight: 800;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 3px 8px; border-radius: 20px;
          z-index: 2;
        }
        .si-badge-coming { background: var(--slate); color: white; }
        .si-badge-members { background: var(--terracotta); color: white; }

        /* Body */
        .si-tile-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .si-tile-type { font-size: 10px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 5px; }
        .si-tile-date { font-size: 11px; color: var(--slate-ghost); margin-bottom: 4px; }
        .si-tile-title { font-family: var(--font-display); font-size: 17px; line-height: 1.25; color: var(--slate); margin-bottom: 4px; }
        .si-tile-subtitle { font-size: 11px; font-style: italic; color: var(--slate-ghost); margin-bottom: 8px; line-height: 1.4; }
        .si-tile-excerpt { font-size: 12px; line-height: 1.6; color: var(--slate-soft); flex: 1; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .si-tile-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--border); margin-top: auto; }
        .si-tile-cta { font-size: 11px; font-weight: 700; color: var(--terracotta); }
        .si-tile-cta::after { content: ' →'; }
        .si-tile-gate { font-size: 10px; color: var(--slate-ghost); font-style: italic; }

        /* Pagination */
        .si-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 48px; }
        .si-page-btn {
          font-size: 0.85rem; font-weight: 600;
          padding: 8px 18px; border-radius: var(--radius-sm);
          border: 1px solid var(--border); background: white;
          color: var(--slate-soft); text-decoration: none;
          transition: all 0.15s;
        }
        .si-page-btn:hover { border-color: var(--terracotta); color: var(--terracotta); }
        .si-page-btn.active { background: var(--terracotta); color: white; border-color: var(--terracotta); }
        .si-page-btn.disabled { opacity: 0.35; pointer-events: none; }
        .si-page-info { font-size: 0.8rem; color: var(--slate-ghost); }

        /* Empty */
        .si-empty { text-align: center; padding: 80px 0; }
        .si-empty-icon { font-size: 2.5rem; margin-bottom: 16px; }
        .si-empty-text { font-family: var(--font-display); font-size: 1.4rem; color: var(--slate); margin-bottom: 8px; }
        .si-empty-desc { font-size: 0.9rem; color: var(--slate-ghost); }
      `}</style>

      <div className="si-wrap">
        <div className="si-header">
          <p className="si-kicker">⭐ Player Spotlight</p>
          <h1 className="si-title">Introducing…</h1>
          <p className="si-desc">One athlete. Her story, her significance, the card that connects you to her legacy.</p>
          {totalCount > 0 && <p className="si-count">{totalCount} spotlight{totalCount !== 1 ? "s" : ""}</p>}
        </div>

        {articles.length === 0 ? (
          <div className="si-empty">
            <div className="si-empty-icon">⭐</div>
            <div className="si-empty-text">First spotlight coming soon</div>
            <div className="si-empty-desc">Our first player spotlight drops with launch week.</div>
          </div>
        ) : (
          <>
            <div className="si-grid">
              {articles.map((article: any) => {
                const badge = getBadge(article);
                const clickable = isClickable(article);
                const filename = filenameMap[article.story_card_id ?? ""];
                const cardImgStyle = {
                  width: '60%', height: '85%',
                  objectFit: 'cover' as const,
                  objectPosition: 'center top',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(61,57,53,0.2)',
                };

                const tileContent = (
                  <>
                    <div className="si-tile-bar" />
                    <div className="si-tile-image" data-card-id={article.story_card_id ?? undefined}>
                      {filename
                        ? <CardImage src={`${STORAGE_URL}/${filename}`} alt={article.title} style={cardImgStyle} placeholder={placeholderSVG} />
                        : placeholderSVG}
                      {badge === "coming-soon" && <span className="si-badge si-badge-coming">Coming Soon</span>}
                      {badge === "members-only" && <span className="si-badge si-badge-members">Members Only</span>}
                    </div>
                    <div className="si-tile-body">
                      <div className="si-tile-type">Player Spotlight</div>
                      <div className="si-tile-date">{formatDate(article.publish_date)}</div>
                      <div className="si-tile-title">{article.title}</div>
                      {article.subtitle && <div className="si-tile-subtitle">{article.subtitle}</div>}
                      {article.excerpt && <p className="si-tile-excerpt">{article.excerpt}</p>}
                      <div className="si-tile-footer">
                        <span className="si-tile-cta">{clickable ? "Read her story" : "Coming soon"}</span>
                        <span className="si-tile-gate">
                          {!clickable ? "" : !access.isAuthenticated ? "Sign in to read" : badge === "members-only" ? "Members only" : "Read now"}
                        </span>
                      </div>
                    </div>
                  </>
                );

                return clickable ? (
                  <a key={article.ed_cal_id} href={`/spotlight/${article.slug}`} className="si-tile">
                    {tileContent}
                  </a>
                ) : (
                  <div key={article.ed_cal_id} className="si-tile si-tile-disabled">
                    {tileContent}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="si-pagination">
                <a
                  href={`/spotlight?page=${currentPage - 1}`}
                  className={`si-page-btn${currentPage === 1 ? " disabled" : ""}`}
                >
                  ← Prev
                </a>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <a
                    key={p}
                    href={`/spotlight?page=${p}`}
                    className={`si-page-btn${p === currentPage ? " active" : ""}`}
                  >
                    {p}
                  </a>
                ))}
                <a
                  href={`/spotlight?page=${currentPage + 1}`}
                  className={`si-page-btn${currentPage === totalPages ? " disabled" : ""}`}
                >
                  Next →
                </a>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
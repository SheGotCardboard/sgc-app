import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/access";
import { notFound } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import CardImage from "@/components/card/CardImage";
import ArticleGallery from "@/components/editorial/ArticleGallery";

const STORAGE_URL = "https://smgqjzddhzcpatwwqlci.supabase.co/storage/v1/object/public/cards";

export default async function SpotlightArticlePage({
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
    .eq("value", "spotlight")
    .single();

  const spotlightTypeId = (typeRow as any)?.ed_type_id;

  const { data: articleRaw } = await supabase
    .from("ed_calendar")
    .select("ed_cal_id, title, subtitle, excerpt, slug, publish_date, free_publish_date, story_card_id, is_hidden, body_html")
    .eq("slug", slug)
    .eq("is_hidden", false)
    .single();

  const article = articleRaw as any;
  if (!article) notFound();

  const publishDate = new Date(article.publish_date);
  const freePublishDate = article.free_publish_date ? new Date(article.free_publish_date) : null;
  const isFuture = publishDate > now;
  const isEarlyAccess = !isFuture && freePublishDate && freePublishDate > now;
  const canRead = !isFuture && (access.hasEarlyAccess || !isEarlyAccess);

  const { data: cardRaw } = article.story_card_id
    ? await supabase.from("card").select("card_id, filename").eq("card_id", article.story_card_id).single()
    : { data: null };
  const card = cardRaw as any;

  // ── Fetch gallery — simple query first ──────────────────
  const { data: gallerySimple} = await supabase
    .from("ed_gallery")
    .select("ed_gallery_id, display_order, card_id, ed_cal_id")
    .eq("ed_cal_id", article.ed_cal_id)
    .order("display_order", { ascending: true });

    
  // Temporary — fetch card filenames separately
  const galleryCardIds = (gallerySimple ?? []).map((g: any) => g.card_id).filter(Boolean);
  const { data: galleryCardData } = galleryCardIds.length > 0
    ? await supabase
        .from("card")
        .select("card_id, filename, card_number, print_run, card_type_id, color_id, card_set_id, pri_subject_id, pri_subject_type_id")
        .in("card_id", galleryCardIds)
    : { data: [] };

  const galleryCardMap = Object.fromEntries(
    ((galleryCardData ?? []) as any[]).map((c: any) => [c.card_id, c])
  );

  // Fetch card set data
  const cardSetIds = [...new Set(((galleryCardData ?? []) as any[]).map((c: any) => c.card_set_id).filter(Boolean))];
  const { data: cardSetData } = cardSetIds.length > 0
    ? await supabase.from("card_sets").select("card_set_id, set_name, year, manufacturer, slug").in("card_set_id", cardSetIds)
    : { data: [] };
  const cardSetMap = Object.fromEntries(
    ((cardSetData ?? []) as any[]).map((s: any) => [s.card_set_id, s])
  );

   
  
  // Fetch card type labels
  const { data: cardTypeData } = await supabase
    .from("card_type_lkp")
    .select("card_type_id, value");
  const cardTypeMap = Object.fromEntries(
    ((cardTypeData ?? []) as any[]).map((t: any) => [t.card_type_id, t.value])
  );

  // Fetch color labels
  const { data: colorData } = await supabase
    .from("card_color_lkp")
    .select("color_id, value");
  const colorMap = Object.fromEntries(
    ((colorData ?? []) as any[]).map((c: any) => [c.color_id, c.value])
  );

  // Assemble gallery cards
  const galleryCards = ((gallerySimple ?? []) as any[]).map((g: any) => {
    const c = galleryCardMap[g.card_id] ?? {};
    const cs = cardSetMap[c.card_set_id] ?? {};
    const isPlayer = c.pri_subject_type_id === '78f8a7f8-89a1-4272-a6c6-90235881363c';
    return {
      ed_gallery_id: g.ed_gallery_id,
      display_order: g.display_order,
      caption: null,
      card_id: g.card_id,
      filename: c.filename ?? null,
      card_number: c.card_number ?? null,
      card_type: cardTypeMap[c.card_type_id] ?? null,
      color: colorMap[c.color_id] ?? null,
      print_run: c.print_run ?? null,
      set_name: cs.set_name ?? null,
      year: cs.year ?? null,
      manufacturer: cs.manufacturer ?? null,
      set_slug: cs.slug ?? null,
      player_name: null,
      player_slug: isPlayer ? null : null,
    };
  });

  
  // ── Sidebar ──────────────────────────────────────────────
  const { data: sidebarRaw } = await supabase
    .from("ed_calendar")
    .select("ed_cal_id, title, excerpt, slug, publish_date, story_card_id")
    .eq("ed_type_id", spotlightTypeId)
    .eq("is_hidden", false)
    .lte("publish_date", now.toISOString())
    .neq("slug", slug)
    .order("publish_date", { ascending: false })
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

  return (
    <div className="sgc-page">
      <Nav activePage="spotlights" />
      <style>{`
        .art-wrap { max-width: 1200px; margin: 0 auto; padding: 56px 48px; }
        .art-layout { display: grid; grid-template-columns: 1fr 280px; gap: 48px; align-items: start; }
        @media (max-width: 900px) { .art-layout { grid-template-columns: 1fr; } .art-wrap { padding: 40px 24px; } }

        .art-kicker { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .art-kicker::before { content: ''; width: 24px; height: 2px; background: var(--terracotta); display: block; }
        .art-title { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); color: var(--slate); line-height: 1.1; margin-bottom: 8px; }
        .art-subtitle { font-size: 1rem; font-style: italic; color: var(--slate-soft); margin-bottom: 20px; line-height: 1.5; }
        .art-date { font-size: 0.82rem; color: var(--slate-ghost); margin-bottom: 28px; }

        .art-lede { display: flex; gap: 28px; align-items: flex-start; margin-bottom: 32px; }
        .art-lede-card { flex-shrink: 0; }
        .art-ph { width: 160px; height: 224px; background: #f5f0e8; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .art-excerpt { font-size: 1.05rem; line-height: 1.8; color: var(--slate-soft); font-style: italic; border-left: 3px solid var(--terracotta); padding-left: 20px; margin: 0; flex: 1; }
        @media (max-width: 600px) { .art-lede { flex-direction: column; } }

        .art-body { font-size: 1rem; line-height: 1.85; color: var(--slate-soft); max-width: 680px; }
        .art-body p { margin-bottom: 1.6em; }
        .art-body h2 { font-family: var(--font-display); font-size: 1.6rem; color: var(--slate); margin: 2em 0 0.6em; line-height: 1.2; }
        .art-body h3 { font-family: var(--font-display); font-size: 1.2rem; color: var(--terracotta); margin: 1.6em 0 0.5em; line-height: 1.2; }

        .art-gate { background: var(--terracotta-blush); border-radius: 12px; padding: 32px; text-align: center; margin-top: 32px; }
        .art-gate-eyebrow { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 10px; }
        .art-gate-title { font-family: var(--font-display); font-size: 1.6rem; color: var(--slate); margin-bottom: 8px; }
        .art-gate-desc { font-size: 0.9rem; color: var(--slate-soft); line-height: 1.6; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto; }
        .art-gate-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .art-gate-btn { font-size: 0.85rem; font-weight: 700; padding: 10px 22px; border-radius: 20px; text-decoration: none; transition: all 0.15s; }
        .art-gate-primary { background: var(--terracotta); color: white; }
        .art-gate-primary:hover { background: var(--terracotta-deep); }
        .art-gate-ghost { background: transparent; color: var(--slate-soft); border: 1px solid rgba(61,57,53,0.2); }

        .art-coming { text-align: center; padding: 60px 0; }
        .art-coming-icon { font-size: 2.5rem; margin-bottom: 16px; }
        .art-coming-title { font-family: var(--font-display); font-size: 1.6rem; color: var(--slate); margin-bottom: 8px; }
        .art-coming-desc { font-size: 0.9rem; color: var(--slate-ghost); }

        .art-sidebar { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 24px; }
        .art-sidebar-section { display: flex; flex-direction: column; }
        .art-sidebar-title { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--slate-ghost); margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
        .art-sidebar-list { display: flex; flex-direction: column; gap: 12px; }
        .art-sidebar-item { display: flex; gap: 12px; text-decoration: none; color: inherit; padding: 10px; border-radius: 10px; border: 1px solid var(--border); background: white; transition: all 0.15s; }
        .art-sidebar-item:hover { border-color: var(--terracotta); background: rgba(217,119,87,0.03); }
        .art-sidebar-img-wrap { flex-shrink: 0; width: 56px; height: 78px; background: rgba(217,119,87,0.07); border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .art-sidebar-img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
        .art-sidebar-ph { opacity: 0.2; color: var(--slate); }
        .art-sidebar-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 3px; }
        .art-sidebar-type { font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--terracotta); }
        .art-sidebar-name { font-family: var(--font-display); font-size: 13px; color: var(--slate); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .art-sidebar-date { font-size: 10px; color: var(--slate-ghost); }
      `}</style>

      <div className="art-wrap">
        <div className="art-layout">

          {/* ── MAIN ── */}
          <main>
            <p className="art-kicker">⭐ Player Spotlight</p>
            <h1 className="art-title">{article.title}</h1>
            {article.subtitle && <p className="art-subtitle">{article.subtitle}</p>}
            <p className="art-date">{formatDate(article.publish_date)}</p>

            {isFuture && (
              <div className="art-coming">
                <div className="art-coming-icon">⭐</div>
                <div className="art-coming-title">Coming Soon</div>
                <div className="art-coming-desc">This spotlight drops on {formatDate(article.publish_date)}.</div>
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
                      placeholder={<div className="art-ph" />}
                    />
                  ) : <div className="art-ph" />}
                </div>
                {article.excerpt && <p className="art-excerpt">{article.excerpt}</p>}
              </div>
            )}

            {!isFuture && canRead && article.body_html && (
              <div className="art-body" dangerouslySetInnerHTML={{ __html: article.body_html }} />
            )}

            {!isFuture && !canRead && !access.isAuthenticated && (
              <div className="art-gate">
                <div className="art-gate-eyebrow">Free to read</div>
                <div className="art-gate-title">Create a free account to read</div>
                <p className="art-gate-desc">Every spotlight is free with a Story account. No credit card needed.</p>
                <div className="art-gate-actions">
                  <a href="/membership" className="art-gate-btn art-gate-primary">Join free</a>
                  <a href="/login" className="art-gate-btn art-gate-ghost">Sign in</a>
                </div>
              </div>
            )}

            {!isFuture && isEarlyAccess && access.isAuthenticated && !access.hasEarlyAccess && (
              <div className="art-gate">
                <div className="art-gate-eyebrow">Chronicle · Legacy</div>
                <div className="art-gate-title">Read it 72 hours early</div>
                <p className="art-gate-desc">Chronicle and Legacy members get early access to every spotlight. Upgrade to read now.</p>
                <div className="art-gate-actions">
                  <a href="/membership" className="art-gate-btn art-gate-primary">Upgrade to Chronicle — $7/mo</a>
                </div>
              </div>
            )}
          </main>

          {/* ── SIDEBAR ── */}
          <aside className="art-sidebar">

            {/* Gallery — Chronicle+ */}
            {galleryCards.length > 0 && (
              <div className="art-sidebar-section">
                <ArticleGallery
                  cards={galleryCards}
                  isAuthenticated={access.isAuthenticated}
                  hasGalleryAccess={access.hasCelebratesGallery}
                  storageUrl={STORAGE_URL}
                  accentColor="var(--terracotta)"
                />
              </div>
            )}

            {/* More spotlights */}
            {sidebarArticles.length > 0 && (
              <div className="art-sidebar-section">
                <div className="art-sidebar-title">More Spotlights</div>
                <div className="art-sidebar-list">
                  {sidebarArticles.map((s: any) => {
                    const sf = sidebarFilenameMap[s.story_card_id ?? ""];
                    return (
                      <a key={s.ed_cal_id} href={`/spotlight/${s.slug}`} className="art-sidebar-item">
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
                          <span className="art-sidebar-type">Spotlight</span>
                          <span className="art-sidebar-name">{s.title}</span>
                          <span className="art-sidebar-date">{new Date(s.publish_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
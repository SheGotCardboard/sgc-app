import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

const STORAGE_URL = "https://smgqjzddhzcpatwwqlci.supabase.co/storage/v1/object/public/cards";

// ── Membership tier ───────────────────────────────────────────
type MemberTier = "public" | "story" | "chronicle" | "legacy";
function canAccess(userTier: MemberTier, required: MemberTier): boolean {
  const ORDER: MemberTier[] = ["public", "story", "chronicle", "legacy"];
  return ORDER.indexOf(userTier) >= ORDER.indexOf(required);
}

// ── Achievement level definitions (LOCKED) ───────────────────
const LVL2_CATEGORIES = new Set([
  "I-C","I-D","I-E","II-A","II-B","II-D",
  "III-A","III-B","III-C","III-D",
  "IV-A","IV-B","IV-C","IV-D",
  "V-A","V-B","V-C","V-D"
]);
function getAchievementLevel(tierCode: string, categoryCode: string): 1 | 2 | 3 {
  const key = `${tierCode}-${categoryCode}`;
  return LVL2_CATEGORIES.has(key) ? 2 : 3;
}

// ── Zodiac from birthdate ─────────────────────────────────────
function getZodiac(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "♈ Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "♉ Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "♊ Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "♋ Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "♌ Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "♍ Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "♎ Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "♏ Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "♐ Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "♑ Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "♒ Aquarius";
  return "♓ Pisces";
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active", retired: "Retired", college: "College",
  overseas: "Overseas", inactive: "Inactive",
};

const TIER_CLASS: Record<string, string> = {
  I: "chip-i", II: "chip-ii", III: "chip-iii", IV: "chip-iv", V: "chip-v",
};

const ED_TYPE_COLORS: Record<string, string> = {
  "player spotlight": "#d97757",
  "sgc celebrates":   "#9b88c4",
  "sgc selects":      "#34567A",
  "sgc wire":         "#4a7856",
  "collecting 101":   "#8B6914",
};

const ED_TYPE_COLORS_MUTED: Record<string, string> = {
  "player spotlight": "#c4a090",
  "sgc celebrates":   "#b8aad4",
  "sgc selects":      "#7a90a8",
  "sgc wire":         "#7a9880",
  "collecting 101":   "#a8924a",
};

export default async function PlayerSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // ── Member tier ───────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();

  let memberTier: MemberTier = "public";
  if (user) {
    const { data: subRows } = await supabase
      .from("member_subscriptions")
      .select("tier_slug")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);
    const tier = (subRows?.[0] as any)?.tier_slug as MemberTier | null;
    memberTier = tier ?? "story";
  }

  // ── 1. Player ─────────────────────────────────────────────
  const { data: playerRaw } = await supabase
    .from("player")
    .select(`
      player_id, first_name, last_name, preferred_name,
      birthdate, player_status, seo_description, slug,
      profile_card_id, card_availability,
      is_deceased, deceased_date, de_id,
      nationality,
      known_for_team:known_for_team_id ( team_name )
    `)
    .eq("slug", slug)
    .single();

  const player = playerRaw as any;
  if (!player) notFound();

  // ── 2. Team history ───────────────────────────────────────
  const { data: teamSeasonsRaw } = await supabase
    .from("player_team_season")
    .select(`
      team_season_id,
      team_season:team_season_id (
        season:season_id (
          season_year,
          league:league_id (
            league_name, abbreviation,
            sport:sport_id ( sport_name, icon )
          )
        ),
        team:team_id ( team_id, team_name, abbreviation )
      )
    `)
    .eq("player_id", player.player_id);

  const teamSeasons = (teamSeasonsRaw ?? []) as any[];
  const teams = teamSeasons.map((ts: any) => ({
    team_id:       ts.team_season?.team?.team_id ?? null,
    team_name:     ts.team_season?.team?.team_name ?? "—",
    team_abbrev:   ts.team_season?.team?.abbreviation ?? null,
    league_name:   ts.team_season?.season?.league?.league_name ?? "—",
    league_abbrev: ts.team_season?.season?.league?.abbreviation ?? null,
    season_year:   ts.team_season?.season?.season_year ?? 0,
    sport_name:    ts.team_season?.season?.league?.sport?.sport_name ?? null,
    sport_icon:    ts.team_season?.season?.league?.sport?.icon ?? null,
  })).sort((a: any, b: any) => b.season_year - a.season_year);

  const mostRecent  = teams[0] ?? null;
  const seasonCount = new Set(teams.map((t: any) => t.season_year)).size;

  const teamMap: Record<string, { league: string; abbrev: string | null; teamAbbrev: string | null; years: number[] }> = {};
  for (const t of teams) {
    const key = `${t.team_name}||${t.league_name}`;
    if (!teamMap[key]) teamMap[key] = { league: t.league_name, abbrev: t.league_abbrev, teamAbbrev: t.team_abbrev, years: [] };
    teamMap[key].years.push(t.season_year);
  }
  const byLeague: Record<string, { team: string; teamAbbrev: string | null; from: number; to: number }[]> = {};
  const leagueMeta: Record<string, { abbrev: string | null }> = {};
  for (const [key, val] of Object.entries(teamMap)) {
    const teamName = key.split("||")[0];
    val.years.sort((a, b) => a - b);
    if (!byLeague[val.league]) { byLeague[val.league] = []; leagueMeta[val.league] = { abbrev: val.abbrev }; }
    byLeague[val.league].push({ team: teamName, teamAbbrev: val.teamAbbrev, from: val.years[0], to: val.years[val.years.length - 1] });
  }
  const leagueGroups = Object.entries(byLeague)
    .sort((a, b) => Math.max(...b[1].map(t => t.to)) - Math.max(...a[1].map(t => t.to)));

  // ── 3. Teammates ──────────────────────────────────────────
  const teamSeasonIds = teamSeasons.map((ts: any) => ts.team_season_id).filter(Boolean);
  let teammates: { player_id: string; display_name: string; slug: string; years: number[] }[] = [];

  if (teamSeasonIds.length > 0) {
    const { data: teammateRaw } = await supabase
      .from("player_team_season")
      .select(`
        team_season_id,
        player:player_id (
          player_id, first_name, last_name, preferred_name, slug, is_hidden, is_excluded
        ),
        team_season:team_season_id (
          season:season_id ( season_year )
        )
      `)
      .in("team_season_id", teamSeasonIds)
      .neq("player_id", player.player_id);

    const tmRaw = (teammateRaw ?? []) as any[];
    const tmMap: Record<string, { display_name: string; slug: string; years: Set<number> }> = {};
    for (const row of tmRaw) {
      const p = row.player;
      if (!p || p.is_hidden || p.is_excluded) continue;
      const pid = p.player_id;
      const name = p.preferred_name ?? `${p.first_name} ${p.last_name}`;
      if (!tmMap[pid]) tmMap[pid] = { display_name: name, slug: p.slug, years: new Set() };
      const yr = row.team_season?.season?.season_year;
      if (yr) tmMap[pid].years.add(yr);
    }
    teammates = Object.entries(tmMap).map(([pid, val]) => ({
      player_id:    pid,
      display_name: val.display_name,
      slug:         val.slug,
      years:        [...val.years].sort((a, b) => a - b),
    })).slice(0, 12);
  }

  // ── 4. Achievement lookup tables ─────────────────────────
  const [{ data: tiersRaw }, { data: categoriesRaw }] = await Promise.all([
    supabase.from("achievement_tier").select("tier_code, tier_name, color_hex, display_order"),
    supabase.from("achievement_category").select("tier_code, category_code, category_name, display_order, icon"),
  ]);

  const tierMap: Record<string, { tier_name: string; display_color: string; sort_order: number }> =
    Object.fromEntries((tiersRaw ?? []).map((t: any) => [
      t.tier_code,
      { tier_name: t.tier_name, display_color: t.color_hex, sort_order: t.display_order }
    ]));

  const categoryMap: Record<string, { name: string; icon: string | null; display_order: number }> =
    Object.fromEntries(
      (categoriesRaw ?? []).map((c: any) => [
        `${c.tier_code}-${c.category_code}`,
        { name: c.category_name, icon: c.icon ?? null, display_order: c.display_order ?? 99 }
      ])
    );

  // ── 5. Player achievements ────────────────────────────────
  const { data: achievementsRaw } = await supabase
    .from("player_achievement")
    .select(`
      id,
      instance_number,
      year,
      context,
      achievement:achievement_id (
        achievement_id,
        achievement_name,
        tier_code,
        category_code,
        display,
        dimension
      )
    `)
    .eq("player_id", player.player_id)
    .order("instance_number", { ascending: true });

  const achievements = (achievementsRaw ?? [])
    .filter((a: any) => {
      const d = a.achievement?.display;
      return d === "full" || d === "list";
    })
    .map((a: any) => {
      const tier_code     = a.achievement?.tier_code ?? "";
      const category_code = a.achievement?.category_code ?? "";
      return {
        player_achievement_id: a.id,
        achievement_name:  a.achievement?.achievement_name ?? "—",
        tier_code,
        category_code,
        category_name:     categoryMap[`${tier_code}-${category_code}`]?.name ?? "—",
        category_icon:     categoryMap[`${tier_code}-${category_code}`]?.icon ?? null,
        category_sort:     categoryMap[`${tier_code}-${category_code}`]?.display_order ?? 99,
        tier_name:         tierMap[tier_code]?.tier_name ?? "—",
        tier_sort:         tierMap[tier_code]?.sort_order ?? 99,
        display_color:     tierMap[tier_code]?.display_color ?? "#888",
        instance_number:   a.instance_number,
        year:              a.year ?? null,
        context:           a.context ?? null,
        level:             getAchievementLevel(tier_code, category_code),
        dimension:         a.achievement?.dimension ?? null,
      };
    }) as any[];

  type AchRow = typeof achievements[0];
  const tierGroups: Record<string, {
    tier_name: string; display_color: string; tier_sort: number;
    categories: Record<string, AchRow[]>;
  }> = {};
  for (const a of achievements) {
    if (!tierGroups[a.tier_code]) {
      tierGroups[a.tier_code] = { tier_name: a.tier_name, display_color: a.display_color, tier_sort: a.tier_sort, categories: {} };
    }
    if (!tierGroups[a.tier_code].categories[a.category_name]) {
      tierGroups[a.tier_code].categories[a.category_name] = [];
    }
    tierGroups[a.tier_code].categories[a.category_name].push(a);
  }
  const sortedTiers = Object.entries(tierGroups).sort((a, b) => a[1].tier_sort - b[1].tier_sort);

  function groupAchievementRows(rows: any[]): any[] {
    const grouped: Record<string, any> = {};
    for (const row of rows) {
      const key = row.achievement_id ?? row.achievement_name;
      if (!grouped[key]) {
        grouped[key] = { ...row, years: row.year ? [row.year] : [] };
      } else {
        if (row.year && !grouped[key].years.includes(row.year)) {
          grouped[key].years.push(row.year);
        }
        if (row.context) grouped[key].context = row.context;
      }
    }
    return Object.values(grouped).map(r => ({
      ...r,
      years: r.years.sort((a: number, b: number) => a - b),
    }));
  }

  const dimensionCounts: Record<string, number> = {};
  for (const a of achievements) {
    if (a.dimension) {
      dimensionCounts[a.dimension] = (dimensionCounts[a.dimension] ?? 0) + 1;
    }
  }
  const dominantDimension = Object.entries(dimensionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const DIM_COLORS: Record<string, string> = {
    Champion: "#B5333E",
    Pioneer:  "#1A7A6D",
    Legend:   "#6B3A7A",
    Advocate: "#B57A14",
    Sage:     "#3A4A8B",
    Muse:     "#D4622A",
  };

  // Fix: category_sort included in type
  const chipMap: Record<string, { tier_code: string; display_color: string; category_name: string; count: number; tier_sort: number; category_sort: number }> = {};
  for (const a of achievements) {
    const key = `${a.tier_code}-${a.category_code}`;
    if (!chipMap[key]) chipMap[key] = { tier_code: a.tier_code, display_color: a.display_color, category_name: a.category_name, tier_sort: a.tier_sort, category_sort: a.category_sort, count: 0 };
    chipMap[key].count += 1;
  }
  const chips = Object.values(chipMap).sort((a, b) => a.tier_sort - b.tier_sort);

  // ── 6. SGC Editorials ─────────────────────────────────────
  const [{ data: primaryEditorialsRaw }, { data: mentionedEditorialsRaw }] = await Promise.all([
    supabase
      .from("ed_calendar")
      .select(`ed_cal_id, title, slug, publish_date, is_hidden, ed_type:ed_type_id ( label )`)
      .eq("subject_id", player.player_id)
      .eq("is_hidden", false)
      .order("publish_date", { ascending: false }),
    supabase
      .from("ed_subjects")
      .select(`editorial:ed_cal_id ( ed_cal_id, title, slug, publish_date, is_hidden, ed_type:ed_type_id ( label ) )`)
      .eq("subject_id", player.player_id)
      .eq("ed_rel_type_id", "1b1d33d3-7d15-4d15-9928-61c66602bd56")
      .order("created_at", { ascending: false }),
  ]);

  const editorials = (primaryEditorialsRaw ?? []).map((e: any) => ({
    title: e.title, slug: e.slug, type_name: e.ed_type?.label ?? "feature",
  }));
  const editorialsMentioned = (mentionedEditorialsRaw ?? [])
    .filter((e: any) => e.editorial && !e.editorial.is_hidden)
    .map((e: any) => ({
      title: e.editorial.title, slug: e.editorial.slug, type_name: e.editorial.ed_type?.label ?? "feature",
    }));
  const allEditorials = [...editorials, ...editorialsMentioned];

  // ── 7. Profile card ───────────────────────────────────────
  const { data: cardRaw } = player.profile_card_id
    ? await supabase.from("card").select("card_id, filename, card_number").eq("card_id", player.profile_card_id).single()
    : { data: null };
  const card = cardRaw as any;

  let cardFilename: string;
  if (card?.filename) {
    cardFilename = card.filename;
  } else if (player.card_availability) {
    const { data: lkpRaw } = await supabase.from("card_availability_lkp").select("de_id").eq("value", player.card_availability).single();
    const lkp = lkpRaw as any;
    cardFilename = lkp?.de_id ? `${lkp.de_id.toLowerCase()}.webp` : "pca_null.webp";
  } else {
    cardFilename = "pca_null.webp";
  }

  const cardImageSrc = `${STORAGE_URL}/${cardFilename}`;
  const hasRealCard  = !!card?.filename;

  // ── 8. Card gallery ───────────────────────────────────────
  const { data: galleryRaw } = await supabase
    .from("player_card_gallery")
    .select(`sort_order, card:card_id ( card_id, filename, set_name )`)
    .eq("player_id", player.player_id)
    .order("sort_order", { ascending: true })
    .limit(12);
  const galleryCards = (galleryRaw ?? []) as any[];

  // ── Derived values ────────────────────────────────────────
  const displayName  = player.preferred_name ?? `${player.first_name} ${player.last_name}`;
  const isDeceased   = player.is_deceased ?? false;
  const statusLabel  = isDeceased ? "Deceased" : STATUS_LABELS[player.player_status] ?? player.player_status;
  const zodiac       = getZodiac(player.birthdate);
  const canChronicle = canAccess(memberTier, "chronicle");
  const canLegacy    = canAccess(memberTier, "legacy");

  // ── Pantheon summary ──────────────────────────────────────
  const { data: pantheonRaw } = await supabase
    .from("pantheon_player_summary")
    .select("is_panthelete, total_score, dominant_dimension")
    .eq("player_id", player.player_id)
    .limit(1);
  const pantheon = (pantheonRaw as any)?.[0] ?? null;
  const isPanthelete = (pantheon as any)?.is_panthelete ?? false;
  const hasScore = pantheon !== null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const heroMeta: string[] = [];
  const knownForTeam = player.known_for_team?.team_name ?? mostRecent?.team_name ?? null;
  if (knownForTeam) heroMeta.push(knownForTeam);
  if (teams.length > 0) {
    const minYear = Math.min(...teams.map((t: any) => t.season_year));
    const maxYear = Math.max(...teams.map((t: any) => t.season_year));
    heroMeta.push(minYear === maxYear ? String(minYear) : `${minYear}–${maxYear}`);
  }
  heroMeta.push(statusLabel);

  return (
    <div className="sgc-page">
      <Nav activePage="players" />
      <style>{`
        .pp-wrap { max-width: 1100px; margin: 0 auto; padding: 0 0 80px; }
        .pp-back { font-size: 0.8rem; color: var(--slate-ghost); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; padding: 24px 32px 16px; transition: color 0.15s; }
        .pp-back:hover { color: var(--terracotta); }
        .player-page { background: var(--warm-white); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .pp-hero { background: linear-gradient(135deg, var(--slate) 0%, #4a4540 100%); padding: 32px 36px; color: white; display: flex; align-items: center; gap: 24px; position: relative; overflow: hidden; }
        .pp-hero::after { content: ''; position: absolute; right: -40px; top: -40px; width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(217,119,87,0.15) 0%, transparent 70%); pointer-events: none; }
        .pp-avatar { width: 88px; height: 88px; border-radius: 50%; background: var(--parchment); border: 3px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 36px; flex-shrink: 0; z-index: 1; overflow: hidden; }
        .pp-avatar img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
        .pp-hero-info { flex: 1; z-index: 1; }
        .pp-name { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.6rem); line-height: 1.1; margin-bottom: 6px; }
        .pp-hero-meta { font-size: 13px; color: rgba(255,255,255,0.55); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .pp-hero-dot { opacity: 0.4; }
        .pp-hero-stats { display: flex; gap: 28px; z-index: 1; flex-shrink: 0; }
        .pp-stat { text-align: center; }
        .pp-stat-num { font-family: var(--font-display); font-size: 28px; color: var(--terracotta); line-height: 1; }
        .pp-stat-label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-top: 4px; }
        @media (max-width: 600px) { .pp-hero { flex-direction: column; align-items: flex-start; } .pp-hero-stats { gap: 16px; } }
        .pp-section { padding: 24px 32px; border-bottom: 1px solid var(--border); }
        .pp-section:last-child { border-bottom: none; }
        .pp-section-label { font-size: 9px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--slate-ghost); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .pp-section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .bio-grid { display: grid; grid-template-columns: 160px 1fr 220px; gap: 24px; align-items: start; }
        @media (max-width: 800px) { .bio-grid { grid-template-columns: 1fr; } }
        .profile-card { width: 160px; height: 224px; border-radius: 10px; background: linear-gradient(160deg, var(--parchment) 0%, #ddd4c4 100%); border: 1px solid var(--border-strong); box-shadow: 0 4px 16px rgba(0,0,0,0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; position: relative; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .profile-card:hover { transform: translateY(-3px) rotate(0.5deg); box-shadow: 0 8px 24px rgba(0,0,0,0.16); }
        .profile-card img { width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 10px; }
        .profile-card-set { position: absolute; bottom: 0; left: 0; right: 0; text-align: center; font-size: 8px; font-weight: 700; color: var(--slate-soft); background: rgba(250,248,245,0.9); padding: 5px 4px; border-top: 1px solid rgba(224,216,208,0.6); line-height: 1.3; }
        .bio-text { font-size: 13px; color: var(--slate-soft); line-height: 1.8; }
        .demo-card { background: var(--soft-cream); border-radius: 10px; padding: 12px 16px; border: 1px solid var(--border); }
        .demo-row { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; border-bottom: 1px solid rgba(224,216,208,0.5); gap: 8px; }
        .demo-row:last-child { border-bottom: none; }
        .demo-key { font-size: 9px; font-weight: 700; color: var(--slate-ghost); text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0; }
        .demo-val { font-size: 12px; font-weight: 600; color: var(--slate); text-align: right; }
        .ed-links { display: flex; flex-direction: column; gap: 6px; }
        .ed-link { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; background: var(--soft-cream); cursor: pointer; transition: background 0.12s, transform 0.1s; text-decoration: none; }
        .ed-link:hover { background: var(--parchment); transform: translateX(3px); }
        .ed-type { font-size: 9px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; color: white; flex-shrink: 0; }
        .ed-title { font-size: 13px; font-weight: 600; color: var(--slate); flex: 1; }
        .ed-arrow { font-size: 12px; color: var(--slate-ghost); }
        .career-block { margin-bottom: 8px; }
        .career-team-hdr { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; background: var(--soft-cream); }
        .ct-abbr { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; background: var(--terracotta); color: white; min-width: 40px; text-align: center; }
        .ct-name { font-size: 13px; font-weight: 700; color: var(--slate); flex: 1; }
        .ct-years { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--slate-soft); }
        .ct-seasons { font-size: 11px; color: var(--slate-ghost); }
        .ct-teammates { padding: 8px 14px 8px 62px; display: flex; flex-wrap: wrap; gap: 5px; }
        .teammate { font-size: 10px; font-weight: 600; color: var(--slate-soft); background: white; padding: 3px 10px; border-radius: 16px; border: 1px solid var(--border); cursor: pointer; transition: all 0.12s; display: inline-flex; align-items: center; gap: 4px; text-decoration: none; }
        .teammate:hover { border-color: var(--terracotta); color: var(--terracotta); }
        .teammate-yrs { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--slate-ghost); }
        .card-gallery { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-start; }
        .card-stub { width: 88px; height: 123px; border-radius: 8px; background: linear-gradient(160deg, var(--parchment) 0%, #ddd4c4 100%); border: 1px solid var(--border-strong); display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.15s, box-shadow 0.15s; overflow: hidden; flex-shrink: 0; }
        .card-stub img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
        .card-stub:hover { transform: translateY(-4px) rotate(0.5deg); box-shadow: 0 8px 18px rgba(0,0,0,0.13); }
        .card-stub-label { position: absolute; bottom: 0; left: 0; right: 0; font-size: 7px; font-weight: 700; color: var(--slate-soft); text-align: center; background: rgba(250,248,245,0.9); padding: 3px 4px; border-top: 1px solid rgba(224,216,208,0.6); line-height: 1.3; }
        .card-stub.blurred { filter: blur(5px); cursor: default; }
        .card-stub.blurred:hover { transform: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .gallery-upgrade { width: 160px; height: 123px; border-radius: 8px; background: var(--soft-cream); border: 1px dashed var(--border-strong); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 12px; text-align: center; flex-shrink: 0; }
        .gallery-upgrade-tier { font-size: 8px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--slate-ghost); }
        .gallery-upgrade-title { font-family: var(--font-display); font-size: 13px; color: var(--slate); line-height: 1.2; }
        .gallery-upgrade-desc { font-size: 9px; color: var(--slate-soft); line-height: 1.4; }
        .gallery-upgrade-btn { font-size: 9px; font-weight: 800; padding: 5px 12px; border-radius: 20px; background: #9b88c4; color: white; text-decoration: none; display: inline-block; }
        .ach-intro { font-size: 12px; color: var(--slate-soft); line-height: 1.6; margin-bottom: 16px; padding: 10px 14px; border-radius: 8px; background: var(--soft-cream); border-left: 3px solid #34567A; }
        .ach-intro strong { color: var(--slate); }
        .ach-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 16px; }
        .ach-chip { font-size: 10px; font-weight: 700; padding: 3px 9px 3px 7px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; cursor: default; }
        .chip-i{background:#F2E3EB;color:#8B2252;border:1px solid rgba(139,34,82,0.2);}
        .chip-ii{background:#E2EAF2;color:#34567A;border:1px solid rgba(52,86,122,0.2);}
        .chip-iii{background:#DFF0ED;color:#1A7A6D;border:1px solid rgba(26,122,109,0.2);}
        .chip-iv{background:#F2ECDA;color:#8B6914;border:1px solid rgba(139,105,20,0.2);}
        .chip-v{background:#EDF0E2;color:#6B7A3A;border:1px solid rgba(107,122,58,0.2);}
        .chip-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
        .dot-i{background:#8B2252;}.dot-ii{background:#34567A;}.dot-iii{background:#1A7A6D;}.dot-iv{background:#8B6914;}.dot-v{background:#6B7A3A;}
        .chip-count{font-weight:800;}
        .tier-groups { display: flex; flex-direction: column; gap: 6px; }
        .tier-group { border-radius: 10px; border: 1px solid var(--border); overflow: hidden; }
        .tier-hdr { padding: 12px 16px; display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; background: var(--warm-white); transition: background 0.1s; }
        .tier-hdr:hover { background: var(--soft-cream); }
        .tier-badge { font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; color: white; min-width: 28px; text-align: center; letter-spacing: 0.03em; }
        .b-i{background:#8B2252;}.b-ii{background:#34567A;}.b-iii{background:#1A7A6D;}.b-iv{background:#8B6914;}.b-v{background:#6B7A3A;}
        .tier-name { font-family: var(--font-display); font-size: 14px; flex: 1; color: var(--slate); }
        .tier-count { font-size: 10px; font-weight: 700; color: var(--slate-soft); background: var(--soft-cream); padding: 2px 8px; border-radius: 10px; }
        .tier-chev { font-size: 12px; color: var(--slate-ghost); transition: transform 0.2s; }
        .tier-body { border-top: 1px solid var(--border); }
        .cat-hdr { padding: 10px 16px 4px; font-size: 9px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--slate-ghost); border-top: 1px solid rgba(224,216,208,0.4); }
        .cat-hdr:first-child { border-top: none; }
        .honor-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border-top: 1px solid rgba(224,216,208,0.25); transition: background 0.1s; }
        .honor-row:hover { background: rgba(0,0,0,0.012); }
        .honor-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; margin-top: 2px; }
        .ic-i{background:#F2E3EB;}.ic-ii{background:#E2EAF2;}.ic-iii{background:#DFF0ED;}.ic-iv{background:#F2ECDA;}.ic-v{background:#EDF0E2;}
        .honor-info { flex: 1; min-width: 0; }
        .honor-name { font-size: 14px; font-weight: 600; color: var(--slate); line-height: 1.3; }
        .honor-sub { font-size: 11px; color: var(--slate-soft); margin-top: 2px; letter-spacing: 0.01em; }
        .honor-years { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 6px; }
        .yr { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }
        .yr-i{background:#F2E3EB;color:#8B2252;}.yr-ii{background:#E2EAF2;color:#34567A;}
        .yr-iii{background:#DFF0ED;color:#1A7A6D;}.yr-iv{background:#F2ECDA;color:#8B6914;}.yr-v{background:#EDF0E2;color:#6B7A3A;}
        .honor-locked-row { padding: 9px 16px; border-top: 1px solid rgba(224,216,208,0.25); display: flex; align-items: center; gap: 8px; opacity: 0.6; cursor: pointer; }
        .honor-locked-row:hover { opacity: 0.9; }
        .honor-locked-icon { font-size: 12px; }
        .honor-locked-text { font-size: 11px; color: var(--slate-soft); flex: 1; font-style: italic; }
        .honor-locked-cta { font-size: 9px; font-weight: 800; color: #8B2252; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; text-decoration: none; }
        .ach-upgrade { padding: 24px; border-radius: 10px; background: var(--soft-cream); border: 1px solid var(--border); text-align: center; margin-top: 4px; }
        .ach-upgrade-tier { font-size: 9px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--slate-ghost); margin-bottom: 8px; }
        .ach-upgrade-title { font-family: var(--font-display); font-size: 20px; color: var(--slate); margin-bottom: 8px; }
        .ach-upgrade-desc { font-size: 13px; color: var(--slate-soft); line-height: 1.6; margin-bottom: 16px; }
        .ach-upgrade-btn { display: inline-block; padding: 9px 22px; border-radius: 9px; background: #34567A; color: white; font-size: 12px; font-weight: 800; text-decoration: none; }
        .dim-inner { padding: 18px 20px; border-radius: 12px; background: var(--soft-cream); border: 1px solid var(--border); }
        .dim-intro { font-size: 13px; color: var(--slate-soft); line-height: 1.75; margin-bottom: 14px; }
        .dim-statements { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
        .dim-stmt { display: flex; align-items: flex-start; gap: 10px; font-size: 12px; color: var(--slate-soft); line-height: 1.55; }
        .dim-stmt-name { font-size: 9px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 9px; border-radius: 10px; color: white; flex-shrink: 0; margin-top: 1px; min-width: 70px; text-align: center; }
        .dc-champion{background:#B5333E;}.dc-pioneer{background:#1A7A6D;}.dc-legend{background:#6B3A7A;}
        .dc-advocate{background:#B57A14;}.dc-sage{background:#3A4A8B;}.dc-muse{background:#D4622A;}
        .dim-locked { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--slate-ghost); padding-top: 12px; border-top: 1px solid var(--border); }
        @media (max-width: 768px) { .pp-section { padding: 20px; } .bio-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="pp-wrap">
        <a href="/player" className="pp-back">← Player Directory</a>

        <div className="player-page">

          {/* ── 1. HERO ── */}
          <div className="pp-hero">
            <div className="pp-avatar">
              <span>{mostRecent?.sport_icon ?? "🏅"}</span>
            </div>
            <div className="pp-hero-info">
              <div className="pp-name">{displayName}</div>
              <div className="pp-hero-meta">
                {heroMeta.map((item, i) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {i > 0 && <span className="pp-hero-dot">·</span>}
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="pp-hero-stats">
              <div className="pp-stat">
                <div className="pp-stat-num">{achievements.length}</div>
                <div className="pp-stat-label">Achievements</div>
              </div>
              {seasonCount > 0 && (
                <div className="pp-stat">
                  <div className="pp-stat-num">{seasonCount}</div>
                  <div className="pp-stat-label">Seasons</div>
                </div>
              )}
              {allEditorials.length > 0 && (
                <div className="pp-stat">
                  <div className="pp-stat-num">{allEditorials.length}</div>
                  <div className="pp-stat-label">Editorials</div>
                </div>
              )}
            </div>
            {isPanthelete ? (
              <a href={`/pantheon?player=${player.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#e8b44c", textDecoration: "none", padding: "5px 14px", border: "1px solid rgba(232,180,76,0.35)", borderRadius: 20, background: "rgba(232,180,76,0.08)", marginTop: 8, zIndex: 1 }}>
                ★ View Pantheon Profile →
              </a>
            ) : canLegacy ? (
              <a href={`/pantheon?player=${player.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "5px 14px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, marginTop: 8, zIndex: 1 }}>
                ★ Pantheon →
              </a>
            ) : null}
          </div>

          {/* ── 2. ABOUT ── */}
          <div className="pp-section">
            <div className="pp-section-label">About</div>
            <div className="bio-grid">
              <div className="profile-card">
                <img src={cardImageSrc} alt={displayName} />
                {hasRealCard && card?.card_number && (
                  <div className="profile-card-set">#{card.card_number}</div>
                )}
              </div>
              {player.seo_description && (
                <div className="bio-text">{player.seo_description}</div>
              )}
              <div className="demo-card">
                {player.birthdate && (
                  <div className="demo-row">
                    <span className="demo-key">Born</span>
                    <span className="demo-val">{formatDate(player.birthdate)}</span>
                  </div>
                )}
                {isDeceased && player.deceased_date && (
                  <div className="demo-row">
                    <span className="demo-key">Died</span>
                    <span className="demo-val">{formatDate(player.deceased_date)}</span>
                  </div>
                )}
                {player.nationality && (
                  <div className="demo-row">
                    <span className="demo-key">Nationality</span>
                    <span className="demo-val">{player.nationality}</span>
                  </div>
                )}
                {zodiac && (
                  <div className="demo-row">
                    <span className="demo-key">Zodiac</span>
                    <span className="demo-val">{zodiac}</span>
                  </div>
                )}
                <div className="demo-row">
                  <span className="demo-key">Status</span>
                  <span className="demo-val">{statusLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. SGC EDITORIALS ── */}
          {allEditorials.length > 0 && (
            <div className="pp-section">
              <div className="pp-section-label">SGC Editorials</div>
              {editorials.length > 0 && (
                <div className="ed-links">
                  {editorials.map((ed: any, i: number) => (
                    <a key={i} href={`/editorial/${ed.slug}`} className="ed-link">
                      <span className="ed-type" style={{ background: ED_TYPE_COLORS[ed.type_name?.toLowerCase()] ?? "#8a8580" }}>{ed.type_name ?? "Editorial"}</span>
                      <span className="ed-title">{ed.title}</span>
                      <span className="ed-arrow">→</span>
                    </a>
                  ))}
                </div>
              )}
              {editorialsMentioned.length > 0 && (
                <div style={{ marginTop: editorials.length > 0 ? "12px" : "0" }}>
                  <div style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate-ghost)", marginBottom: "6px" }}>Also mentioned in</div>
                  <div className="ed-links">
                    {editorialsMentioned.map((ed: any, i: number) => (
                      <a key={i} href={`/editorial/${ed.slug}`} className="ed-link" style={{ opacity: 0.75 }}>
                        <span className="ed-type" style={{ background: ED_TYPE_COLORS_MUTED[ed.type_name?.toLowerCase()] ?? "#a8a49f" }}>{ed.type_name ?? "Editorial"}</span>
                        <span className="ed-title">{ed.title}</span>
                        <span className="ed-arrow">→</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 4. CAREER HISTORY ── */}
          {leagueGroups.length > 0 && (
            <div className="pp-section">
              <div className="pp-section-label">Career History</div>
              {leagueGroups.map(([league, leagueTeams], i) => (
                <div key={i} className="career-block">
                  {leagueTeams.map((t, j) => {
                    const yearsSpan  = t.from === t.to ? String(t.from) : `${t.from}–${t.to}`;
                    const numSeasons = t.to - t.from + 1;
                    const teamMates  = teammates.filter(tm => tm.years.some(y => y >= t.from && y <= t.to));
                    return (
                      <div key={j}>
                        <div className="career-team-hdr">
                          <span className="ct-abbr">{t.teamAbbrev ?? leagueMeta[league]?.abbrev ?? league.slice(0,4).toUpperCase()}</span>
                          <span className="ct-name">{t.team}</span>
                          <span className="ct-years">{yearsSpan}</span>
                          <span className="ct-seasons">{numSeasons} {numSeasons === 1 ? "season" : "seasons"}</span>
                        </div>
                        {teamMates.length > 0 && (
                          <div className="ct-teammates">
                            {teamMates.map((tm, k) => {
                              const overlapping = tm.years.filter(y => y >= t.from && y <= t.to);
                              const minY = Math.min(...overlapping);
                              const maxY = Math.max(...overlapping);
                              const yLabel = minY === maxY ? String(minY).slice(2) : `${String(minY).slice(2)}–${String(maxY).slice(2)}`;
                              return (
                                <a key={k} href={`/player/${tm.slug}`} className="teammate">
                                  {tm.display_name}
                                  <span className="teammate-yrs">{yLabel}</span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* ── 5. CARD GALLERY ── */}
          {galleryCards.length > 0 && (
            <div className="pp-section">
              <div className="pp-section-label">Card Gallery · Editorially Chosen</div>
              <div className="card-gallery">
                {canChronicle ? (
                  galleryCards.map((g: any, i: number) => (
                    <div key={i} className="card-stub">
                      {g.card?.filename ? <img src={`${STORAGE_URL}/${g.card.filename}`} alt={g.card.set_name ?? "Card"} /> : <span>🃏</span>}
                      {g.card?.set_name && <div className="card-stub-label">{g.card.set_name}</div>}
                    </div>
                  ))
                ) : (
                  <>
                    {galleryCards.slice(0, 3).map((g: any, i: number) => (
                      <div key={i} className="card-stub blurred">
                        {g.card?.filename ? <img src={`${STORAGE_URL}/${g.card.filename}`} alt="Card preview" /> : <span>🃏</span>}
                      </div>
                    ))}
                    <div className="gallery-upgrade">
                      <div className="gallery-upgrade-tier">Chronicle · Legacy</div>
                      <div className="gallery-upgrade-title">Full card gallery</div>
                      <div className="gallery-upgrade-desc">See every card in this gallery — Chronicle members unlock the full set.</div>
                      <a href="/membership" className="gallery-upgrade-btn">Upgrade to Chronicle →</a>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── 6. ACHIEVEMENTS ── */}
          {achievements.length > 0 && (
            <div className="pp-section">
              <div className="pp-section-label">Achievements</div>
              {canChronicle ? (
                <>
                  <div className="ach-intro">
                    <strong>The Chronicle</strong> — all achievements by tier with years and detail.{" "}
                    <strong>The Legacy</strong> adds Achievements Level 3: the full dossier including All-Star selections, cultural honors, media presence, and more.
                  </div>
                  <div className="tier-groups">
                    {sortedTiers.map(([tierCode, tierData]) => {
                      const allCats     = Object.entries(tierData.categories);
                      const lvl3Cats    = allCats.filter(([, rows]) => rows.some((r: any) => r.level === 3)).map(([cat]) => cat);
                      const visibleCats = allCats.filter(([, rows]) => rows.some((r: any) => r.level <= (canLegacy ? 3 : 2)));
                      const totalCount  = Object.values(tierData.categories).flat().length;
                      const tcl = tierCode.toLowerCase();
                      return (
                        <details key={tierCode} className="tier-group" open>
                          <summary className="tier-hdr" style={{ listStyle: "none" }}>
                            <span className={`tier-badge b-${tcl}`}>{tierCode}</span>
                            <span className="tier-name">{tierData.tier_name}</span>
                            <span className="tier-count">{totalCount}</span>
                            <span className="tier-chev">▾</span>
                          </summary>
                          <div className="tier-body">
                            {visibleCats
                              .sort((a, b) => ((a[1][0] as any)?.category_sort ?? 99) - ((b[1][0] as any)?.category_sort ?? 99))
                              .map(([catName, rows]) => {
                                const catIcon      = (rows[0] as any)?.category_icon ?? null;
                                const filteredRows = (rows as any[]).filter((r: any) => r.level <= 2 || canLegacy);
                                const grouped      = groupAchievementRows(filteredRows);
                                return (
                                  <div key={catName}>
                                    <div className="cat-hdr">{catName}</div>
                                    {grouped.map((a: any, i: number) => (
                                      <div key={i} className="honor-row">
                                        {catIcon && <div className={`honor-icon ic-${tcl}`}>{catIcon}</div>}
                                        <div className="honor-info">
                                          <div className="honor-name">{a.achievement_name}</div>
                                          {a.context && <div className="honor-sub">{a.context.replace(/\s*\(\d{4}\)$/, "").trim()}</div>}
                                          {a.years?.length > 0 && (
                                            <div className="honor-years">
                                              {a.years.map((yr: number) => (
                                                <span key={yr} className={`yr yr-${tcl}`}>{yr}</span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            {!canLegacy && lvl3Cats.length > 0 && (
                              <div className="honor-locked-row">
                                <span className="honor-locked-icon">🔒</span>
                                <span className="honor-locked-text">{lvl3Cats.join(" · ")} — full detail available with The Legacy</span>
                                <a href="/membership" className="honor-locked-cta">Upgrade →</a>
                              </div>
                            )}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="ach-chips">
                    {chips.map((chip: any, i: number) => (
                      <span key={i} className={`ach-chip ${TIER_CLASS[chip.tier_code] ?? ""}`}>
                        <span className={`chip-dot dot-${chip.tier_code.toLowerCase()}`} />
                        {chip.count > 1 && <span className="chip-count">{chip.count}×&nbsp;</span>}
                        {chip.category_name}
                      </span>
                    ))}
                  </div>
                  <div className="ach-upgrade">
                    <div className="ach-upgrade-tier">Chronicle · Legacy</div>
                    <div className="ach-upgrade-title">Full Achievements Panel</div>
                    <div className="ach-upgrade-desc">
                      All achievements grouped by tier with years and detail.<br />
                      The Legacy adds the complete dossier — All-Star selections, cultural honors, and more.
                    </div>
                    <a href="/membership" className="ach-upgrade-btn">Upgrade to The Chronicle →</a>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── 7. DIMENSION PROFILE ── */}
          <div className="pp-section">
            <div className="pp-section-label">Dimension Profile</div>
            <div className="dim-inner">
              <p className="dim-intro">
                Every player in the SGC database is evaluated across six dimensions of impact —
                Champion, Pioneer, Legend, Advocate, Sage, and Muse. These dimensions capture
                the full arc of a player's significance: on the court and beyond it. A player's
                dimension profile tells the story that statistics alone cannot.
              </p>
              <div className="dim-statements">
                {[
                  { name: "Champion", cls: "dc-champion", desc: "Competitive excellence — championships, medals, and sustained on-court dominance." },
                  { name: "Pioneer",  cls: "dc-pioneer",  desc: "Barrier-breaking and systemic firsts — opening doors that had never been opened." },
                  { name: "Legend",   cls: "dc-legend",   desc: "Historical immortality — Hall of Fame, naming honors, all-time selections." },
                  { name: "Advocate", cls: "dc-advocate", desc: "Service, character, and fighting for something beyond the game." },
                  { name: "Sage",     cls: "dc-sage",     desc: "Coaching, leadership, and shaping the game after playing it." },
                  { name: "Muse",     cls: "dc-muse",     desc: "Cultural presence, media impact, and inspiring the world beyond sport." },
                ].map(d => (
                  <div key={d.name} className="dim-stmt">
                    <span className={`dim-stmt-name ${d.cls}`}>{d.name}</span>
                    {d.desc}
                  </div>
                ))}
              </div>
              {canAccess(memberTier, "story") ? (
                <div className="dim-locked" style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "13px", color: "var(--slate-soft)" }}>★ <strong>Dominant Dimension</strong></span>
                  {dominantDimension ? (
                    <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 12px", borderRadius: "12px", background: DIM_COLORS[dominantDimension] ?? "#888", color: "white" }}>
                      {dominantDimension}
                    </span>
                  ) : (
                    <span style={{ fontSize: "12px", color: "var(--slate-ghost)", fontStyle: "italic" }}>scoring in progress</span>
                  )}
                  {!canChronicle && dominantDimension && (
                    <span style={{ fontSize: "11px", color: "var(--slate-ghost)" }}>Full breakdown with <strong style={{ color: "#34567A" }}>The Chronicle</strong></span>
                  )}
                </div>
              ) : (
                <div className="dim-locked">
                  <span>🔒</span>
                  <span>Dominant Dimension revealed at <strong style={{ color: "#34567A" }}>The Story</strong></span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
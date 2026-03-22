import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

const STORAGE_URL = "https://smgqjzddhzcpatwwqlci.supabase.co/storage/v1/object/public/cards";

export default async function PlayerSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch player
  const { data: playerRaw } = await supabase
    .from("player")
    .select("player_id, first_name, last_name, preferred_name, birthdate, player_status, seo_description, slug, profile_card_id, is_deceased, deceased_date, de_id")
    .eq("slug", slug)
    .single();

  const player = playerRaw as any;
  if (!player) notFound();

  // Fetch team/league/sport history
  const { data: teamSeasonsRaw } = await supabase
    .from("player_team_season")
    .select(`
      player_id,
      team_season:team_season_id (
        season:season_id (
          season_year,
          league:league_id ( league_name, abbreviation, sport:sport_id ( sport_name, icon ) )
        ),
        team:team_id ( team_name )
      )
    `)
    .eq("player_id", player.player_id);

  const teamSeasons = (teamSeasonsRaw ?? []) as any[];

  const teams = teamSeasons.map((ts: any) => ({
    team_name: ts.team_season?.team?.team_name ?? "—",
    league_name: ts.team_season?.season?.league?.league_name ?? "—",
    league_abbrev: ts.team_season?.season?.league?.abbreviation ?? null,
    season_year: ts.team_season?.season?.season_year ?? 0,
    sport_name: ts.team_season?.season?.league?.sport?.sport_name ?? null,
    sport_icon: ts.team_season?.season?.league?.sport?.icon ?? null,
  })).sort((a: any, b: any) => b.season_year - a.season_year);

  const mostRecent = teams[0] ?? null;

  // Fetch honors
  const { data: honorsRaw } = await supabase
    .from("player_honor")
    .select(`
      honor:honor_id (
        honor_name,
        honor_short_name,
        honor_code,
        icon,
        category:category_id ( value )
      )
    `)
    .eq("player_id", player.player_id);

  const honors = ((honorsRaw ?? []) as any[]).map((h: any) => ({
    honor_name: h.honor?.honor_name ?? "—",
    honor_short_name: h.honor?.honor_short_name ?? null,
    honor_code: h.honor?.honor_code ?? "",
    category_value: h.honor?.category?.value ?? "",
    icon: h.honor?.icon ?? null,
  })).filter((h: any, i: number, arr: any[]) =>
    arr.findIndex((x: any) => x.honor_code === h.honor_code) === i
  );

  // Fetch card image
  const { data: cardRaw } = player.profile_card_id
    ? await supabase.from("card").select("card_id, filename").eq("card_id", player.profile_card_id).single()
    : { data: null };
  const card = cardRaw as any;

  // Group teams by league
  const byLeague: Record<string, { team: string; from: number; to: number }[]> = {};
  const leagueMeta: Record<string, { abbrev: string | null }> = {};
  const teamMap: Record<string, { league: string; abbrev: string | null; years: number[] }> = {};

  for (const t of teams) {
    const key = `${t.team_name}||${t.league_name}`;
    if (!teamMap[key]) teamMap[key] = { league: t.league_name, abbrev: t.league_abbrev, years: [] };
    teamMap[key].years.push(t.season_year);
  }
  for (const [key, val] of Object.entries(teamMap)) {
    const teamName = key.split("||")[0];
    val.years.sort((a, b) => a - b);
    if (!byLeague[val.league]) { byLeague[val.league] = []; leagueMeta[val.league] = { abbrev: val.abbrev }; }
    byLeague[val.league].push({ team: teamName, from: val.years[0], to: val.years[val.years.length - 1] });
  }
  const leagueGroups = Object.entries(byLeague)
    .sort((a, b) => Math.max(...b[1].map(t => t.to)) - Math.max(...a[1].map(t => t.to)))
    .slice(0, 3);

  const displayName = player.preferred_name ?? `${player.first_name} ${player.last_name}`;

  const formatBirthdate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });

  return (
    <div className="sgc-page">
      <Nav activePage="players" />
      <style>{`
        .pp-wrap { max-width: 1100px; margin: 0 auto; padding: 56px 48px; }
        @media (max-width: 768px) { .pp-wrap { padding: 40px 24px; } }

        .pp-back { font-size: 0.8rem; color: var(--slate-ghost); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 32px; transition: color 0.15s; }
        .pp-back:hover { color: var(--terracotta); }

        .pp-layout { display: grid; grid-template-columns: 200px 1fr; gap: 40px; align-items: start; }
        @media (max-width: 700px) { .pp-layout { grid-template-columns: 1fr; } }

        /* Card image */
        .pp-card-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .pp-card-img { width: 160px; height: 224px; object-fit: cover; object-position: center top; border-radius: 10px; box-shadow: 0 8px 24px rgba(61,57,53,0.18); }
        .pp-card-ph { width: 160px; height: 224px; background: #f5f0e8; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .pp-status-badge { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; background: #f5f0e8; color: var(--slate-soft); border: 1px solid rgba(61,57,53,0.12); }

        /* Details */
        .pp-details { display: flex; flex-direction: column; gap: 16px; }
        .pp-kicker { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--terracotta); display: flex; align-items: center; gap: 8px; }
        .pp-kicker::before { content: ''; width: 24px; height: 2px; background: var(--terracotta); display: block; }
        .pp-name { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); color: var(--slate); line-height: 1.1; }
        .pp-meta { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--slate-soft); flex-wrap: wrap; }
        .pp-meta-dot { color: var(--slate-ghost); }

        .pp-honors { display: flex; flex-wrap: wrap; gap: 6px; }
        .pp-honor-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; background: #f5f0e8; color: var(--slate-soft); border: 1px solid rgba(61,57,53,0.12); }
        .pp-honor-icon { font-size: 0.85rem; }

        .pp-bio { font-size: 0.95rem; line-height: 1.75; color: var(--slate-soft); max-width: 600px; }

        .pp-teams { display: flex; flex-direction: column; gap: 8px; }
        .pp-teams-title { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--slate-ghost); margin-bottom: 4px; }
        .pp-league-group { display: flex; flex-direction: column; gap: 2px; }
        .pp-league-label { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--slate-ghost); }
        .pp-league-teams { font-size: 0.85rem; color: var(--slate-soft); }
      `}</style>

      <div className="pp-wrap">
        <a href="/player" className="pp-back">← Player Directory</a>

        <div className="pp-layout">

          {/* Card image + status */}
          <div className="pp-card-wrap">
            {card?.filename ? (
              <img
                src={`${STORAGE_URL}/${card.filename}`}
                alt={displayName}
                className="pp-card-img"
              />
            ) : (
              <div className="pp-card-ph">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4b8a8" strokeWidth="1.25">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L5 21"/>
                </svg>
              </div>
            )}
            <span className="pp-status-badge">
              {player.is_deceased ? "Deceased" : player.player_status === "retired" ? "Retired" : player.player_status}
            </span>
          </div>

          {/* Details */}
          <div className="pp-details">
            <p className="pp-kicker">Player Profile</p>
            <h1 className="pp-name">{displayName}</h1>

            <div className="pp-meta">
              {mostRecent?.sport_icon && <span>{mostRecent.sport_icon}</span>}
              {mostRecent?.sport_name && <span>{mostRecent.sport_name}</span>}
              {player.birthdate && (
                <>
                  <span className="pp-meta-dot">·</span>
                  <span>b. {formatBirthdate(player.birthdate)}</span>
                </>
              )}
              {player.is_deceased && player.deceased_date && (
                <>
                  <span className="pp-meta-dot">·</span>
                  <span>d. {formatBirthdate(player.deceased_date)}</span>
                </>
              )}
            </div>

            {honors.length > 0 && (
              <div className="pp-honors">
                {honors.map((h: any, i: number) => (
                  <span key={i} className="pp-honor-badge" title={h.honor_name}>
                    {h.icon && <span className="pp-honor-icon">{h.icon}</span>}
                    <span>{h.honor_short_name ?? h.honor_name}</span>
                  </span>
                ))}
              </div>
            )}

            {player.seo_description && (
              <p className="pp-bio">{player.seo_description}</p>
            )}

            {leagueGroups.length > 0 && (
              <div className="pp-teams">
                <div className="pp-teams-title">Career</div>
                {leagueGroups.map(([league, teams], i) => (
                  <div key={i} className="pp-league-group">
                    <span className="pp-league-label">{leagueMeta[league]?.abbrev ?? league}</span>
                    <span className="pp-league-teams">
                      {teams.map(t => `${t.team} (${t.from === t.to ? t.from : `${t.from}–${t.to}`})`).join(" · ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
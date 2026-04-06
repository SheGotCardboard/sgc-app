import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import PlayerAccordion from "@/components/player/PlayerAccordion";

const STORAGE_URL = "https://smgqjzddhzcpatwwqlci.supabase.co/storage/v1/object/public/cards";

export default async function PlayerPage() {
  const supabase = await createClient();

  // ── Fetch visible, non-excluded players only ───────────────
  const { data: playersRaw } = await supabase
    .from("player")
    .select("player_id, first_name, last_name, preferred_name, birthdate, player_status, seo_description, slug, profile_card_id")
    .eq("is_hidden", false)
    .eq("is_excluded", false)
    .order("last_name", { ascending: true });

  const players = (playersRaw ?? []) as any[];
  // ... rest of file unchanged

  if (players.length === 0) {
    return (
      <div className="sgc-page">
        <Nav activePage="players" />
        <div style={{ padding: '80px 48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--slate-ghost)' }}>No players found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const playerIds = players.map((p: any) => p.player_id);

  // ── Fetch team/league/sport data ──────────────────────────
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
    .in("player_id", playerIds);

  const teamSeasons = (teamSeasonsRaw ?? []) as any[];

  // ── Fetch honors ──────────────────────────────────────────
  const { data: honorsRaw } = await supabase
    .from("player_honor")
    .select(`
      player_id,
      honor:honor_id (
        honor_name,
        honor_short_name,
        honor_code,
        icon,
        category:category_id ( value )
      )
    `)
    .in("player_id", playerIds);

  const honors = (honorsRaw ?? []) as any[];

  // ── Fetch card filenames ──────────────────────────────────
  const profileCardIds = players
    .map((p: any) => p.profile_card_id)
    .filter(Boolean) as string[];

  const { data: cardsRaw } = profileCardIds.length > 0
    ? await supabase
        .from("card")
        .select("card_id, filename")
        .in("card_id", profileCardIds)
    : { data: [] };

  const cards = (cardsRaw ?? []) as any[];
  const cardMap: Record<string, string> = Object.fromEntries(
    cards.map((c: any) => [c.card_id, c.filename])
  );

  // ── Assemble player data ──────────────────────────────────
  const assembled = players.map((player: any) => {
    const pts = teamSeasons.filter((ts: any) => ts.player_id === player.player_id);

    const teams = pts.map((ts: any) => ({
      team_name: ts.team_season?.team?.team_name ?? "—",
      league_name: ts.team_season?.season?.league?.league_name ?? "—",
      league_abbrev: ts.team_season?.season?.league?.abbreviation ?? null,
      season_year: ts.team_season?.season?.season_year ?? 0,
      sport_name: ts.team_season?.season?.league?.sport?.sport_name ?? null,
      sport_icon: ts.team_season?.season?.league?.sport?.icon ?? null,
    })).sort((a: any, b: any) => b.season_year - a.season_year);

    const mostRecent = teams[0] ?? null;

    const playerHonors = honors
      .filter((h: any) => h.player_id === player.player_id)
      .map((h: any) => ({
        honor_name: h.honor?.honor_name ?? "—",
        honor_short_name: h.honor?.honor_short_name ?? null,
        honor_code: h.honor?.honor_code ?? "",
        category_value: h.honor?.category?.value ?? "",
        icon: h.honor?.icon ?? null,
      }));

    // Deduplicate honors by honor_code for display
    const uniqueHonors = playerHonors.filter(
      (h: any, i: number, arr: any[]) =>
        arr.findIndex((x: any) => x.honor_code === h.honor_code) === i
    );

    return {
      player_id: player.player_id,
      first_name: player.first_name,
      last_name: player.last_name,
      preferred_name: player.preferred_name,
      birthdate: player.birthdate,
      player_status: player.player_status,
      seo_description: player.seo_description,
      slug: player.slug,
      sport_name: mostRecent?.sport_name ?? null,
      sport_icon: mostRecent?.sport_icon ?? null,
      most_recent_team: mostRecent?.team_name ?? null,
      most_recent_league: mostRecent?.league_name ?? null,
      most_recent_league_abbrev: mostRecent?.league_abbrev ?? null,
      card_filename: player.profile_card_id ? (cardMap[player.profile_card_id] ?? null) : null,
      honors: uniqueHonors,
      teams: teams.map((t: any) => ({
        team_name: t.team_name,
        league_name: t.league_name,
        league_abbrev: t.league_abbrev,
        season_year: t.season_year,
      })),
    };
  });

  return (
    <div className="sgc-page">
      <Nav activePage="players" />
      <style>{`
        .player-page { max-width: 1100px; margin: 0 auto; padding: 56px 48px; }
        .player-page-header { margin-bottom: 40px; }
        .player-page-kicker { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 12px; }
        .player-page-title { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 2.8rem); color: var(--slate); margin-bottom: 8px; line-height: 1.1; }
        .player-page-desc { font-size: 0.95rem; color: var(--slate-soft); line-height: 1.6; max-width: 560px; }
        .player-count { font-size: 0.8rem; color: var(--slate-ghost); margin-top: 6px; }
        @media (max-width: 768px) { .player-page { padding: 40px 24px; } }
      `}</style>

      <div className="player-page">
        <div className="player-page-header">
          <p className="player-page-kicker">Player Directory</p>
          <h1 className="player-page-title">Meet the Players</h1>
          <p className="player-page-desc">
            The women behind the cards. Click any player to see their full profile.
          </p>
          <p className="player-count">{assembled.length} players in the SGC database</p>
        </div>

        <PlayerAccordion
          players={assembled}
          isAuthenticated={false}
          storageUrl={STORAGE_URL}
        />
      </div>

      <Footer />
    </div>
  );
}
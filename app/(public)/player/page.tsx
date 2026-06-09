import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import PlayerAccordion from "@/components/player/PlayerAccordion";

const STORAGE_URL = "https://smgqjzddhzcpatwwqlci.supabase.co/storage/v1/object/public/cards";

export default async function PlayerPage() {
  const supabase = await createClient();

  // ── 1. Visible, non-excluded players ─────────────────────
  const { data: playersRaw } = await supabase
    .from("player")
    .select(`
      player_id,
      first_name,
      last_name,
      preferred_name,
      birthdate,
      player_status,
      seo_description,
      slug,
      profile_card_id,
      card_availability,
      known_for_team:known_for_team_id ( team_name ),
      sport:primary_sport_id ( sport_name, icon )
    `)
    .eq("is_hidden", false)
    .eq("is_excluded", false)
    .order("last_name", { ascending: true });

  const players = (playersRaw ?? []) as any[];

  if (players.length === 0) {
    return (
      <div className="sgc-page">
        <Nav activePage="players" />
        <div style={{ padding: "80px 48px", textAlign: "center" }}>
          <p style={{ color: "var(--slate-ghost)" }}>No players found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const playerIds = players.map((p: any) => p.player_id);

  // ── 2. Lookup tables ──────────────────────────────────────
  const [
    { data: tiersRaw },
    { data: categoriesRaw },
  ] = await Promise.all([
    supabase.from("achievement_tier").select("tier_code, tier_name, color_hex, display_order"),
    supabase.from("achievement_category").select("tier_code, category_code, category_name"),
  ]);

  const tierMap: Record<string, { tier_name: string; display_color: string; sort_order: number }> =
    Object.fromEntries(
      (tiersRaw ?? []).map((t: any) => [
        t.tier_code,
        { tier_name: t.tier_name, display_color: t.color_hex, sort_order: t.display_order },
      ])
    );

  const categoryMap: Record<string, string> = Object.fromEntries(
    (categoriesRaw ?? []).map((c: any) => [
      `${c.tier_code}-${c.category_code}`,
      c.category_name,
    ])
  );

  // ── 3. Player achievements ────────────────────────────────
  const { data: achievementsRaw } = await supabase
    .from("player_achievement")
    .select(`
      player_id,
      instance_number,
      achievement:achievement_id (
        achievement_id,
        tier_code,
        category_code,
        display
      )
    `)
    .in("player_id", playerIds);

  const achievements = (achievementsRaw ?? []) as any[];

  // ── 4. Profile card filenames ─────────────────────────────
  const profileCardIds = players
    .map((p: any) => p.profile_card_id)
    .filter(Boolean) as string[];

  const { data: cardsRaw } = profileCardIds.length > 0
    ? await supabase.from("card").select("card_id, filename").in("card_id", profileCardIds)
    : { data: [] };

  const cardMap: Record<string, string> = Object.fromEntries(
    (cardsRaw ?? []).map((c: any) => [c.card_id, c.filename])
  );

  // ── 4b. Card availability lookup ─────────────────────────
  const availabilityValues = players
    .map((p: any) => p.card_availability)
    .filter(Boolean) as string[];

  const { data: availabilityRaw } = availabilityValues.length > 0
    ? await supabase.from("card_availability_lkp").select("value, de_id").in("value", availabilityValues)
    : { data: [] };

  const availabilityMap: Record<string, string> = Object.fromEntries(
    (availabilityRaw ?? []).map((a: any) => [a.value, a.de_id])
  );

  // ── 5. Assemble ───────────────────────────────────────────
  const assembled = players.map((player: any) => {
    const sport = player.sport ?? {};

    const knownForTeam = player.known_for_team?.team_name ?? null;

    const playerAchievements = achievements
      .filter((a: any) => a.player_id === player.player_id)
      .filter((a: any) => {
        const d = a.achievement?.display;
        return d === "full" || d === "list";
      });

    const chipMap: Record<string, {
      tier_code: string; tier_sort: number; display_color: string;
      category_name: string; count: number;
    }> = {};

    playerAchievements.forEach((a: any) => {
      const tier_code     = a.achievement?.tier_code ?? "";
      const category_code = a.achievement?.category_code ?? "";
      const key           = `${tier_code}-${category_code}`;
      const tier          = tierMap[tier_code];
      const cat_name      = categoryMap[key] ?? "—";
      if (!chipMap[key]) {
        chipMap[key] = {
          tier_code,
          tier_sort:     tier?.sort_order ?? 99,
          display_color: tier?.display_color ?? "#888",
          category_name: cat_name,
          count:         0,
        };
      }
      chipMap[key].count += 1;
    });

    const chips = Object.values(chipMap).sort((a, b) => a.tier_sort - b.tier_sort);

    let card_filename: string;
    if (player.profile_card_id && cardMap[player.profile_card_id]) {
      card_filename = cardMap[player.profile_card_id];
    } else if (player.card_availability) {
      const deId = availabilityMap[player.card_availability];
      card_filename = deId ? `${deId.toLowerCase()}.webp` : "pca_null.webp";
    } else {
      card_filename = "pca_null.webp";
    }

    return {
      player_id:       player.player_id,
      first_name:      player.first_name,
      last_name:       player.last_name,
      preferred_name:  player.preferred_name,
      birthdate:       player.birthdate,
      player_status:   player.player_status,
      seo_description: player.seo_description,
      slug:            player.slug,
      sport_name:      sport.sport_name ?? null,
      sport_icon:      sport.icon ?? null,
      known_for_team:  knownForTeam,
      card_filename,
      achievement_chips: chips,
      achievement_total: playerAchievements.length,
      // Legacy fields — null since we no longer fetch team seasons on index
      most_recent_league:        null,
      most_recent_league_abbrev: null,
      most_recent_team:          null,
    };
  });

  // ── 6. Sport list for dropdown ────────────────────────────
  const { data: sportsRaw } = await supabase
    .from("sport")
    .select("sport_name, sort_order, icon")
    .order("sort_order", { ascending: true })
    .order("sport_name",  { ascending: true });

  const sports       = (sportsRaw ?? []) as any[];
  const pinnedSports = sports.filter((s: any) => s.sort_order < 99);
  const alphaSports  = sports.filter((s: any) => s.sort_order >= 99);

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
            The women behind the cards. Click any player to see their profile.
          </p>
          <p className="player-count">{assembled.length} players in the SGC database</p>
        </div>

        <PlayerAccordion
          players={assembled}
          pinnedSports={pinnedSports}
          alphaSports={alphaSports}
          isAuthenticated={false}
          storageUrl={STORAGE_URL}
        />
      </div>

      <Footer />
    </div>
  );
}
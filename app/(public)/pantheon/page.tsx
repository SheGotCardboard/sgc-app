// app/(public)/pantheon/page.tsx
// SGC Pantheon — full production page
// Uses primary_sport_id on player for sport lookup — no PTS join needed

import { createClient } from "@/lib/supabase/server";
import PantheonClient from "@/components/pantheon/PantheonClient";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

type MemberTier = "public" | "story" | "chronicle" | "legacy";

function canAccess(userTier: MemberTier, required: MemberTier): boolean {
  const ORDER: MemberTier[] = ["public", "story", "chronicle", "legacy"];
  return ORDER.indexOf(userTier) >= ORDER.indexOf(required);
}

const HONOR_ROLL_MAX: Record<number, number> = {
  5: 10, 4: 7, 3: 5, 2: 3, 1: 2,
};

export const metadata = {
  title: "SGC Pantheon — She Got Cardboard",
  description:
    "The SGC Pantheon honors women whose impact reaches beyond the record book. Sports introduced us — her legacy is why she matters.",
};

export default async function PantheonPage({
  searchParams,
}: {
  searchParams: Promise<{ player?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const initialSlug = resolvedParams?.player ?? null;

  // ── Member tier ──────────────────────────────────────────────
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
    memberTier = ((subRows?.[0] as any)?.tier_slug as MemberTier) ?? "story";
  }

  const canLegacy = canAccess(memberTier, "legacy");

  // ── Live Pantheon data ───────────────────────────────────────
  const { data: summaryRaw } = await supabase
    .from("pantheon_player_summary")
    .select(`
      player_id, total_score, dominant_dimension,
      champion_pct, pioneer_pct, legend_pct,
      advocate_pct, sage_pct, muse_pct,
      is_panthelete, dims_above_20pct, has_zero_dim
    `)
    .order("total_score", { ascending: false });

  const isIllustrative = !summaryRaw || summaryRaw.length === 0;

  const playerIds = (summaryRaw ?? []).map((r: any) => r.player_id);

  // ── Single flat query — player + sport via primary_sport_id ──
  const { data: playersRaw } = playerIds.length > 0
    ? await supabase
        .from("player")
        .select(`
          player_id,
          first_name,
          last_name,
          slug,
          player_status,
          known_for_team_id,
          primary_sport_id,
          sport:primary_sport_id ( sport_name, popularity )
        `)
        .in("player_id", playerIds)
    : { data: [] };

  // ── Team name lookup ─────────────────────────────────────────
  const teamIds = ((playersRaw ?? []) as any[])
    .map((p: any) => p.known_for_team_id)
    .filter(Boolean) as string[];

  const { data: teamsRaw } = teamIds.length > 0
    ? await supabase.from("team").select("team_id, team_name").in("team_id", teamIds)
    : { data: [] };

  const teamMap: Record<string, string> = Object.fromEntries(
    ((teamsRaw ?? []) as any[]).map((t: any) => [t.team_id, t.team_name])
  );

  const playerMap: Record<string, any> = Object.fromEntries(
    ((playersRaw ?? []) as any[]).map((p: any) => [p.player_id, p])
  );

  // ── Assemble all scored players ──────────────────────────────
  type PlayerData = {
    name: string; sport: string; team: string; status: string;
    score: number; dom: string; slug: string; c: number[];
    qualified: boolean; dimsAbove20: number; hasZeroDim: boolean;
    _popularity: number;
  };

  const allScored: PlayerData[] = (summaryRaw ?? []).map((r: any) => {
    const p  = playerMap[r.player_id] ?? {};
    const sp = p.sport ?? {};
    return {
      name:        `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "—",
      sport:       sp.sport_name ?? "—",
      team:        teamMap[p.known_for_team_id ?? ""] ?? "—",
      status:      p.player_status ?? "—",
      score:       r.total_score ?? 0,
      dom:         r.dominant_dimension ?? "Champion",
      slug:        p.slug ?? "",
      c: [
        r.champion_pct ?? 0, r.pioneer_pct  ?? 0, r.legend_pct   ?? 0,
        r.advocate_pct ?? 0, r.sage_pct     ?? 0, r.muse_pct     ?? 0,
      ],
      qualified:    r.is_panthelete ?? false,
      dimsAbove20:  r.dims_above_20pct ?? 0,
      hasZeroDim:   r.has_zero_dim ?? false,
      _popularity:  sp.popularity ?? 3,
    };
  });

  // ── Pantheletes: score DESC ───────────────────────────────────
  const pantheletes = allScored
    .filter((p) => p.qualified)
    .sort((a, b) => b.score - a.score);

  // ── Honor Roll: top N per sport, sport alpha, score DESC ──────
  const bySport: Record<string, PlayerData[]> = {};
  for (const p of allScored.filter((p) => !p.qualified)) {
    if (!bySport[p.sport]) bySport[p.sport] = [];
    bySport[p.sport].push(p);
  }

  const honorRoll: PlayerData[] = [];
  for (const sport of Object.keys(bySport).sort()) {
    const sportPlayers = bySport[sport];
    const popularity   = sportPlayers[0]._popularity ?? 3;
    const max          = HONOR_ROLL_MAX[popularity] ?? 5;
    honorRoll.push(...sportPlayers.slice(0, max));
  }

  // ── Mock data ─────────────────────────────────────────────────
  type ClientPlayerData = Omit<PlayerData, "_popularity">;

  const MOCK_PANTHELETES: ClientPlayerData[] = [
    { name: "Billie Jean King", sport: "Tennis", team: "Multiple", status: "retired", score: 1277, dom: "Pioneer", slug: "billie-jean-king", c: [100,100,100,100,47,64], qualified: true,  dimsAbove20: 6, hasZeroDim: false },
  ];

  const MOCK_HONOR_ROLL: ClientPlayerData[] = [
    { name: "Serena Williams",         sport: "Tennis",       team: "Multiple",       status: "retired", score: 780,  dom: "Champion", slug: "serena-williams",         c: [100,30,58,22,14,88],  qualified: false, dimsAbove20: 5, hasZeroDim: false },
    { name: "Pat Summitt",             sport: "Basketball",   team: "Tennessee",      status: "retired", score: 734,  dom: "Sage",     slug: "pat-summitt",             c: [14,31,100,30,100,18], qualified: false, dimsAbove20: 4, hasZeroDim: false },
    { name: "Babe Didrikson Zaharias", sport: "Golf",         team: "Multiple",       status: "retired", score: 700,  dom: "Champion", slug: "babe-didrikson-zaharias", c: [88,60,74,14,10,34],  qualified: false, dimsAbove20: 4, hasZeroDim: false },
    { name: "Althea Gibson",           sport: "Tennis",       team: "Multiple",       status: "retired", score: 710,  dom: "Pioneer",  slug: "althea-gibson",           c: [100,70,56,18,14,26], qualified: false, dimsAbove20: 4, hasZeroDim: false },
    { name: "Simone Biles",            sport: "Gymnastics",   team: "USA Gymnastics", status: "active",  score: 682,  dom: "Champion", slug: "simone-biles",            c: [95,33,23,51,14,57],  qualified: false, dimsAbove20: 5, hasZeroDim: false },
    { name: "Martina Navratilova",     sport: "Tennis",       team: "Multiple",       status: "retired", score: 655,  dom: "Champion", slug: "martina-navratilova",     c: [100,14,74,18,22,34], qualified: false, dimsAbove20: 4, hasZeroDim: false },
    { name: "Mia Hamm",                sport: "Soccer",       team: "USA",            status: "retired", score: 590,  dom: "Champion", slug: "mia-hamm",                c: [100,22,34,22,10,48], qualified: false, dimsAbove20: 5, hasZeroDim: false },
    { name: "Lisa Leslie",             sport: "Basketball",   team: "LA Sparks",      status: "retired", score: 533,  dom: "Legend",   slug: "lisa-leslie",             c: [100,4,58,11,14,26],  qualified: false, dimsAbove20: 3, hasZeroDim: false },
    { name: "Cynthia Cooper",          sport: "Basketball",   team: "Houston Comets", status: "retired", score: 292,  dom: "Champion", slug: "cynthia-cooper",          c: [58,3,22,9,8,17],     qualified: false, dimsAbove20: 2, hasZeroDim: false },
  ];

  return (
    <>
      <Nav activePage="pantheon" />
      <PantheonClient
        pantheletes={isIllustrative ? MOCK_PANTHELETES : pantheletes}
        honorRoll={isIllustrative ? MOCK_HONOR_ROLL : honorRoll}
        isIllustrative={isIllustrative}
        memberTier={memberTier}
        canLegacy={canLegacy}
        initialSlug={initialSlug}
      />
      <Footer />
    </>
  );
}
// app/(public)/pantheon/page.tsx
// SGC Pantheon — full production page
// Server component for data fetch · passes to client components for interactivity
// Sections: Hero · Spotlight · Roll · Leaderboards · Explorer · Gate callout
// Live data: pantheon_player_summary · falls back to illustrative when empty

import { createClient } from "@/lib/supabase/server";
import PantheonClient from "@/components/pantheon/PantheonClient";

type MemberTier = "public" | "story" | "chronicle" | "legacy";

function canAccess(userTier: MemberTier, required: MemberTier): boolean {
  const ORDER: MemberTier[] = ["public", "story", "chronicle", "legacy"];
  return ORDER.indexOf(userTier) >= ORDER.indexOf(required);
}

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  // Query all scored players (not just Pantheletes) so the Roll
  // can show near-misses below the threshold
  const { data: summaryRaw } = await supabase
    .from("pantheon_player_summary")
    .select(
      `
      player_id,
      total_score,
      dominant_dimension,
      champion_pct,
      pioneer_pct,
      legend_pct,
      advocate_pct,
      sage_pct,
      muse_pct,
      is_panthelete,
      dims_above_20pct,
      has_zero_dim,
      player:player_id (
        first_name,
        last_name,
        slug,
        player_status,
        card_availability,
        known_for_team:known_for_team_id ( team_name ),
        sport:sport_id ( sport_name )
      )
    `
    )
    .order("total_score", { ascending: false });

  const isIllustrative = !summaryRaw || summaryRaw.length === 0;

  // ── Mock data (illustrative) ─────────────────────────────────
  type PlayerData = {
    name: string;
    sport: string;
    team: string;
    status: string;
    score: number;
    dom: string;
    slug: string;
    c: number[];      // [champion, pioneer, legend, advocate, sage, muse] raw ceiling %
    qualified: boolean;
    dimsAbove20: number;
    hasZeroDim: boolean;
  };

  const MOCK: PlayerData[] = [
    { name: "Billie Jean King",    sport: "Tennis",     team: "Multiple",        status: "retired",  score: 2511, dom: "Pioneer",  slug: "billie-jean-king",    c: [62,98,96,88,42,74], qualified: true,  dimsAbove20: 6, hasZeroDim: false },
    { name: "Pat Summitt",         sport: "Basketball", team: "Tennessee",       status: "deceased", score: 2142, dom: "Sage",     slug: "pat-summitt",         c: [28,87,74,52,97,31], qualified: true,  dimsAbove20: 6, hasZeroDim: false },
    { name: "Lisa Leslie",         sport: "Basketball", team: "LA Sparks",       status: "retired",  score: 1920, dom: "Champion", slug: "lisa-leslie",         c: [91,38,78,30,48,86], qualified: true,  dimsAbove20: 5, hasZeroDim: false },
    { name: "Sheryl Swoopes",      sport: "Basketball", team: "Houston Comets",  status: "retired",  score: 1840, dom: "Champion", slug: "sheryl-swoopes",      c: [88,42,62,34,28,78], qualified: false, dimsAbove20: 5, hasZeroDim: false },
    { name: "Tamika Catchings",    sport: "Basketball", team: "Indiana Fever",   status: "retired",  score: 1481, dom: "Champion", slug: "tamika-catchings",    c: [78,44,62,58,36,29], qualified: false, dimsAbove20: 5, hasZeroDim: false },
    { name: "Sue Bird",            sport: "Basketball", team: "Seattle Storm",   status: "retired",  score: 1440, dom: "Champion", slug: "sue-bird",            c: [82,38,58,42,41,55], qualified: false, dimsAbove20: 5, hasZeroDim: false },
    { name: "Maya Moore",          sport: "Basketball", team: "Minnesota Lynx",  status: "retired",  score: 1380, dom: "Advocate", slug: "maya-moore",          c: [52,79,41,94,28,38], qualified: false, dimsAbove20: 4, hasZeroDim: false },
    { name: "Tina Thompson",       sport: "Basketball", team: "Houston Comets",  status: "retired",  score: 1310, dom: "Legend",   slug: "tina-thompson",       c: [58,32,82,28,60,44], qualified: false, dimsAbove20: 4, hasZeroDim: false },
    { name: "Teresa Weatherspoon", sport: "Basketball", team: "NY Liberty",      status: "retired",  score: 1260, dom: "Sage",     slug: "teresa-weatherspoon", c: [44,52,38,42,71,28], qualified: false, dimsAbove20: 4, hasZeroDim: false },
    { name: "Renee Montgomery",    sport: "Basketball", team: "Atlanta Dream",   status: "retired",  score: 1230, dom: "Pioneer",  slug: "renee-montgomery",    c: [38,68,32,52,28,34], qualified: false, dimsAbove20: 4, hasZeroDim: false },
  ];

  const players: PlayerData[] = isIllustrative
    ? MOCK
    : (summaryRaw ?? []).map((r: any) => ({
        name: `${r.player?.first_name ?? ""} ${r.player?.last_name ?? ""}`.trim(),
        sport: r.player?.sport?.sport_name ?? "—",
        team: r.player?.known_for_team?.team_name ?? "—",
        status: r.player?.player_status ?? "—",
        score: r.total_score ?? 0,
        dom: r.dominant_dimension ?? "Champion",
        slug: r.player?.slug ?? "",
        c: [
          r.champion_pct ?? 0,
          r.pioneer_pct  ?? 0,
          r.legend_pct   ?? 0,
          r.advocate_pct ?? 0,
          r.sage_pct     ?? 0,
          r.muse_pct     ?? 0,
        ],
        qualified:    r.is_panthelete ?? false,
        dimsAbove20:  r.dims_above_20pct ?? 0,
        hasZeroDim:   r.has_zero_dim ?? false,
      }));

  const pantheleteCount = players.filter((p) => p.qualified).length;

  return (
    <PantheonClient
      players={players}
      pantheleteCount={pantheleteCount}
      isIllustrative={isIllustrative}
      memberTier={memberTier}
      canLegacy={canLegacy}
      initialSlug={initialSlug}
    />
  );
}
// lib/pantheon/score.ts
// SGC Pantheon Scoring Engine — v2.0 Architecture
//
// Dimension ceilings (LOCKED):
//   Champion  = 500  · HARD CAP · no A+ bonuses
//   Pioneer   = 300  · soft cap · A+ allowed (raw > 300 possible)
//   Legend    = 300  · soft cap · A+ allowed
//   Advocate  = 300  · soft cap · A+ allowed
//   Sage      = 300  · soft cap · A+ allowed
//   Muse      = 300  · soft cap · A+ allowed
//   Total max = 2,000
//
// Panthelete gate: 1,875
// Breadth gate:   ≥ 4 dims where capped_score >= 20% of ceiling
//                 (Champion: 20% of 500 = 100 pts)
//                 (Others:   20% of 300 =  60 pts)

import { createClient } from "@/lib/supabase/server";

// ── Types ────────────────────────────────────────────────────

type Dimension = "Champion" | "Pioneer" | "Legend" | "Advocate" | "Sage" | "Muse";

const DIMENSION_CEILINGS: Record<Dimension, number> = {
  Champion: 500,
  Pioneer:  300,
  Legend:   300,
  Advocate: 300,
  Sage:     300,
  Muse:     300,
};

const HARD_CAP_DIMS: Dimension[] = ["Champion"];

const PANTHELETE_SCORE_GATE = 1875;
const BREADTH_GATE_MIN_DIMS = 4;

type ScoringMethod =
  | "fixed"
  | "olympic_tier"
  | "intl_tier"
  | "coaching_tenure"
  | "broadcast_tenure"
  | "fo_tenure"
  | "none";

type PlayerAchievement = {
  id: string;
  achievement_id: string;
  de_id: string;
  instance_number: number;
  year: number | null;
  context: string | null;
  opportunity_tier: "Single" | "Low" | "Med" | "High" | null;
  games_number: number | null;
  streak_id: string | null;
  previous_instance_id: string | null;
  achievement: {
    achievement_id: string;
    de_id: string;
    scoring_method: ScoringMethod;
    dimension: Dimension | null;
    is_pantheon: boolean;
    achievement_name: string;
    tier_code: string;
    category_code: string;
  };
};

type OlympicTierRow = {
  opportunity_tier: string;
  gold_1st: number;
  gold_2nd: number;
  gold_3rd: number;
  gold_4th_plus: number;
  silver_1st: number;
  bronze_1st: number;
};

type IntlTierRow = OlympicTierRow & {
  soccer_wc_modifier: number;
};

type ScoringRuleRow = {
  achievement_id: string;
  instance_number: number;
  modifier_type: "fixed" | "b2b" | "bonus" | "cap";
  base_pts: number;
  modifier_value: number | null;
  cap_at: number | null;
};

type TenureTierRow = {
  milestone_years: number;
  tier_level: number;
  milestone_pts: number;
};

type DimensionScore = {
  dimension: Dimension;
  raw_score: number;
  capped_score: number;
  pct_ceiling: number;
  is_a_plus: boolean;
};

type PantheonResult = {
  player_id: string;
  dimension_scores: DimensionScore[];
  total_score: number;
  dominant_dimension: Dimension;
  dims_above_20pct: number;
  has_zero_dim: boolean;
  is_panthelete: boolean;
  champion_pct: number;
  pioneer_pct:  number;
  legend_pct:   number;
  advocate_pct: number;
  sage_pct:     number;
  muse_pct:     number;
};

// ── Reference table cache ────────────────────────────────────

type RefTables = {
  olympicTiers:   Map<string, OlympicTierRow>;
  intlTiers:      Map<string, IntlTierRow>;
  layer3:         Map<number, number>;
  scoringRules:   Map<string, ScoringRuleRow[]>;
  coachingTiers:  TenureTierRow[];
  broadcastTiers: TenureTierRow[];
  foTiers:        TenureTierRow[];
};

async function loadRefTables(supabase: ReturnType<typeof createClient>): Promise<RefTables> {
  const db = await supabase;

  const [
    { data: olympic },
    { data: intl },
    { data: layer3 },
    { data: rules },
    { data: coaching },
    { data: broadcast },
    { data: fo },
  ] = await Promise.all([
    db.from("pantheon_olympic_tier" as any).select("*"),
    db.from("pantheon_intl_tier" as any).select("*"),
    db.from("pantheon_layer3_multiplier" as any).select("games_number, multiplier"),
    db.from("pantheon_scoring_rule" as any).select("achievement_id, instance_number, modifier_type, base_pts, modifier_value, cap_at"),
    db.from("pantheon_coaching_tier" as any).select("milestone_years, tier_level, milestone_pts").order("tier_level").order("milestone_years"),
    db.from("pantheon_broadcast_tier" as any).select("milestone_years, tier_level, milestone_pts").order("tier_level").order("milestone_years"),
    db.from("pantheon_fo_tier" as any).select("milestone_years, tier_level, milestone_pts").order("tier_level").order("milestone_years"),
  ]);

  const olympicTiers = new Map<string, OlympicTierRow>(
    (olympic ?? []).map((r: any) => [r.opportunity_tier, r])
  );
  const intlTiers = new Map<string, IntlTierRow>(
    (intl ?? []).map((r: any) => [r.opportunity_tier, r])
  );
  const layer3Map = new Map<number, number>(
    (layer3 ?? []).map((r: any) => [r.games_number, Number(r.multiplier)])
  );

  const scoringRules = new Map<string, ScoringRuleRow[]>();
  for (const r of (rules ?? []) as any[]) {
    const key = String((r as any).achievement_id);
    if (!scoringRules.has(key)) scoringRules.set(key, []);
    scoringRules.get(key)!.push(r as ScoringRuleRow);
  }

  return {
    olympicTiers,
    intlTiers,
    layer3: layer3Map,
    scoringRules,
    coachingTiers:  (coaching  ?? []) as TenureTierRow[],
    broadcastTiers: (broadcast ?? []) as TenureTierRow[],
    foTiers:        (fo        ?? []) as TenureTierRow[],
  };
}

// ── Scoring helpers ──────────────────────────────────────────

function getLayer3(ref: RefTables, gamesNumber: number | null): number {
  if (!gamesNumber) return 1.0;
  return ref.layer3.get(gamesNumber) ?? ref.layer3.get(99) ?? 1.0;
}

function scoreFixed(ref: RefTables, pa: PlayerAchievement): number {
  const rules = ref.scoringRules.get(pa.achievement.achievement_id) ?? [];
  const baseRules = rules.filter((r) => r.modifier_type === "fixed");
  const rule =
    baseRules.find((r) => r.instance_number === pa.instance_number) ??
    baseRules.find((r) => r.instance_number === 99);
  if (!rule) return 0;
  let pts = Number(rule.base_pts ?? 0);

  if (rule.cap_at !== null && rule.cap_at !== undefined) {
    pts = Math.min(pts, Number(rule.cap_at));
  }
  if (rule.modifier_value !== null && rule.modifier_value !== undefined) {
    pts = pts * Number(rule.modifier_value);
  }
  if (pa.previous_instance_id) {
    const b2b =
      rules.find((r) => r.modifier_type === "b2b" && r.instance_number === pa.instance_number) ??
      rules.find((r) => r.modifier_type === "b2b" && r.instance_number === 99);
    if (b2b) pts += Number(b2b.base_pts ?? 0);
  }
  return pts;
}

function scoreOlympic(ref: RefTables, pa: PlayerAchievement, isIntl = false): number {
  if (!pa.opportunity_tier) return 0;

  const tierMap = isIntl ? ref.intlTiers : ref.olympicTiers;
  const tierRow = tierMap.get(pa.opportunity_tier);
  if (!tierRow) return 0;

  const name = pa.achievement.achievement_name.toLowerCase();
  const isGold   = name.includes("gold");
  const isSilver = name.includes("silver");
  const isBronze = name.includes("bronze");

  let layer2Pts = 0;
  if (isGold) {
    layer2Pts =
      pa.instance_number === 1 ? Number(tierRow.gold_1st ?? 0) :
      pa.instance_number === 2 ? Number(tierRow.gold_2nd ?? 0) :
      pa.instance_number === 3 ? Number(tierRow.gold_3rd ?? 0) :
      Number(tierRow.gold_4th_plus ?? 0);
    if (isIntl && pa.opportunity_tier === "Single") {
      const intlRow = tierRow as IntlTierRow;
      layer2Pts *= Number(intlRow.soccer_wc_modifier ?? 1.0);
    }
  } else if (isSilver) {
    layer2Pts = Number(tierRow.silver_1st ?? 0);
  } else if (isBronze) {
    layer2Pts = Number(tierRow.bronze_1st ?? 0);
  }

  const layer3 = getLayer3(ref, pa.games_number);
  let pts = layer2Pts * layer3;

  if (pa.previous_instance_id) pts += 6;
  return pts;
}

function scoreTenure(tierRows: TenureTierRow[], pa: PlayerAchievement): number {
  let years = pa.instance_number;
  let tierLevel = 1;

  if (pa.context) {
    const yearsMatch = pa.context.match(/YEARS:(\d+)/i);
    const tierMatch  = pa.context.match(/TIER:(\d+)/i);
    if (yearsMatch) years = parseInt(yearsMatch[1]);
    if (tierMatch)  tierLevel = parseInt(tierMatch[1]);
  }

  const relevantRows = tierRows.filter(
    (r) => r.tier_level === tierLevel && r.milestone_years <= years
  );
  return relevantRows.reduce((sum, r) => sum + Number(r.milestone_pts ?? 0), 0);
}

// ── Main scoring function ────────────────────────────────────

export async function calculatePantheonScore(
  playerId: string
): Promise<PantheonResult | null> {
  const supabase = createClient();
  const db = await supabase;

  const ref = await loadRefTables(supabase);

  const { data: paRowsRaw, error } = await db
    .from("player_achievement" as any)
    .select(`
      id,
      achievement_id,
      de_id,
      instance_number,
      year,
      context,
      opportunity_tier,
      games_number,
      streak_id,
      previous_instance_id,
      achievement:achievement_id (
        achievement_id,
        de_id,
        scoring_method,
        dimension,
        is_pantheon,
        achievement_name,
        tier_code,
        category_code
      )
    `)
    .eq("player_id", playerId);

  if (error) {
    console.error(`[score.ts] Failed to load achievements for ${playerId}:`, error);
    return null;
  }

  const achievements: PlayerAchievement[] = ((paRowsRaw ?? []) as any[])
    .filter((r: any) => r.achievement?.is_pantheon === true)
    .map((r: any) => r as PlayerAchievement);

  if (achievements.length === 0) {
    console.log(`[score.ts] No pantheon achievements for player ${playerId}`);
    return null;
  }

  // ── Score each achievement ────────────────────────────────────
  const dimRawScores: Record<Dimension, number> = {
    Champion: 0, Pioneer: 0, Legend: 0, Advocate: 0, Sage: 0, Muse: 0,
  };

  for (const pa of achievements) {
    const method = pa.achievement.scoring_method as ScoringMethod;
    const dim    = pa.achievement.dimension as Dimension | null;
    if (!dim || method === "none") continue;

    let pts = 0;
    switch (method) {
      case "fixed":            pts = scoreFixed(ref, pa);              break;
      case "olympic_tier":     pts = scoreOlympic(ref, pa, false);     break;
      case "intl_tier":        pts = scoreOlympic(ref, pa, true);      break;
      case "coaching_tenure":  pts = scoreTenure(ref.coachingTiers, pa);  break;
      case "broadcast_tenure": pts = scoreTenure(ref.broadcastTiers, pa); break;
      case "fo_tenure":        pts = scoreTenure(ref.foTiers, pa);     break;
      default: pts = 0;
    }

    if (dim in dimRawScores) {
      dimRawScores[dim] += pts;
    }
  }

  // ── Apply ceilings — explicit Number() coercion on every value ──
  const dimensionScores: DimensionScore[] = (Object.keys(DIMENSION_CEILINGS) as Dimension[]).map(
    (dim) => {
      const ceiling    = Number(DIMENSION_CEILINGS[dim] ?? 0);
      const raw        = Number(dimRawScores[dim] ?? 0);
      const isHardCap  = HARD_CAP_DIMS.includes(dim);
      const capped     = Math.min(raw, ceiling);
      const isAPlus    = !isHardCap && raw > ceiling;
      const pctCeiling = ceiling > 0 ? (capped / ceiling) * 100 : 0;
      return {
        dimension:    dim,
        raw_score:    raw,
        capped_score: capped,
        pct_ceiling:  pctCeiling,
        is_a_plus:    isAPlus,
      };
    }
  );

  // ── Summary metrics ───────────────────────────────────────────
  const totalScore = dimensionScores.reduce((s, d) => s + d.capped_score, 0);

  const dominant = dimensionScores.reduce((best, d) =>
    d.capped_score > best.capped_score ? d : best
  ).dimension;

  const dimsAbove20pct = dimensionScores.filter((d) => {
    const threshold = DIMENSION_CEILINGS[d.dimension] * 0.20;
    return d.capped_score >= threshold;
  }).length;

  const hasZeroDim = dimensionScores.some((d) => d.capped_score === 0);

  const isPanthelete =
    totalScore >= PANTHELETE_SCORE_GATE &&
    dimsAbove20pct >= BREADTH_GATE_MIN_DIMS &&
    !hasZeroDim;

  // ── Upsert pantheon_player_score ─────────────────────────────
  const scoreUpserts = dimensionScores.map((d) => ({
    player_id:    playerId,
    dimension:    d.dimension,
    raw_score:    Number(d.raw_score    ?? 0),
    capped_score: Number(d.capped_score ?? 0),
    pct_ceiling:  Number(d.pct_ceiling  ?? 0),
    is_a_plus:    Boolean(d.is_a_plus   ?? false),
  }));

  const { error: scoreErr } = await (await supabase)
    .from("pantheon_player_score" as any)
    .upsert(scoreUpserts as any, { onConflict: "player_id,dimension" });

  if (scoreErr) {
    console.error(`[score.ts] Failed to upsert player_score for ${playerId}:`, scoreErr);
  }

  // ── Upsert pantheon_player_summary ───────────────────────────
  function dimPct(dim: Dimension): number {
    const d = dimensionScores.find((ds) => ds.dimension === dim);
    return d ? Math.round(Number(d.pct_ceiling ?? 0)) : 0;
  }

  const summaryRow = {
    player_id:          playerId,
    total_score:        Math.round(Number(totalScore ?? 0)),
    dominant_dimension: dominant,
    champion_pct:       dimPct("Champion"),
    pioneer_pct:        dimPct("Pioneer"),
    legend_pct:         dimPct("Legend"),
    advocate_pct:       dimPct("Advocate"),
    sage_pct:           dimPct("Sage"),
    muse_pct:           dimPct("Muse"),
    dims_above_20pct:   dimsAbove20pct,
    has_zero_dim:       hasZeroDim,
    is_panthelete:      isPanthelete,
  };

  const { error: summaryErr } = await (await supabase)
    .from("pantheon_player_summary" as any)
    .upsert(summaryRow as any, { onConflict: "player_id" });

  if (summaryErr) {
    console.error(`[score.ts] Failed to upsert player_summary for ${playerId}:`, summaryErr);
  }

  const result: PantheonResult = {
    player_id:          playerId,
    dimension_scores:   dimensionScores,
    total_score:        Math.round(totalScore),
    dominant_dimension: dominant,
    dims_above_20pct:   dimsAbove20pct,
    has_zero_dim:       hasZeroDim,
    is_panthelete:      isPanthelete,
    champion_pct: dimPct("Champion"),
    pioneer_pct:  dimPct("Pioneer"),
    legend_pct:   dimPct("Legend"),
    advocate_pct: dimPct("Advocate"),
    sage_pct:     dimPct("Sage"),
    muse_pct:     dimPct("Muse"),
  };

  console.log(
    `[score.ts] ${playerId} scored: total=${result.total_score} ` +
    `dominant=${result.dominant_dimension} ` +
    `panthelete=${result.is_panthelete}`
  );

  return result;
}

// ── Score all players ────────────────────────────────────────

export async function scoreAllPlayers(): Promise<{
  processed: number;
  pantheletes: number;
  errors: number;
}> {
  const db = await createClient();

  const { data: playerRowsRaw } = await db
    .from("player_achievement" as any)
    .select(`
      player_id,
      achievement:achievement_id ( is_pantheon )
    `)
    .eq("achievement.is_pantheon", true);

  const playerIds = [
    ...new Set(((playerRowsRaw ?? []) as any[]).map((r: any) => r.player_id as string)),
  ];

  console.log(`[score.ts] Scoring ${playerIds.length} players...`);

  let processed = 0;
  let pantheletes = 0;
  let errors = 0;

  for (const playerId of playerIds) {
    try {
      const result = await calculatePantheonScore(playerId);
      if (result) {
        processed++;
        if (result.is_panthelete) pantheletes++;
      }
    } catch (err) {
      console.error(`[score.ts] Error scoring ${playerId}:`, err);
      errors++;
    }
  }

  console.log(
    `[score.ts] Complete: ${processed} scored, ${pantheletes} Pantheletes, ${errors} errors`
  );

  return { processed, pantheletes, errors };
}
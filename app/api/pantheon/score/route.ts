// app/api/pantheon/score/route.ts
// Triggers Pantheon scoring engine
// POST /api/pantheon/score          → score all players
// POST /api/pantheon/score?player=PLAY000020 → score one player

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculatePantheonScore, scoreAllPlayers } from "@/lib/pantheon/score";

export async function POST(req: NextRequest) {
  // Basic auth guard — only admins/internal should trigger this
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playerDeId = req.nextUrl.searchParams.get("player");

  if (playerDeId) {
    // Score a single player by de_id
    const { data: playerRowRaw } = await supabase
      .from("player")
      .select("player_id, first_name, last_name")
      .eq("de_id", playerDeId)
      .maybeSingle();
    const playerRow = playerRowRaw as any;

    if (!playerRow?.player_id) {
      return NextResponse.json({ error: `Player ${playerDeId} not found` }, { status: 404 });
    }

    const result = await calculatePantheonScore((playerRow as any).player_id);

    if (!result) {
      return NextResponse.json({
        message: `No pantheon achievements found for ${playerDeId}`,
        player: playerDeId,
      });
    }

    return NextResponse.json({
      player:           playerDeId,
      name:             `${(playerRow as any).first_name} ${(playerRow as any).last_name}`,
      total_score:      result.total_score,
      dominant:         result.dominant_dimension,
      is_panthelete:    result.is_panthelete,
      dims_above_20pct: result.dims_above_20pct,
      has_zero_dim:     result.has_zero_dim,
      dimensions:       result.dimension_scores.map((d) => ({
        dimension:    d.dimension,
        raw_score:    d.raw_score,
        capped_score: d.capped_score,
        pct_ceiling:  Math.round(d.pct_ceiling),
        is_a_plus:    d.is_a_plus,
      })),
    });
  }

  // Score all players
  const summary = await scoreAllPlayers();

  return NextResponse.json({
    message:     "Scoring complete",
    processed:   summary.processed,
    pantheletes: summary.pantheletes,
    errors:      summary.errors,
  });
}
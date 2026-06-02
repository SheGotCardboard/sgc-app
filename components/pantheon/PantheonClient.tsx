// components/pantheon/PantheonClient.tsx
// Full Pantheon page — client component for interactivity
// Sections: Hero · Spotlight (radar) · Roll · Leaderboards · Explorer · Compare · Gates

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const DIMS = ["Champion", "Pioneer", "Legend", "Advocate", "Sage", "Muse"] as const;
type Dim = (typeof DIMS)[number];

const DC: Record<Dim, string> = {
  Champion: "#B5333E",
  Pioneer:  "#1A7A6D",
  Legend:   "#6B3A7A",
  Advocate: "#B57A14",
  Sage:     "#3A4A8B",
  Muse:     "#D4622A",
};

const THRESHOLD = 1875;

type PlayerData = {
  name: string; sport: string; team: string; status: string;
  score: number; dom: string; slug: string; c: number[];
  qualified: boolean; dimsAbove20: number; hasZeroDim: boolean;
};

type Props = {
  players: PlayerData[];
  pantheleteCount: number;
  isIllustrative: boolean;
  memberTier: string;
  canLegacy: boolean;
  initialSlug?: string | null;
};

function pctOfTotal(arr: number[]) {
  const t = arr.reduce((a, b) => a + b, 0);
  return arr.map((v) => (t > 0 ? Math.round((v / t) * 100) : 0));
}

// ── Radar chart drawn on canvas ──────────────────────────────
function RadarChart({ data, domDim, size = 240 }: { data: number[]; domDim: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) * 0.68;
    const n = 6;

    // Grid rings
    [0.25, 0.5, 0.75, 1].forEach((scale) => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = cx + r * scale * Math.cos(angle);
        const y = cy + r * scale * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // Spokes
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Data polygon
    const domColor = DC[domDim as Dim] ?? "#d97757";
    ctx.beginPath();
    data.forEach((v, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const pct = Math.min(v, 100) / 100;
      const x = cx + r * pct * Math.cos(angle);
      const y = cy + r * pct * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = domColor + "22";
    ctx.fill();
    ctx.strokeStyle = domColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Points
    data.forEach((v, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const pct = Math.min(v, 100) / 100;
      const x = cx + r * pct * Math.cos(angle);
      const y = cy + r * pct * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = DC[DIMS[i]] ?? "#888";
      ctx.fill();
    });

    // Labels
    DIMS.forEach((d, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const lx = cx + (r + 18) * Math.cos(angle);
      const ly = cy + (r + 18) * Math.sin(angle);
      ctx.font = `700 9px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = DC[d];
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(d.toUpperCase(), lx, ly);
    });
  }, [data, domDim, size]);

  return <canvas ref={canvasRef} style={{ display: "block" }} aria-label="Dimension radar chart" />;
}

// ── Explorer presets ─────────────────────────────────────────
const PRESETS: Record<string, { label: string; mins: number[] }> = {
  complete:     { label: "All 6 dims ≥ 35% — The Complete Players",          mins: [35,35,35,35,35,35] },
  trailblazers: { label: "Pioneer ≥ 60% + Advocate ≥ 40% — The Trailblazers", mins: [0,60,0,40,0,0] },
  icons:        { label: "Muse ≥ 50% + Legend ≥ 60% — The Cultural Icons",   mins: [0,0,60,0,0,50] },
  coaches:      { label: "Sage ≥ 60% — The Coaches' Coaches",                mins: [0,0,0,0,60,0] },
  competitors:  { label: "Champion ≥ 75% — The Competitors",                 mins: [75,0,0,0,0,0] },
  fighters:     { label: "Advocate ≥ 50% + Pioneer ≥ 40% — The Fighters",    mins: [0,40,0,50,0,0] },
};

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function PantheonClient({
  players, pantheleteCount, isIllustrative, memberTier, canLegacy, initialSlug,
}: Props) {
  const initialIdx = initialSlug
    ? Math.max(0, players.findIndex((p) => p.slug === initialSlug))
    : 0;
  const [spotIdx, setSpotIdx] = useState(initialIdx);
  const [compareA, setCompareA] = useState(0);
  const [compareB, setCompareB] = useState(Math.min(2, players.length - 1));
  const [compareView, setCompareView] = useState<"radar" | "recipe">("radar");
  const [sliderVals, setSliderVals] = useState([0,0,0,0,0,0]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [explorerResults, setExplorerResults] = useState<PlayerData[] | null>(null);
  const [explorerLabel, setExplorerLabel] = useState("");
  const [sportFilter, setSportFilter] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());

  const spotPlayer = players[spotIdx] ?? players[0];
  const sports  = [...new Set(players.map((p) => p.sport))].sort();
  const statuses = [...new Set(players.map((p) => p.status))].sort();

  function applyPreset(key: string) {
    setActivePreset(key);
    setSliderVals(PRESETS[key].mins);
    runQuery(PRESETS[key].mins, PRESETS[key].label, sportFilter, statusFilter);
  }

  function runQuery(
    mins = sliderVals,
    label = buildLabel(mins),
    sports = sportFilter,
    statuses = statusFilter
  ) {
    const matched = players.filter((p) => {
      const dimOk    = DIMS.every((_, i) => p.c[i] >= mins[i]);
      const sportOk  = sports.size === 0 || sports.has(p.sport);
      const statusOk = statuses.size === 0 || statuses.has(p.status);
      return dimOk && sportOk && statusOk;
    });
    setExplorerResults(matched);
    setExplorerLabel(label);
  }

  function buildLabel(mins = sliderVals) {
    const parts: string[] = [];
    DIMS.forEach((d, i) => { if (mins[i] > 0) parts.push(`${d} ≥ ${mins[i]}%`); });
    if (sportFilter.size) parts.push([...sportFilter].join(" or "));
    if (statusFilter.size) parts.push([...statusFilter].join(" or "));
    return parts.length ? parts.join(" · ") : "All Pantheletes";
  }

  function toggleFilter(set: Set<string>, val: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  }

  const s: Record<string, React.CSSProperties> = {
    page:        { background: "#f5ede4", minHeight: "100vh", paddingBottom: 60 },
    banner:      { background: "rgba(232,180,76,0.1)", borderBottom: "1px solid rgba(232,180,76,0.3)", padding: "8px 48px", textAlign: "center", fontSize: 11, color: "#8B6914", fontStyle: "italic" },
    hero:        { background: "#1a1714", padding: "48px 48px 0", position: "relative", overflow: "hidden" },
    heroBgText:  { position: "absolute", right: -20, top: -30, fontSize: 220, lineHeight: "1", color: "rgba(255,255,255,0.025)", pointerEvents: "none", userSelect: "none", fontFamily: "'DM Serif Display', serif" },
    heroInner:   { position: "relative", zIndex: 1 },
    kicker:      { fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#e8b44c", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 },
    h1:          { fontFamily: "'DM Serif Display', serif", fontSize: "clamp(32px,4vw,50px)", color: "white", lineHeight: 1.05, marginBottom: 16 },
    statement:   { fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 560, marginBottom: 32, fontStyle: "italic", borderLeft: "2px solid rgba(232,180,76,0.3)", paddingLeft: 16 },
    statsRow:    { display: "flex", gap: 0, borderTop: "1px solid rgba(255,255,255,0.08)", justifyContent: "center" },
    statBlock:   { padding: "20px 40px", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 },
    statNum:     { fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#d97757", lineHeight: "1" },
    statLbl:     { fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)" },
    section:     { background: "#faf8f5", borderBottom: "1px solid #e0d8d0", padding: "32px 48px" },
    secLbl:      { fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#8a8580", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 },
    spotlight:   { background: "#1a1714", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" },
    spotHdr:     { padding: "28px 32px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" },
    spotLeft:    { display: "flex", flexDirection: "column" as const, gap: 16 },
    spotBadge:   { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#e8b44c", border: "1px solid rgba(232,180,76,0.3)", borderRadius: 20, padding: "4px 12px", background: "rgba(232,180,76,0.07)" },
    spotName:    { fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "white", lineHeight: 1.05, marginBottom: 4 },
    spotMeta:    { fontSize: 13, color: "rgba(255,255,255,0.65)", display: "flex", gap: 8, alignItems: "center" },
    spotCard:    { width: 96, height: 134, borderRadius: 8, flexShrink: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 8, color: "rgba(255,255,255,0.35)", fontSize: 28 },
    spotFooter:  { padding: "16px 32px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" as const },
    scoreNum:    { fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#d97757", lineHeight: "1" },
    scoreLbl:    { fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.65)", marginTop: 2 },
    gateChip:    { fontSize: 9, fontWeight: 700, padding: "4px 11px", borderRadius: 20, border: "1px solid rgba(26,122,109,0.5)", color: "rgba(255,255,255,0.8)", background: "rgba(26,122,109,0.15)", display: "flex", alignItems: "center", gap: 5 },
    domBadge:    { fontSize: 10, fontWeight: 800, padding: "5px 16px", borderRadius: 20, color: "white", letterSpacing: "0.04em", marginLeft: "auto" },
    navDot:      { width: 7, height: 7, borderRadius: "50%", border: "none", cursor: "pointer", transition: "all 0.15s", padding: 0 },
    // Recipe
    recipeSec:   { padding: "14px 32px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" },
    recipeLbl:   { fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.55)", marginBottom: 10 },
    recipeBar:   { display: "flex", height: 20, borderRadius: 5, overflow: "hidden", marginBottom: 10 },
    recipePills: { display: "flex", flexWrap: "wrap" as const, gap: 6 },
    // Explorer
    expWrap:     { background: "#f0e8df", borderRadius: 14, padding: "24px 28px", border: "1px solid #e0d8d0" },
    expTitle:    { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#3d3935", marginBottom: 4 },
    expSub:      { fontSize: 13, color: "#5a5550", marginBottom: 20 },
    preset:      { fontSize: 11, fontWeight: 700, padding: "7px 16px", borderRadius: 20, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.15s" },
    runBtn:      { width: "100%", padding: 12, borderRadius: 10, background: "#3d3935", color: "white", fontSize: 13, fontWeight: 800, cursor: "pointer", border: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.03em", transition: "background 0.15s", marginBottom: 18 },
    resultCard:  { background: "white", border: "1px solid #e0d8d0", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 8, cursor: "pointer", transition: "all 0.12s", textDecoration: "none" as const },
  };

  return (
    <div style={s.page}>

      {/* ── ILLUSTRATIVE BANNER ── */}
      {isIllustrative && (
        <div style={s.banner}>
          ⚠ Illustrative data — scoring engine not yet run · Updates when calculate_pantheon_score() executes
        </div>
      )}

      {/* ── HERO ── */}
      <div style={s.hero}>
        <div style={s.heroBgText} aria-hidden>Pantheon</div>
        <div style={s.heroInner}>
          <div style={s.kicker}>
            SGC Pantheon · Founding Class
            <span style={{ flex: 1, height: 1, background: "rgba(232,180,76,0.2)" }} />
          </div>
          <h1 style={s.h1}>
            Sports introduced us —<br />
            <em style={{ color: "#d97757", fontStyle: "italic" }}>her legacy is why she matters.</em>
          </h1>
          <p style={s.statement}>
            "The SGC Pantheon honors women whose impact reaches beyond the record book.
            Pure competitive dominance alone is not sufficient. Breadth of impact across dimensions is required."
          </p>
          <div style={s.statsRow}>
            {[
              { num: pantheleteCount, lbl: "Pantheletes" },
              { num: 6,               lbl: "Dimensions" },
              { num: "1,875",         lbl: "Score threshold" },
              { num: 4,               lbl: "Breadth required" },
            ].map((stat, i) => (
              <div key={i} style={{ ...s.statBlock, ...(i === 3 ? { borderRight: "none" } : {}) }}>
                <div style={s.statNum}>{stat.num}</div>
                <div style={s.statLbl}>{stat.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SPOTLIGHT ── */}
      <div style={s.section}>
        <div style={{ ...s.secLbl }}>
          Panthelete spotlight
          <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "rgba(139,34,82,0.1)", color: "#8B2252" }}>The Legacy</span>
          <span style={{ flex: 1, height: 1, background: "#e0d8d0" }} />
        </div>

        {canLegacy ? (
          <div style={s.spotlight}>
            <div style={s.spotHdr}>
              {/* Left: info + card */}
              <div style={s.spotLeft}>
                <div>
                  {spotPlayer.qualified && (
                    <div style={{ ...s.spotBadge, marginBottom: 10 }}>★ Panthelete · SGC Pantheon</div>
                  )}
                  <div style={s.spotName}>{spotPlayer.name}</div>
                  <div style={s.spotMeta}>
                    <span>{spotPlayer.sport}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{spotPlayer.team}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ textTransform: "capitalize" }}>{spotPlayer.status}</span>
                  </div>
                </div>
                <div style={s.spotCard}>
                  <span>🃏</span>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>Profile card</span>
                </div>
              </div>
              {/* Right: radar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8 }}>
                <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
                  Dimension profile
                </div>
                <RadarChart data={spotPlayer.c} domDim={spotPlayer.dom} size={260} />
              </div>
            </div>

            {/* Recipe */}
            <div style={s.recipeSec}>
              <div style={s.recipeLbl}>Her recipe — % of total legacy</div>
              <div style={s.recipeBar}>
                {DIMS.map((d, i) => {
                  const pcts = pctOfTotal(spotPlayer.c);
                  return (
                    <div key={d} style={{ width: `${pcts[i]}%`, height: "100%", background: DC[d] }}
                      title={`${d}: ${pcts[i]}%`} />
                  );
                })}
              </div>
              <div style={s.recipePills}>
                {DIMS.map((d, i) => {
                  const pcts = pctOfTotal(spotPlayer.c);
                  return (
                    <div key={d} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: DC[d], flexShrink: 0 }} />
                      <span>{d}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11 }}>{pcts[i]}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={s.spotFooter}>
              <div>
                <div style={s.scoreNum}>{spotPlayer.score.toLocaleString()}</div>
                <div style={s.scoreLbl}>Total score</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={s.gateChip}>✓ Score ≥ 1,875</div>
                <div style={s.gateChip}>✓ Breadth ≥ 4 dims</div>
                <div style={s.gateChip}>✓ No zero dims</div>
              </div>
              <div style={{ ...s.domBadge, background: DC[spotPlayer.dom as Dim] ?? "#888" }}>
                ★ {spotPlayer.dom}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
                Percentages only · raw scores never displayed
              </div>
            </div>

            {/* Dot nav */}
            <div style={{ padding: "12px 32px 16px", display: "flex", gap: 6, alignItems: "center" }}>
              {players.map((_, i) => (
                <button key={i}
                  style={{
                    ...s.navDot,
                    background: i === spotIdx ? "#d97757" : "rgba(255,255,255,0.15)",
                    transform: i === spotIdx ? "scale(1.3)" : "scale(1)",
                  }}
                  onClick={() => setSpotIdx(i)}
                  title={players[i].name}
                  aria-label={`View ${players[i].name}`}
                />
              ))}
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 10, fontStyle: "italic" }}>
                click a dot to switch profiles
              </span>
            </div>
          </div>
        ) : (
          <div style={{
            background: "rgba(139,34,82,0.04)", border: "1px solid rgba(139,34,82,0.15)",
            borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", gap: 12,
            fontSize: 13, color: "#5a5550",
          }}>
            <span>🔒</span>
            <span>
              Full Panthelete dimension profiles — radar charts, recipe breakdowns, and compare tools —
              are available with{" "}
              <a href="/membership" style={{ color: "#8B2252", fontWeight: 700, textDecoration: "none" }}>
                The Legacy →
              </a>
            </span>
          </div>
        )}
      </div>

      {/* ── PANTHEON ROLL ── */}
      <div style={s.section}>
        <div style={s.secLbl}>
          Pantheon roll · founding class
          <span style={{ flex: 1, height: 1, background: "#e0d8d0" }} />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e0d8d0" }}>
              {["#", "Panthelete", "Sport", "Legacy shape", "Dominant", "Score"].map((h, i) => (
                <th key={h} style={{
                  fontSize: 8, fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "#8a8580",
                  padding: "0 8px 10px", textAlign: i === 5 ? "right" : "left",
                  width: i === 0 ? 28 : i === 2 ? 90 : i === 3 ? 220 : i === 4 ? 110 : i === 5 ? 60 : undefined,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => {
              const pcts = pctOfTotal(p.c);
              return (
                <tr key={i}
                  style={{ borderBottom: "1px solid #e0d8d0",
                    background: p.qualified ? "rgba(232,180,76,0.03)" : "transparent" }}
                >
                  <td style={{ padding: "10px 8px", fontSize: 10, fontWeight: 800, color: "#8a8580" }}>{i + 1}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Name — click loads in spotlight */}
                      <button
                        onClick={() => { setSpotIdx(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: "#3d3935", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                      >
                        {p.qualified && <span style={{ color: "#e8b44c", fontSize: 11 }}>★</span>}
                        {p.name}
                        {!p.qualified && (
                          <span style={{ fontSize: 9, color: "#8a8580", fontStyle: "italic", fontFamily: "sans-serif" }}>
                            near miss
                          </span>
                        )}
                      </button>
                      {/* Player page link — separate */}
                      <a href={`/player/${p.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        title={`Go to ${p.name}'s player page`}
                        style={{ fontSize: 10, color: "#8a8580", textDecoration: "none", opacity: 0.6, transition: "opacity 0.12s", flexShrink: 0 }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                      >↗</a>
                    </div>
                  </td>
                  <td style={{ padding: "10px 8px", fontSize: 10, color: "#8a8580" }}>{p.sport}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <div style={{ display: "flex", height: 14, borderRadius: 3, overflow: "hidden" }}>
                      {DIMS.map((d, j) => (
                        <div key={d} style={{ width: `${pcts[j]}%`, height: "100%", background: DC[d] }}
                          title={`${d}: ${pcts[j]}%`} />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <span style={{ fontSize: 8, fontWeight: 800, padding: "3px 10px", borderRadius: 8, color: "white", background: DC[p.dom as Dim] ?? "#888" }}>
                      {p.dom}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", fontSize: 12, fontWeight: 700, color: "#3d3935", textAlign: "right", fontFamily: "monospace" }}>
                    {p.score.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 11, color: "#8a8580", fontStyle: "italic", marginTop: 14 }}>
          Sorted by total score · The Pantheon is a recognition, not a ranking · Percentages only
        </div>
      </div>

      {/* ── LEADERBOARDS ── */}
      <div style={s.section}>
        <div style={s.secLbl}>
          Top 5 by dimension
          <span style={{ flex: 1, height: 1, background: "#e0d8d0" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {DIMS.map((dim) => {
            const idx = DIMS.indexOf(dim);
            const top5 = [...players].sort((a, b) => b.c[idx] - a.c[idx]).slice(0, 5);
            return (
              <div key={dim} style={{ background: "white", border: "1px solid #e0d8d0", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "11px 16px", borderBottom: "1px solid #e0d8d0", background: DC[dim] + "08" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 8, color: "white", background: DC[dim] }}>
                    {dim}
                  </span>
                </div>
                {top5.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                    borderBottom: i < 4 ? "1px solid rgba(224,216,208,0.5)" : "none",
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#8a8580", width: 14 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 11, color: "#3d3935", fontWeight: 600 }}>{p.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 8, color: "white", background: DC[dim] }}>
                      {p.c[idx]}%
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── COMPARE (Legacy only) ── */}
      {canLegacy && (
        <div style={s.section}>
          <div style={s.secLbl}>
            Compare Pantheletes
            <span style={{ flex: 1, height: 1, background: "#e0d8d0" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12, gap: 0 }}>
            {(["radar", "recipe"] as const).map((v) => (
              <button key={v}
                onClick={() => setCompareView(v)}
                style={{
                  fontSize: 10, fontWeight: 700, padding: "5px 14px",
                  background: compareView === v ? "rgba(61,57,53,0.1)" : "transparent",
                  border: "1px solid #e0d8d0", borderRadius: v === "radar" ? "8px 0 0 8px" : "0 8px 8px 0",
                  color: compareView === v ? "#3d3935" : "#8a8580",
                  cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginLeft: v === "radar" ? 0 : -1,
                }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {([
              { idx: compareA, setIdx: setCompareA },
              { idx: compareB, setIdx: setCompareB },
            ] as const).map(({ idx, setIdx }, side) => {
              const p = players[idx] ?? players[0];
              return (
                <div key={side} style={{ background: "#1a1714", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <select
                      value={idx}
                      onChange={(e) => setIdx(Number(e.target.value))}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8, cursor: "pointer", outline: "none" }}
                    >
                      {players.map((pl, i) => (
                        <option key={i} value={i} style={{ background: "#3d3935" }}>{pl.name}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 8, color: "white", background: DC[p.dom as Dim] ?? "#888" }}>
                      {p.dom}
                    </span>
                  </div>

                  {compareView === "radar" ? (
                    <div style={{ padding: "16px 20px" }}>
                      <RadarChart data={p.c} domDim={p.dom} size={220} />
                    </div>
                  ) : (
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", height: 16, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                        {DIMS.map((d, i) => {
                          const pcts = pctOfTotal(p.c);
                          return <div key={d} style={{ width: `${pcts[i]}%`, height: "100%", background: DC[d] }} title={`${d}: ${pcts[i]}%`} />;
                        })}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {DIMS.map((d, i) => {
                          const pcts = pctOfTotal(p.c);
                          return (
                            <div key={d} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
                              <span style={{ width: 8, height: 8, borderRadius: 2, background: DC[d] }} />
                              {d} <span style={{ fontFamily: "monospace" }}>{pcts[i]}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#d97757" }}>{p.score.toLocaleString()}</div>
                      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Total score</div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      {p.qualified ? (
                        <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 10, background: "rgba(232,180,76,0.15)", border: "1px solid rgba(232,180,76,0.3)", color: "#e8b44c" }}>★ Panthelete</span>
                      ) : (
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                          {p.score.toLocaleString()} / 1,875 needed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── EXPLORER ── */}
      <div style={s.section}>
        <div style={s.secLbl}>
          Pantheon explorer
          <span style={{ flex: 1, height: 1, background: "#e0d8d0" }} />
        </div>
        <div style={s.expWrap}>
          <div style={s.expTitle}>Who are you looking for?</div>
          <div style={s.expSub}>Choose a preset story, or build your own filter across dimensions, sport, and status.</div>

          <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8580", marginBottom: 8 }}>
            Preset stories
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18, alignItems: "center" }}>
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button key={key}
                onClick={() => applyPreset(key)}
                style={{
                  ...s.preset,
                  background: activePreset === key ? "#d97757" : "white",
                  border: activePreset === key ? "1px solid #d97757" : "1px solid #ccc5ba",
                  color: activePreset === key ? "white" : "#5a5550",
                }}
              >
                {preset.label.split(" — ")[0]}
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: "#e0d8d0", margin: "0 0 18px" }} />

          <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a8580", marginBottom: 10 }}>
            Minimum dimension %
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {DIMS.map((d, i) => (
              <div key={d} style={{ background: "white", border: "1px solid #e0d8d0", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: DC[d] }}>{d}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: DC[d], fontFamily: "monospace" }}>{sliderVals[i]}%+</span>
                </div>
                <input type="range" min={0} max={100} step={5} value={sliderVals[i]}
                  onChange={(e) => {
                    const next = [...sliderVals];
                    next[i] = Number(e.target.value);
                    setSliderVals(next);
                    setActivePreset(null);
                  }}
                  style={{ width: "100%", accentColor: DC[d] }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8580", marginBottom: 6 }}>Sport</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {sports.map((sp) => (
                  <button key={sp}
                    onClick={() => toggleFilter(sportFilter, sp, setSportFilter)}
                    style={{ fontSize: 10, fontWeight: 700, padding: "4px 11px", borderRadius: 20, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.12s", background: sportFilter.has(sp) ? "#3d3935" : "white", border: `1px solid ${sportFilter.has(sp) ? "#3d3935" : "#ccc5ba"}`, color: sportFilter.has(sp) ? "white" : "#5a5550" }}
                  >{sp}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8580", marginBottom: 6 }}>Status</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {statuses.map((st) => (
                  <button key={st}
                    onClick={() => toggleFilter(statusFilter, st, setStatusFilter)}
                    style={{ fontSize: 10, fontWeight: 700, padding: "4px 11px", borderRadius: 20, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: "capitalize", transition: "all 0.12s", background: statusFilter.has(st) ? "#3d3935" : "white", border: `1px solid ${statusFilter.has(st) ? "#3d3935" : "#ccc5ba"}`, color: statusFilter.has(st) ? "white" : "#5a5550" }}
                  >{st}</button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => runQuery()} style={s.runBtn}>Find Pantheletes →</button>

          {explorerResults !== null && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#3d3935" }}>
                  {explorerResults.length} Panthelete{explorerResults.length !== 1 ? "s" : ""} match
                </span>
                <span style={{ fontSize: 11, color: "#8a8580", fontStyle: "italic" }}>{explorerLabel}</span>
              </div>
              {explorerResults.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "#8a8580", fontStyle: "italic", fontSize: 13 }}>
                  No Pantheletes match these criteria — try loosening the filters.
                </div>
              ) : (
                explorerResults.map((p, i) => {
                  const top3 = DIMS.map((d, j) => ({ d, v: p.c[j] })).sort((a, b) => b.v - a.v).slice(0, 3);
                  return (
                    <a key={i} href={`/player/${p.slug}`} style={s.resultCard}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: (DC[p.dom as Dim] ?? "#888") + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 16, color: DC[p.dom as Dim] ?? "#888" }}>◆</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: "#3d3935" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "#8a8580", marginTop: 2 }}>{p.sport}</div>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {top3.map(({ d, v }) => (
                          <span key={d} style={{ fontSize: 8, fontWeight: 800, padding: "3px 8px", borderRadius: 8, color: "white", background: DC[d] }}>{d} {v}%</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#3d3935", minWidth: 42, textAlign: "right", fontFamily: "monospace" }}>
                        {p.score.toLocaleString()}
                      </span>
                    </a>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── GATE CALLOUT ── */}
      <div style={{ ...s.section, borderBottom: "none" }}>
        <div style={{ background: "rgba(139,34,82,0.04)", border: "1px solid rgba(139,34,82,0.15)", borderRadius: 10, padding: "16px 20px", display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[
            { lbl: "Gate 1 — Score",      val: "≥ 1,875 pts total",            note: "Across all six dimensions combined" },
            { lbl: "Gate 2 — Breadth",    val: "≥ 4 of 6 dims above 20%",      note: "At least 50 pts in four dimensions" },
            { lbl: "Gate 3 — No zeros",   val: "Every dimension present",      note: "Some presence required in all six" },
            { lbl: "The editorial truth", val: "Legacy beyond the record book", note: "Competitive dominance alone is not sufficient" },
          ].map((g, i) => (
            <div key={i} style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8580" }}>{g.lbl}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#3d3935", marginTop: 3 }}>{g.val}</div>
              <div style={{ fontSize: 10, color: "#8a8580", marginTop: 2 }}>{g.note}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
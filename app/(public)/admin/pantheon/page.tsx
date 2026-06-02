// app/(public)/admin/pantheon/page.tsx
// Temporary admin page to trigger Pantheon scoring engine
// Remove or protect this page after calibration is complete

"use client";

import { useState } from "react";

const BENCHMARK_PLAYERS = [
  { de_id: "PLAY000020", name: "Tamika Catchings" },
  { de_id: "PLAY000024", name: "Sue Bird" },
  { de_id: "PLAY000026", name: "Elena Delle Donne" },
  { de_id: "PLAY000033", name: "Maya Moore" },
  { de_id: "PLAY000021", name: "Teresa Weatherspoon" },
  { de_id: "PLAY000017", name: "Kim Perrot" },
  { de_id: "PLAY000058", name: "Renee Montgomery" },
];

export default function PantheonAdminPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [allLoading, setAllLoading] = useState(false);

  async function scoreOne(deId: string, name: string) {
    setLoading(deId);
    try {
      const res = await fetch(`/api/pantheon/score?player=${deId}`, {
        method: "POST",
      });
      const data = await res.json();
      setResults((prev) => ({ ...prev, [deId]: data }));
    } catch (err) {
      setResults((prev) => ({ ...prev, [deId]: { error: String(err) } }));
    } finally {
      setLoading(null);
    }
  }

  async function scoreAll() {
    setAllLoading(true);
    try {
      const res = await fetch(`/api/pantheon/score`, { method: "POST" });
      const data = await res.json();
      setResults((prev) => ({ ...prev, ALL: data }));
    } catch (err) {
      setResults((prev) => ({ ...prev, ALL: { error: String(err) } }));
    } finally {
      setAllLoading(false);
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "0 auto", fontFamily: "monospace" }}>
      <h1 style={{ fontFamily: "serif", fontSize: 28, marginBottom: 8 }}>
        SGC Pantheon — Scoring Admin
      </h1>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 32 }}>
        Temporary calibration tool · Remove after gate is set
      </p>

      {/* Score all */}
      <div style={{ marginBottom: 32, padding: 20, background: "#1a1714", borderRadius: 10 }}>
        <button
          onClick={scoreAll}
          disabled={allLoading}
          style={{
            padding: "10px 24px", background: "#d97757", color: "white",
            border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700,
            cursor: allLoading ? "not-allowed" : "pointer", opacity: allLoading ? 0.6 : 1,
            fontFamily: "monospace",
          }}
        >
          {allLoading ? "Scoring all players..." : "▶ Score ALL Players"}
        </button>
        {results.ALL && (
          <pre style={{ marginTop: 16, color: "#e8b44c", fontSize: 12, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(results.ALL, null, 2)}
          </pre>
        )}
      </div>

      {/* Benchmark players */}
      <h2 style={{ fontSize: 16, marginBottom: 16, fontFamily: "serif" }}>Benchmark Players</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {BENCHMARK_PLAYERS.map(({ de_id, name }) => (
          <div key={de_id} style={{
            background: "#faf8f5", border: "1px solid #e0d8d0",
            borderRadius: 10, padding: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#8a8580", width: 100 }}>{de_id}</span>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "serif", flex: 1 }}>{name}</span>
              <button
                onClick={() => scoreOne(de_id, name)}
                disabled={loading === de_id}
                style={{
                  padding: "6px 16px", background: "#3d3935", color: "white",
                  border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700,
                  cursor: loading === de_id ? "not-allowed" : "pointer",
                  opacity: loading === de_id ? 0.6 : 1, fontFamily: "monospace",
                }}
              >
                {loading === de_id ? "Scoring..." : "Score →"}
              </button>
            </div>

            {results[de_id] && (
              <div>
                {results[de_id].error ? (
                  <p style={{ color: "red", fontSize: 12 }}>{results[de_id].error}</p>
                ) : (
                  <div>
                    <div style={{ display: "flex", gap: 20, marginBottom: 8, fontSize: 12 }}>
                      <span><strong>Total:</strong> {results[de_id].total_score}</span>
                      <span><strong>Dominant:</strong> {results[de_id].dominant}</span>
                      <span><strong>Panthelete:</strong> {results[de_id].is_panthelete ? "✓ YES" : "✗ NO"}</span>
                      <span><strong>Dims ≥20%:</strong> {results[de_id].dims_above_20pct}</span>
                    </div>
                    {results[de_id].dimensions && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {results[de_id].dimensions.map((d: any) => (
                          <span key={d.dimension} style={{
                            fontSize: 10, padding: "3px 10px", borderRadius: 20,
                            background: {
                              Champion: "#B5333E", Pioneer: "#1A7A6D", Legend: "#6B3A7A",
                              Advocate: "#B57A14", Sage: "#3A4A8B", Muse: "#D4622A",
                            }[d.dimension as string] ?? "#888",
                            color: "white", fontWeight: 700,
                          }}>
                            {d.dimension} {d.capped_score}pts ({d.pct_ceiling}%)
                            {d.is_a_plus && " A+"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
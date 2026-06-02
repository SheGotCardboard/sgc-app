"use client";

import { useState, useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────

type AchievementChip = {
  tier_code:     string;
  tier_sort:     number;
  display_color: string;
  category_name: string;
  count:         number;
};

type Player = {
  player_id:                 string;
  first_name:                string;
  last_name:                 string;
  preferred_name:            string | null;
  birthdate:                 string | null;
  player_status:             string;
  seo_description:           string | null;
  slug:                      string;
  sport_name:                string | null;
  sport_icon:                string | null;
  most_recent_league:        string | null;
  most_recent_league_abbrev: string | null;
  most_recent_team:          string | null;
  known_for_team:            string | null; // editorial override, already resolved in page.tsx
  card_filename:             string | null;
  achievement_chips:         AchievementChip[];
  achievement_total:         number;
};

type SportOption = {
  sport_name: string;
  sort_order: number;
  icon:       string | null;
};

type Props = {
  players:         Player[];
  pinnedSports:    SportOption[];
  alphaSports:     SportOption[];
  isAuthenticated: boolean;
  storageUrl:      string;
};

// ── Constants ─────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  active:   "Active",
  retired:  "Retired",
  college:  "College",
  overseas: "Overseas",
  inactive: "Inactive",
};

const TIER_CLASS: Record<string, string> = {
  I:   "chip-i",
  II:  "chip-ii",
  III: "chip-iii",
  IV:  "chip-iv",
  V:   "chip-v",
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ── Helpers ───────────────────────────────────────────────────

function formatBirthdate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function getDisplayName(p: Player) {
  return p.preferred_name ?? `${p.first_name} ${p.last_name}`;
}

function getLetterKey(p: Player) {
  return p.last_name.charAt(0).toUpperCase();
}

function getSortKey(p: Player) {
  return p.last_name.toLowerCase() + p.first_name.toLowerCase();
}

// ── PlayerRow ─────────────────────────────────────────────────

function PlayerRow({
  player,
  storageUrl,
  isOpen,
  onToggle,
}: {
  player:     Player;
  storageUrl: string;
  isOpen:     boolean;
  onToggle:   () => void;
}) {
  const displayName   = getDisplayName(player);
  const statusLabel   = STATUS_LABELS[player.player_status] ?? player.player_status;
  const isActive      = player.player_status === "active";
  const isRetired     = player.player_status === "retired";
  const chips         = player.achievement_chips.slice(0, 10);
  const overflowCount = player.achievement_chips.length - chips.length;

  // Team line in expanded panel — known_for_team takes priority
  const teamLine = player.known_for_team ?? player.most_recent_team ?? "—";
  const leagueLabel = player.most_recent_league_abbrev ?? player.most_recent_league ?? "—";

  return (
    <div className={`pr${isOpen ? " pr-open" : ""}`}>

      {/* ── COLLAPSED ROW ── */}
      <button
        className="pr-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="pr-col pr-col-name">
          <span className="pr-name">{displayName}</span>
          {player.sport_name && (
            <span className="pr-sport-tag">
              {player.sport_icon && <span>{player.sport_icon}</span>}
              {player.sport_name}
            </span>
          )}
        </div>
        <span className="pr-col pr-col-league">{leagueLabel}</span>
        <span className="pr-col pr-col-team">{teamLine}</span>
        <span className="pr-col pr-col-status">
          <span className={[
            "pr-status-badge",
            isActive  ? "pr-status-active"  : "",
            isRetired ? "pr-status-retired" : "",
          ].join(" ")}>
            {statusLabel}
          </span>
        </span>
        <span className={`pr-chevron${isOpen ? " pr-chevron-open" : ""}`}>▾</span>
      </button>

      {/* ── EXPANDED PANEL ── */}
      {isOpen && (
        <div className="pr-card">
          <div className="pr-card-inner">

            {/* Card image */}
            <div className="pr-card-img-wrap">
              {player.card_filename ? (
                <img
                  src={`${storageUrl}/${player.card_filename}`}
                  alt={displayName}
                  className="pr-card-img"
                />
              ) : (
                <div className="pr-card-img-ph">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.25">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="pr-card-details">
              <div className="pr-card-name">{displayName}</div>

              <div className="pr-card-meta">
                {player.sport_icon && <span>{player.sport_icon}</span>}
                {player.sport_name && <span>{player.sport_name}</span>}
                {player.birthdate && (
                  <>
                    <span className="pr-dot">·</span>
                    <span>b. {formatBirthdate(player.birthdate)}</span>
                  </>
                )}
              </div>

              {/* Achievement chips */}
              {chips.length > 0 && (
                <div className="pr-chip-wrap">
                  <div className="pr-chip-label">Achievements</div>
                  <div className="pr-chips">
                    {chips.map((chip, i) => (
                      <span
                        key={i}
                        className={`pr-chip ${TIER_CLASS[chip.tier_code] ?? ""}`}
                        title={chip.category_name}
                      >
                        <span className={`pr-chip-dot pr-dot-${chip.tier_code.toLowerCase()}`} />
                        {chip.count > 1 && (
                          <span className="pr-chip-count">{chip.count}×&nbsp;</span>
                        )}
                        {chip.category_name}
                      </span>
                    ))}
                    {overflowCount > 0 && (
                      <span className="pr-chip-more">+{overflowCount} more →</span>
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              {player.seo_description && (
                <p className="pr-card-bio">{player.seo_description}</p>
              )}

              {/* Single team line — known_for_team priority */}
              {teamLine !== "—" && (
                <div className="pr-team-line">
                  <span className="pr-team-league">{leagueLabel}</span>
                  <span className="pr-team-name">{teamLine}</span>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="pr-card-footer">
            <a href={`/player/${player.slug}`} className="pr-profile-cta">
              View Full Profile →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function PlayerAccordion({
  players,
  pinnedSports,
  alphaSports,
  storageUrl,
}: Props) {
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState<"all" | "active" | "retired">("all");
  const [sport,   setSport]   = useState("");
  const [sortDir, setSortDir] = useState<"az" | "za">("az");
  const [openId,  setOpenId]  = useState<string | null>(null);

  // ── Filtered + sorted
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return players
      .filter(p => {
        const name = getDisplayName(p).toLowerCase();
        const matchSearch = !q || name.includes(q);
        const matchStatus = status === "all" || p.player_status === status;
        const matchSport  = !sport || p.sport_name === sport;
        return matchSearch && matchStatus && matchSport;
      })
      .sort((a, b) => {
        const ka = getSortKey(a);
        const kb = getSortKey(b);
        return sortDir === "az" ? ka.localeCompare(kb) : kb.localeCompare(ka);
      });
  }, [players, search, status, sport, sortDir]);

  // ── Alpha groups
  const grouped = useMemo(() => {
    const map: Record<string, Player[]> = {};
    filtered.forEach(p => {
      const L = getLetterKey(p);
      if (!map[L]) map[L] = [];
      map[L].push(p);
    });
    const letters = Object.keys(map).sort(
      sortDir === "az"
        ? (a, b) => a.localeCompare(b)
        : (a, b) => b.localeCompare(a)
    );
    return letters.map(L => ({ letter: L, players: map[L] }));
  }, [filtered, sortDir]);

  const liveLetters = new Set(grouped.map(g => g.letter));
  const hasFilters  = !!(search || status !== "all" || sport);

  function clearAll() {
    setSearch(""); setStatus("all"); setSport(""); setSortDir("az");
  }

  function scrollToLetter(L: string) {
    document.getElementById(`alpha-sec-${L}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="pa-wrap">
      <style>{`
        /* ══ CONTROL BAR ══════════════════════════════════════ */
        .pa-controls {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          padding: 13px 20px;
          background: var(--warm-white);
          border-radius: 12px 12px 0 0;
          border: 1px solid var(--border); border-bottom: none;
        }
        .pa-search-wrap { flex: 1; min-width: 180px; position: relative; }
        .pa-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); font-size: 13px; color: var(--slate-ghost); pointer-events: none; }
        .pa-search {
          width: 100%; padding: 7px 12px 7px 32px;
          font-family: var(--font-body); font-size: 13px; color: var(--slate);
          background: var(--soft-cream); border: 1px solid var(--border-strong);
          border-radius: 8px; outline: none; transition: border-color 0.15s;
        }
        .pa-search:focus { border-color: var(--terracotta); }
        .pa-search::placeholder { color: var(--slate-ghost); }
        .pa-sep { width: 1px; height: 22px; background: var(--border); flex-shrink: 0; }
        .pa-pills { display: flex; gap: 4px; }
        .pa-pill {
          font-size: 11px; font-weight: 700; padding: 5px 13px; border-radius: 20px;
          border: 1px solid var(--border-strong); background: transparent; color: var(--slate-soft);
          cursor: pointer; transition: all 0.13s; font-family: var(--font-body);
        }
        .pa-pill:hover { background: var(--soft-cream); color: var(--slate); }
        .pa-pill.pa-pill-on        { background: var(--slate);  color: white; border-color: var(--slate); }
        .pa-pill.pa-active-active  { background: #4a7856;       color: white; border-color: #4a7856; }
        .pa-pill.pa-active-retired { background: #34567A;       color: white; border-color: #34567A; }
        .pa-sport-select {
          font-family: var(--font-body); font-size: 12px; font-weight: 600;
          color: var(--slate); background: var(--soft-cream);
          border: 1px solid var(--border-strong); border-radius: 8px;
          padding: 6px 30px 6px 11px; outline: none; cursor: pointer;
          appearance: none; -webkit-appearance: none; min-width: 148px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238a8580'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 10px center;
          transition: border-color 0.13s;
        }
        .pa-sport-select:focus { border-color: var(--terracotta); }
        .pa-sport-select.pa-sport-active { border-color: var(--terracotta); color: var(--terracotta); }
        .pa-sort-wrap { display: flex; align-items: center; gap: 6px; margin-left: auto; }
        .pa-sort-label { font-size: 10px; font-weight: 700; color: var(--slate-ghost); text-transform: uppercase; letter-spacing: 0.07em; white-space: nowrap; }
        .pa-sort-select {
          font-family: var(--font-body); font-size: 12px; font-weight: 600;
          color: var(--slate); background: var(--soft-cream);
          border: 1px solid var(--border-strong); border-radius: 8px;
          padding: 6px 28px 6px 10px; outline: none; cursor: pointer;
          appearance: none; -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238a8580'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 9px center;
        }

        /* ══ ALPHA JUMP ═══════════════════════════════════════ */
        .pa-alpha-bar {
          display: flex; align-items: center; gap: 1px; padding: 6px 20px;
          background: var(--soft-cream);
          border: 1px solid var(--border);
          border-top: 1px solid var(--border-strong);
          border-bottom: none; overflow-x: auto;
        }
        .pa-alpha-label { font-size: 9px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--slate-ghost); margin-right: 8px; flex-shrink: 0; }
        .pa-alpha-btn {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600;
          width: 22px; height: 22px; border-radius: 4px; border: none; background: transparent;
          color: var(--slate-ghost); display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; opacity: 0.25; cursor: default; transition: all 0.12s;
        }
        .pa-alpha-btn.pa-alpha-live { opacity: 1; color: var(--slate-soft); cursor: pointer; }
        .pa-alpha-btn.pa-alpha-live:hover { background: var(--terracotta); color: white; }

        /* ══ DIRECTORY SHELL ══════════════════════════════════ */
        .pa-directory {
          background: var(--warm-white);
          border: 1px solid var(--border); border-top: none;
          border-radius: 0 0 14px 14px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .pa-disclaimer {
          padding: 10px 24px;
          background: rgba(201,146,26,0.05);
          border-bottom: 1px solid rgba(201,146,26,0.15);
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; color: var(--slate-soft); line-height: 1.5;
        }
        .pa-disclaimer strong { color: var(--slate); }
        .pa-disclaimer a { color: var(--terracotta); font-weight: 700; cursor: pointer; border-bottom: 1px solid rgba(217,119,87,0.3); text-decoration: none; }
        .pa-results-bar {
          padding: 7px 24px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .pa-results-count { font-size: 11px; color: var(--slate-ghost); font-weight: 600; }
        .pa-results-clear { font-size: 11px; font-weight: 700; color: var(--terracotta); cursor: pointer; background: none; border: none; font-family: var(--font-body); padding: 0; }
        .pa-results-clear:hover { text-decoration: underline; }

        /* Alpha divider */
        .pa-alpha-divider {
          padding: 6px 24px;
          background: linear-gradient(90deg, rgba(61,57,53,0.03) 0%, transparent 100%);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px;
          scroll-margin-top: 130px;
        }
        .pa-alpha-divider-letter { font-family: var(--font-display); font-size: 18px; color: var(--terracotta); line-height: 1; width: 18px; flex-shrink: 0; }
        .pa-alpha-divider-line   { flex: 1; height: 1px; background: var(--border); }
        .pa-alpha-divider-count  { font-size: 10px; font-weight: 700; color: var(--slate-ghost); }

        /* ══ PLAYER ROW ═══════════════════════════════════════ */
        .pr { border-bottom: 1px solid var(--border); }
        .pr:last-child { border-bottom: none; }
        .pr-header {
          width: 100%; background: none; border: none; cursor: pointer; text-align: left;
          display: grid;
          grid-template-columns: 1fr 130px 170px auto 20px;
          gap: 12px; align-items: center; padding: 12px 24px;
          font-family: var(--font-body); transition: background 0.1s;
        }
        .pr-header:hover { background: rgba(0,0,0,0.012); }
        .pr-col { display: flex; align-items: center; min-width: 0; }
        .pr-col-name { flex-direction: column; align-items: flex-start; gap: 1px; }
        .pr-name { font-weight: 700; font-size: 14px; color: var(--slate); line-height: 1.2; }
        .pr-sport-tag { font-size: 11px; color: var(--slate-ghost); display: flex; align-items: center; gap: 3px; }
        .pr-col-league { font-size: 12px; color: var(--slate-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pr-col-team   { font-size: 12px; color: var(--slate-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pr-status-badge {
          font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          padding: 3px 10px; border-radius: 12px; white-space: nowrap;
          border: 1px solid var(--border); color: var(--slate-soft);
        }
        .pr-status-active  { background: rgba(74,120,86,0.08);  color: #4a7856; border-color: rgba(74,120,86,0.25); }
        .pr-status-retired { background: rgba(52,86,122,0.07);  color: #5478A0; border-color: rgba(52,86,122,0.2); }
        .pr-chevron { font-size: 11px; color: var(--slate-ghost); transition: transform 0.25s; text-align: center; }
        .pr-chevron-open { transform: rotate(180deg); }

        /* ══ EXPANDED CARD ════════════════════════════════════ */
        .pr-card { background: var(--warm-white); border-top: 1px solid rgba(224,216,208,0.5); }
        .pr-card-inner {
          display: grid; grid-template-columns: 88px 1fr;
          gap: 20px; padding: 18px 24px 14px;
        }
        .pr-card-img-wrap { display: flex; align-items: flex-start; }
        .pr-card-img {
          width: 88px; height: 123px; object-fit: cover; object-position: center top;
          border-radius: 7px; box-shadow: 0 2px 10px rgba(61,57,53,0.12);
          cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
        }
        .pr-card-img:hover { transform: translateY(-3px) rotate(0.5deg); box-shadow: 0 8px 20px rgba(61,57,53,0.16); }
        .pr-card-img-ph {
          width: 88px; height: 123px; border-radius: 7px;
          background: var(--parchment); border: 1px solid var(--border-strong);
          display: flex; align-items: center; justify-content: center;
          color: var(--slate-ghost); opacity: 0.4;
        }
        .pr-card-details { display: flex; flex-direction: column; gap: 10px; padding-top: 2px; }
        .pr-card-name { font-family: var(--font-display); font-size: 19px; color: var(--slate); line-height: 1.15; }
        .pr-card-meta { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--slate-ghost); flex-wrap: wrap; }
        .pr-dot { color: var(--slate-ghost); }

        /* Achievement chips */
        .pr-chip-wrap { display: flex; flex-direction: column; gap: 5px; }
        .pr-chip-label { font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--slate-ghost); }
        .pr-chips { display: flex; flex-wrap: wrap; gap: 5px; }
        .pr-chip {
          font-size: 10px; font-weight: 700; padding: 3px 9px 3px 7px; border-radius: 20px;
          display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
          cursor: default; transition: transform 0.12s;
        }
        .pr-chip:hover { transform: scale(1.05); }
        .chip-i   { background: #F2E3EB; color: #8B2252; border: 1px solid rgba(139,34,82,0.2); }
        .chip-ii  { background: #E2EAF2; color: #34567A; border: 1px solid rgba(52,86,122,0.2); }
        .chip-iii { background: #DFF0ED; color: #1A7A6D; border: 1px solid rgba(26,122,109,0.2); }
        .chip-iv  { background: #F2ECDA; color: #8B6914; border: 1px solid rgba(139,105,20,0.2); }
        .chip-v   { background: #EDF0E2; color: #6B7A3A; border: 1px solid rgba(107,122,58,0.2); }
        .pr-chip-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .pr-dot-i   { background: #8B2252; }
        .pr-dot-ii  { background: #34567A; }
        .pr-dot-iii { background: #1A7A6D; }
        .pr-dot-iv  { background: #8B6914; }
        .pr-dot-v   { background: #6B7A3A; }
        .pr-chip-count { font-weight: 800; }
        .pr-chip-more {
          font-size: 10px; font-weight: 700; color: var(--slate-soft);
          background: var(--soft-cream); border: 1px dashed var(--border-strong);
          padding: 3px 10px; border-radius: 20px; cursor: pointer; white-space: nowrap;
          transition: all 0.15s;
        }
        .pr-chip-more:hover { background: var(--parchment); color: var(--terracotta); border-color: var(--terracotta); }

        .pr-card-bio { font-size: 13px; color: var(--slate-soft); line-height: 1.65; }

        /* Single team line */
        .pr-team-line { display: flex; flex-direction: column; gap: 1px; }
        .pr-team-league { font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--slate-ghost); }
        .pr-team-name   { font-size: 12px; color: var(--slate-soft); }

        /* Footer */
        .pr-card-footer {
          padding: 10px 24px 14px;
          border-top: 1px solid var(--border);
          display: flex; justify-content: flex-end;
        }
        .pr-profile-cta {
          font-size: 11px; font-weight: 800; padding: 6px 16px; border-radius: 8px;
          background: transparent; border: 1px solid var(--border-strong);
          color: var(--slate-soft); cursor: pointer; transition: all 0.14s;
          font-family: var(--font-body); text-decoration: none; display: inline-block;
        }
        .pr-profile-cta:hover { background: var(--terracotta); border-color: var(--terracotta); color: white; }

        /* ══ EMPTY STATE ══════════════════════════════════════ */
        .pa-empty { padding: 48px 24px; text-align: center; }
        .pa-empty-text { font-size: 14px; color: var(--slate-ghost); margin-bottom: 8px; }
        .pa-empty-reset { font-size: 12px; font-weight: 700; color: var(--terracotta); cursor: pointer; background: none; border: none; font-family: var(--font-body); }
        .pa-empty-reset:hover { text-decoration: underline; }

        /* ══ RESPONSIVE ═══════════════════════════════════════ */
        @media (max-width: 768px) {
          .pr-header { grid-template-columns: 1fr auto 20px; }
          .pr-col-league, .pr-col-team { display: none; }
          .pa-sort-wrap { margin-left: 0; }
        }
        @media (max-width: 500px) {
          .pr-card-inner { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── CONTROL BAR ── */}
      <div className="pa-controls">
        <div className="pa-search-wrap">
          <span className="pa-search-icon">🔍</span>
          <input
            type="text"
            className="pa-search"
            placeholder="Search players…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="pa-sep" />

        <div className="pa-pills">
          {(["all", "active", "retired"] as const).map(s => (
            <button
              key={s}
              className={[
                "pa-pill",
                status === s ? "pa-pill-on" : "",
                status === s && s === "active"  ? "pa-active-active"  : "",
                status === s && s === "retired" ? "pa-active-retired" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => setStatus(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="pa-sep" />

        <select
          className={`pa-sport-select${sport ? " pa-sport-active" : ""}`}
          value={sport}
          onChange={e => setSport(e.target.value)}
        >
          <option value="">All Sports</option>
          <optgroup label="──────────────">
            {pinnedSports.map(s => (
              <option key={s.sport_name} value={s.sport_name}>{s.sport_name}</option>
            ))}
          </optgroup>
          <optgroup label="──────────────">
            {alphaSports.map(s => (
              <option key={s.sport_name} value={s.sport_name}>{s.sport_name}</option>
            ))}
          </optgroup>
        </select>

        <div className="pa-sort-wrap">
          <span className="pa-sort-label">Sort</span>
          <select
            className="pa-sort-select"
            value={sortDir}
            onChange={e => setSortDir(e.target.value as "az" | "za")}
          >
            <option value="az">Last Name A–Z</option>
            <option value="za">Last Name Z–A</option>
          </select>
        </div>
      </div>

      {/* ── ALPHA JUMP ── */}
      <div className="pa-alpha-bar">
        <span className="pa-alpha-label">Jump</span>
        {ALPHABET.map(L => (
          <button
            key={L}
            className={`pa-alpha-btn${liveLetters.has(L) ? " pa-alpha-live" : ""}`}
            onClick={() => liveLetters.has(L) && scrollToLetter(L)}
            tabIndex={liveLetters.has(L) ? 0 : -1}
            aria-hidden={!liveLetters.has(L)}
          >
            {L}
          </button>
        ))}
      </div>

      {/* ── DIRECTORY ── */}
      <div className="pa-directory">

        <div className="pa-disclaimer">
          <span>📋</span>
          <span>
            A curated snapshot — key achievements and a brief biography.{" "}
            <strong>Full career histories, complete achievements by tier, and card galleries</strong>{" "}
            are available with <a href="/membership">The Chronicle →</a>
          </span>
        </div>

        <div className="pa-results-bar">
          <span className="pa-results-count">
            {filtered.length === players.length
              ? `${players.length} players`
              : `${filtered.length} of ${players.length} players`}
          </span>
          {hasFilters && (
            <button className="pa-results-clear" onClick={clearAll}>
              Clear filters ×
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="pa-empty">
            <p className="pa-empty-text">No players match your current filters.</p>
            <button className="pa-empty-reset" onClick={clearAll}>Reset filters</button>
          </div>
        ) : (
          grouped.map(({ letter, players: group }) => (
            <div key={letter}>
              <div className="pa-alpha-divider" id={`alpha-sec-${letter}`}>
                <span className="pa-alpha-divider-letter">{letter}</span>
                <span className="pa-alpha-divider-line" />
                <span className="pa-alpha-divider-count">
                  {group.length} {group.length === 1 ? "player" : "players"}
                </span>
              </div>
              {group.map(player => (
                <PlayerRow
                  key={player.player_id}
                  player={player}
                  storageUrl={storageUrl}
                  isOpen={openId === player.player_id}
                  onToggle={() =>
                    setOpenId(prev => prev === player.player_id ? null : player.player_id)
                  }
                />
              ))}
            </div>
          ))
        )}

      </div>
    </div>
  );
}

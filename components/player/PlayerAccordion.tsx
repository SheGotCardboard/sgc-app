"use client";

import { useState } from "react";

type Honor = {
  honor_name: string;
  honor_short_name: string | null;
  honor_code: string;
  category_value: string;
  icon: string | null;
};

type Team = {
  team_name: string;
  league_name: string;
  league_abbrev: string | null;
  season_year: number;
};

type Player = {
  player_id: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  birthdate: string | null;
  player_status: string;
  seo_description: string | null;
  slug: string;
  sport_name: string | null;
  sport_icon: string | null;
  most_recent_team: string | null;
  most_recent_league: string | null;
  most_recent_league_abbrev: string | null;
  card_filename: string | null;
  honors: Honor[];
  teams: Team[];
};

type Props = {
  players: Player[];
  isAuthenticated: boolean;
  storageUrl: string;
};

const STATUS_LABELS: Record<string, string> = {
  active:   "Active",
  retired:  "Retired",
  college:  "College",
  overseas: "Overseas",
  inactive: "Inactive",
};

function formatBirthdate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function groupTeamsByLeague(teams: Team[]) {
  const map: Record<string, { league: string; abbrev: string | null; years: number[] }> = {};
  for (const t of teams) {
    const key = `${t.team_name}||${t.league_name}`;
    if (!map[key]) map[key] = { league: t.league_name, abbrev: t.league_abbrev, years: [] };
    map[key].years.push(t.season_year);
  }
  const byLeague: Record<string, { team: string; from: number; to: number }[]> = {};
  const leagueMeta: Record<string, { abbrev: string | null }> = {};
  for (const [key, val] of Object.entries(map)) {
    const teamName = key.split("||")[0];
    val.years.sort((a, b) => a - b);
    const from = val.years[0];
    const to = val.years[val.years.length - 1];
    if (!byLeague[val.league]) { byLeague[val.league] = []; leagueMeta[val.league] = { abbrev: val.abbrev }; }
    byLeague[val.league].push({ team: teamName, from, to });
  }
  return Object.entries(byLeague)
    .sort((a, b) => {
      const maxA = Math.max(...a[1].map(t => t.to));
      const maxB = Math.max(...b[1].map(t => t.to));
      return maxB - maxA;
    })
    .map(([league, teams]) => ({ league, abbrev: leagueMeta[league].abbrev, teams }));
}

function PlayerRow({ player, storageUrl }: { player: Player; storageUrl: string }) {
  const [open, setOpen] = useState(false);
  const displayName = player.preferred_name ?? `${player.first_name} ${player.last_name}`;
  const topTeams = groupTeamsByLeague(player.teams).slice(0, 3);
  const statusLabel = STATUS_LABELS[player.player_status] ?? player.player_status;

  return (
    <div className="pr">
      {/* ── COLLAPSED ROW ── */}
      <button className="pr-header" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {/* Col 1: Name */}
        <div className="pr-col pr-col-name">
          <span className="pr-name">{displayName}</span>
        </div>

        {/* Col 2: League abbrev + sport icon */}
        <div className="pr-col pr-col-league">
          {player.most_recent_league_abbrev && (
            <span className="pr-league-abbrev">{player.most_recent_league_abbrev}</span>
          )}
          {player.sport_icon && (
            <span className="pr-sport-icon">{player.sport_icon}</span>
          )}
        </div>

        {/* Col 3: Most recent team */}
        <div className="pr-col pr-col-team">
          <span className="pr-team">{player.most_recent_team ?? "—"}</span>
        </div>

        {/* Col 4: Status badge */}
        <div className="pr-col pr-col-status">
          <span className="pr-status-badge">{statusLabel}</span>
        </div>

        {/* Chevron */}
        <span className={`pr-chevron${open ? " open" : ""}`}>›</span>
      </button>

      {/* ── EXPANDED CARD ── */}
      {open && (
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
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
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

              {/* Meta row */}
              <div className="pr-card-meta">
                {player.sport_icon && <span>{player.sport_icon}</span>}
                {player.sport_name && <span>{player.sport_name}</span>}
                {player.birthdate && (
                  <>
                    <span className="pr-dot">·</span>
                    <span>b. {formatBirthdate(player.birthdate)}</span>
                  </>
                )}
                {/* Hometown placeholder — fast follow */}
              </div>

              {/* Honor badges with icons */}
              {player.honors.length > 0 && (
                <div className="pr-card-honors">
                  {player.honors.map((h, i) => (
                    <span key={i} className="pr-honor-badge" title={h.honor_name}>
                      {h.icon && <span className="pr-honor-icon">{h.icon}</span>}
                      <span>{h.honor_short_name ?? h.honor_name}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Bio */}
              {player.seo_description && (
                <p className="pr-card-bio">{player.seo_description}</p>
              )}

              {/* Teams by league */}
              {topTeams.length > 0 && (
                <div className="pr-card-teams">
                  {topTeams.map((lg, i) => (
                    <div key={i} className="pr-league-group">
                      <span className="pr-league-label">
                        {lg.abbrev ?? lg.league}
                      </span>
                      <span className="pr-league-teams">
                        {lg.teams.map(t =>
                          `${t.team} (${t.from === t.to ? t.from : `${t.from}–${t.to}`})`
                        ).join(" · ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayerAccordion({ players, storageUrl }: Props) {
  return (
    <div className="player-accordion">
      <style>{`
        /* ── TABLE HEADER ── */
        .pr-table-header {
          display: grid;
          grid-template-columns: 2fr 120px 1fr 100px 24px;
          gap: 12px;
          padding: 8px 20px;
          border-bottom: 2px solid var(--border);
          margin-bottom: 0;
        }
        .pr-th {
          font-size: 0.7rem; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--slate-ghost);
        }

        /* ── ROW ── */
        .pr { border-bottom: 1px solid var(--border); }
        .pr:first-of-type { border-top: 1px solid var(--border); }

        .pr-header {
          width: 100%; background: none; border: none; cursor: pointer;
          display: grid;
          grid-template-columns: 2fr 120px 1fr 100px 24px;
          gap: 12px;
          align-items: center;
          padding: 14px 20px;
          font-family: var(--font-body);
          transition: background 0.15s; text-align: left;
        }
        .pr-header:hover { background: rgba(217,119,87,0.04); }

        .pr-col { display: flex; align-items: center; gap: 6px; min-width: 0; }
        .pr-col-name { }
        .pr-col-league { }
        .pr-col-team { }
        .pr-col-status { }

        .pr-name { font-family: var(--font-display); font-size: 1rem; color: var(--slate); font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pr-league-abbrev { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.06em; color: var(--slate-soft); }
        .pr-sport-icon { font-size: 0.9rem; }
        .pr-team { font-size: 0.82rem; color: var(--slate-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* Parchment status badge */
        .pr-status-badge {
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 3px 10px; border-radius: 20px;
          background: #f5f0e8; color: var(--slate-soft);
          border: 1px solid rgba(61,57,53,0.12);
          white-space: nowrap;
        }

        .pr-chevron {
          font-size: 1.1rem; color: var(--slate-ghost);
          transition: transform 0.2s; display: inline-block;
          line-height: 1; justify-self: center;
        }
        .pr-chevron.open { transform: rotate(90deg); }

        /* ── EXPANDED CARD ── */
        .pr-card { background: var(--warm-white); border-top: 1px solid var(--border); }
        .pr-card-inner {
          display: grid; grid-template-columns: 150px 1fr;
          gap: 28px; padding: 24px 20px; max-width: 860px;
        }
        @media (max-width: 600px) {
          .pr-card-inner { grid-template-columns: 1fr; }
          .pr-header { grid-template-columns: 1fr 80px 24px; }
          .pr-col-league, .pr-col-status { display: none; }
          .pr-table-header { grid-template-columns: 1fr 80px 24px; }
          .pr-th:nth-child(2), .pr-th:nth-child(4) { display: none; }
        }

        .pr-card-img-wrap { display: flex; align-items: flex-start; justify-content: center; }
        .pr-card-img { width: 130px; height: 182px; object-fit: cover; object-position: center top; border-radius: 8px; box-shadow: 0 4px 16px rgba(61,57,53,0.15); }
        .pr-card-img-ph { width: 130px; height: 182px; background: rgba(217,119,87,0.07); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--slate-ghost); opacity: 0.4; }

        .pr-card-details { display: flex; flex-direction: column; gap: 12px; }
        .pr-card-name { font-family: var(--font-display); font-size: 1.4rem; color: var(--slate); line-height: 1.1; }
        .pr-card-meta { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--slate-soft); flex-wrap: wrap; }
        .pr-dot { color: var(--slate-ghost); }

        /* Honor badges */
        .pr-card-honors { display: flex; flex-wrap: wrap; gap: 6px; }
        .pr-honor-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.72rem; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
          background: #f5f0e8; color: var(--slate-soft);
          border: 1px solid rgba(61,57,53,0.12);
        }
        .pr-honor-icon { font-size: 0.85rem; }

        .pr-card-bio { font-size: 0.87rem; color: var(--slate-soft); line-height: 1.65; max-width: 500px; }

        .pr-card-teams { display: flex; flex-direction: column; gap: 6px; }
        .pr-league-group { display: flex; flex-direction: column; gap: 1px; }
        .pr-league-label { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--slate-ghost); }
        .pr-league-teams { font-size: 0.82rem; color: var(--slate-soft); }
      `}</style>

      {/* Table header */}
      <div className="pr-table-header">
        <span className="pr-th">Player</span>
        <span className="pr-th">League</span>
        <span className="pr-th">Team</span>
        <span className="pr-th">Status</span>
        <span className="pr-th"></span>
      </div>

      {players.map(p => (
        <PlayerRow key={p.player_id} player={p} storageUrl={storageUrl} />
      ))}
    </div>
  );
}
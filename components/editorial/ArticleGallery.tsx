"use client";

import { useState } from "react";

type GalleryCard = {
  ed_gallery_id: string;
  display_order: number;
  caption: string | null;
  card_id: string;
  filename: string | null;
  card_number: string | null;
  card_type: string | null;
  color: string | null;
  print_run: number | null;
  set_name: string | null;
  year: number | null;
  manufacturer: string | null;
  player_name: string | null;
  player_slug: string | null;
  set_slug: string | null;
};

type Props = {
  cards: GalleryCard[];
  isAuthenticated: boolean;
  hasGalleryAccess: boolean;
  storageUrl: string;
  accentColor?: string;
};

export default function ArticleGallery({
  cards,
  isAuthenticated,
  hasGalleryAccess,
  storageUrl,
  accentColor = "var(--terracotta)",
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (cards.length === 0) return null;

  const selectedCard = selectedIndex !== null ? cards[selectedIndex] : null;

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? cards.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === cards.length - 1 ? 0 : selectedIndex + 1);
  };

  const handleClose = () => setSelectedIndex(null);

  return (
    <div className="ag-wrap">
      <style>{`
        .ag-wrap { display: flex; flex-direction: column; gap: 0; }

        /* ── Section header ── */
        .ag-header {
          font-size: 0.68rem; font-weight: 800;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--slate-ghost);
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 12px;
        }

        /* ── Thumbnail grid ── */
        .ag-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .ag-thumb {
          aspect-ratio: 5/7;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.15s, transform 0.15s;
          background: #f5f0e8;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .ag-thumb:hover { transform: translateY(-1px); }
        .ag-thumb.selected { border-color: var(--accent-color, var(--terracotta)); }
        .ag-thumb.locked { cursor: default; }

        .ag-thumb img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
        }

        /* Blur overlay for locked cards */
        .ag-thumb-blur {
          position: absolute; inset: 0;
          backdrop-filter: blur(6px);
          background: rgba(245,240,232,0.5);
        }

        /* Lock icon */
        .ag-thumb-lock {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; opacity: 0.5;
        }

        /* Placeholder icon */
        .ag-thumb-ph {
          opacity: 0.3; color: var(--slate);
        }

        /* ── Info panel ── */
        .ag-panel {
          margin-top: 10px;
          background: white;
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          animation: agIn 0.15s ease;
        }
        @keyframes agIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Upgrade panel for locked */
        .ag-upgrade {
          margin-top: 10px;
          background: white;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px;
          text-align: center;
        }
        .ag-upgrade-eyebrow {
          font-size: 8px; font-weight: 800;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--slate-ghost); margin-bottom: 6px;
        }
        .ag-upgrade-title {
          font-family: var(--font-display);
          font-size: 0.95rem; color: var(--slate);
          margin-bottom: 6px; line-height: 1.2;
        }
        .ag-upgrade-desc {
          font-size: 10px; color: var(--slate-soft);
          line-height: 1.5; margin-bottom: 12px;
        }
        .ag-upgrade-btn {
          display: inline-block;
          font-size: 10px; font-weight: 700;
          padding: 6px 14px; border-radius: 20px;
          background: var(--lavender); color: white;
          text-decoration: none;
        }

        /* Panel card image */
        .ag-panel-img {
          width: 100%; padding: 16px 0 12px;
          display: flex; align-items: center; justify-content: center;
          background: #f5f0e8;
        }
        .ag-panel-img img {
          width: 45%; aspect-ratio: 5/7;
          object-fit: cover; object-position: center top;
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(61,57,53,0.18);
        }
        .ag-panel-img-ph {
          width: 45%; aspect-ratio: 5/7;
          background: #ede8e0; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          opacity: 0.5;
        }

        /* Panel data */
        .ag-panel-body { padding: 10px 14px 0; }
        .ag-panel-row {
          display: flex; justify-content: space-between;
          align-items: baseline; padding: 4px 0;
          border-bottom: 1px solid rgba(61,57,53,0.06);
          font-size: 11px;
        }
        .ag-panel-row:last-child { border-bottom: none; }
        .ag-panel-label {
          font-size: 8px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--slate-ghost);
        }
        .ag-panel-value {
          font-size: 11px; font-weight: 600;
          color: var(--slate); text-align: right;
          max-width: 130px;
        }
        .ag-panel-caption {
          font-size: 10px; font-style: italic;
          color: var(--slate-soft); padding: 8px 14px 4px;
          line-height: 1.5;
        }

        /* Panel actions */
        .ag-panel-actions {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 6px; padding: 10px 14px 12px;
          border-top: 1px solid rgba(61,57,53,0.08);
          margin-top: 8px;
        }
        .ag-action {
          font-size: 10px; font-weight: 700;
          padding: 6px 8px; border-radius: 6px;
          border: 1.5px solid rgba(61,57,53,0.15);
          background: white; color: var(--slate-soft);
          cursor: pointer; text-align: center;
          text-decoration: none; display: block;
          transition: all 0.15s; font-family: var(--font-body);
        }
        .ag-action:hover { border-color: var(--terracotta); color: var(--terracotta); }
        .ag-action.primary {
          background: linear-gradient(135deg, var(--terracotta), var(--terracotta-deep));
          color: white; border-color: transparent;
        }
        .ag-action.primary:hover { opacity: 0.9; }

        /* Panel navigation */
        .ag-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 14px 10px;
          border-top: 1px solid rgba(61,57,53,0.06);
        }
        .ag-nav-btn {
          background: none; border: none; cursor: pointer;
          font-size: 14px; color: var(--slate-ghost);
          padding: 4px 8px; border-radius: 4px;
          transition: color 0.15s, background 0.15s;
          font-family: var(--font-body);
        }
        .ag-nav-btn:hover { color: var(--slate); background: rgba(61,57,53,0.05); }
        .ag-nav-close {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--slate-ghost); background: none; border: none;
          cursor: pointer; padding: 4px 8px;
          font-family: var(--font-body);
          transition: color 0.15s;
        }
        .ag-nav-close:hover { color: var(--slate); }
        .ag-nav-counter {
          font-size: 9px; color: var(--slate-ghost);
        }
      `}</style>

      <div className="ag-header">Card Gallery</div>

      {/* Thumbnail grid */}
      <div className="ag-grid">
        {cards.map((card, i) => {
          const isSelected = selectedIndex === i;
          const isLocked = !hasGalleryAccess;

          return (
            <div
              key={card.ed_gallery_id}
              className={`ag-thumb${isSelected ? " selected" : ""}${isLocked ? " locked" : ""}`}
              style={{"--accent-color": accentColor} as React.CSSProperties}
              onClick={() => {
                if (!isLocked) setSelectedIndex(isSelected ? null : i);
              }}
            >
              {card.filename ? (
                <img
                  src={`${storageUrl}/${card.filename}`}
                  alt={`Card ${card.card_number ?? ""}`}
                />
              ) : (
                <div className="ag-thumb-ph">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b8a8" strokeWidth="1.25">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
              )}
              {isLocked && card.filename && <div className="ag-thumb-blur" />}
              {isLocked && <div className="ag-thumb-lock">🔒</div>}
            </div>
          );
        })}
      </div>

      {/* Info panel — locked upgrade CTA */}
      {!hasGalleryAccess && (
        <div className="ag-upgrade">
          <div className="ag-upgrade-eyebrow">Chronicle · Legacy</div>
          <div className="ag-upgrade-title">Full card gallery</div>
          <p className="ag-upgrade-desc">
            See every card in this gallery — Chronicle members unlock the full set.
          </p>
          <a href="/membership" className="ag-upgrade-btn">Upgrade to Chronicle →</a>
        </div>
      )}

      {/* Info panel — selected card */}
      {hasGalleryAccess && selectedCard && (
        <div className="ag-panel">
          {/* Card image */}
          <div className="ag-panel-img">
            {selectedCard.filename ? (
              <img
                src={`${storageUrl}/${selectedCard.filename}`}
                alt={`Card ${selectedCard.card_number ?? ""}`}
              />
            ) : (
              <div className="ag-panel-img-ph">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4b8a8" strokeWidth="1.25">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L5 21"/>
                </svg>
              </div>
            )}
          </div>

          {/* Card data */}
          <div className="ag-panel-body">
            {selectedCard.card_number && (
              <div className="ag-panel-row">
                <span className="ag-panel-label">Card #</span>
                <span className="ag-panel-value">{selectedCard.card_number}</span>
              </div>
            )}
            {selectedCard.set_name && (
              <div className="ag-panel-row">
                <span className="ag-panel-label">Set</span>
                <span className="ag-panel-value">{selectedCard.set_name}</span>
              </div>
            )}
            {selectedCard.year && (
              <div className="ag-panel-row">
                <span className="ag-panel-label">Year</span>
                <span className="ag-panel-value">{selectedCard.year}</span>
              </div>
            )}
            {selectedCard.manufacturer && (
              <div className="ag-panel-row">
                <span className="ag-panel-label">Manufacturer</span>
                <span className="ag-panel-value">{selectedCard.manufacturer}</span>
              </div>
            )}
            {selectedCard.card_type && selectedCard.card_type !== "base" && (
              <div className="ag-panel-row">
                <span className="ag-panel-label">Type</span>
                <span className="ag-panel-value">{selectedCard.card_type}</span>
              </div>
            )}
            {selectedCard.color && selectedCard.color !== "none" && (
              <div className="ag-panel-row">
                <span className="ag-panel-label">Color</span>
                <span className="ag-panel-value">{selectedCard.color}</span>
              </div>
            )}
            {selectedCard.print_run && (
              <div className="ag-panel-row">
                <span className="ag-panel-label">Print Run</span>
                <span className="ag-panel-value">/{selectedCard.print_run}</span>
              </div>
            )}
          </div>

          {selectedCard.caption && (
            <p className="ag-panel-caption">{selectedCard.caption}</p>
          )}

          {/* Actions */}
          <div className="ag-panel-actions">
            {isAuthenticated ? (
              <>
                <button className="ag-action">+ Want List</button>
                <button className="ag-action">♥ Favorite</button>
                <button className="ag-action" onClick={() => {
                  if (selectedCard.set_slug) window.location.href = `/collect?set=${selectedCard.set_slug}`;
                }}>View Set</button>
                <button className="ag-action primary" onClick={() => {
                  if (selectedCard.player_slug) window.location.href = `/player/${selectedCard.player_slug}`;
                }}>Player Page</button>
              </>
            ) : (
              <>
                <a href="/membership" className="ag-action primary">Join free</a>
                <a href="/login" className="ag-action">Sign in</a>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="ag-nav">
            <button className="ag-nav-btn" onClick={handlePrev}>←</button>
            <button className="ag-nav-close" onClick={handleClose}>Close</button>
            <span className="ag-nav-counter">{(selectedIndex ?? 0) + 1} / {cards.length}</span>
            <button className="ag-nav-btn" onClick={handleNext}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
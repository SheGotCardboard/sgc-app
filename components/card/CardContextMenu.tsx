"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type CardData = {
  card_id: string;
  card_number: string | null;
  card_type: string | null;
  color: string | null;
  player_name: string | null;
  team_name: string | null;
  set_name: string | null;
  year: number | null;
  manufacturer: string | null;
  player_slug: string | null;
  set_slug: string | null;
};

type Props = {
  isAuthenticated: boolean;
  hasWishlist: boolean;
  hasCardFavorites: boolean;
};

type PanelState = {
  visible: boolean;
  x: number;
  y: number;
  cardId: string | null;
  cardData: CardData | null;
  loading: boolean;
};

export default function CardContextMenu({ isAuthenticated, hasWishlist, hasCardFavorites }: Props) {
  const [panel, setPanel] = useState<PanelState>({
    visible: false, x: 0, y: 0,
    cardId: null, cardData: null, loading: false,
  });
  const [toast, setToast] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelStateRef = useRef(panel);
  const supabase = createClient();

  useEffect(() => { panelStateRef.current = panel; }, [panel]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const close = useCallback(() => {
    setPanel(p => ({ ...p, visible: false, cardData: null, cardId: null }));
  }, []);

  useEffect(() => {
    const handleContextMenu = async (e: MouseEvent) => {
      e.preventDefault();

      const target = (e.target as HTMLElement).closest("[data-card-id]") as HTMLElement | null;

      if (!target) {
        setPanel({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          cardId: null,
          cardData: null,
          loading: false,
        });
        return;
      }

      const cardId = target.getAttribute("data-card-id");
      if (!cardId) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pw = 280;
      const ph = 380;
      const x = e.clientX + pw > vw ? e.clientX - pw : e.clientX;
      const y = e.clientY + ph > vh ? e.clientY - ph : e.clientY;

      // Don't show panel yet — wait for data
      setPanel({ visible: false, x, y, cardId, cardData: null, loading: true });

      const { data: cardRow } = await (supabase as any)
        .from("card")
        .select("card_id, card_number, card_set_id, pri_subject_id, pri_subject_type_id, card_type_id")
        .eq("card_id", cardId)
        .single();

      if (!cardRow) {
        setPanel(p => ({ ...p, visible: true, loading: false }));
        return;
      }

      const { data: setRow } = await (supabase as any)
        .from("card_sets")
        .select("set_name, year, manufacturer, slug")
        .eq("card_set_id", cardRow?.card_set_id)
        .single();

      const isTeam = cardRow?.pri_subject_type_id === '4df9fb8c-d346-48a0-9bec-61e21a55e295';
      const isPlayer = cardRow?.pri_subject_type_id === '78f8a7f8-89a1-4272-a6c6-90235881363c';

      let subjectName: string | null = null;
      let subjectSlug: string | null = null;

      if (isPlayer) {
        const { data: playerRow } = await (supabase as any)
          .from("player")
          .select("first_name, last_name, slug")
          .eq("player_id", cardRow?.pri_subject_id)
          .single();
        subjectName = playerRow ? `${playerRow.first_name} ${playerRow.last_name}` : null;
        subjectSlug = playerRow?.slug ?? null;
      } else if (isTeam) {
        const { data: teamRow } = await (supabase as any)
          .from("team")
          .select("team_name, slug")
          .eq("team_id", cardRow?.pri_subject_id)
          .single();
        subjectName = teamRow?.team_name ?? null;
        subjectSlug = teamRow?.slug ?? null;
      }

      const { data: cardTypeRow } = await (supabase as any)
        .from("card_type_lkp")
        .select("value")
        .eq("card_type_id", cardRow?.card_type_id)
        .single();

      // Now show panel with all data ready
      setPanel(p => ({
        ...p,
        visible: true,
        loading: false,
        cardData: {
          card_id:      cardId,
          card_number:  cardRow?.card_number ?? null,
          card_type:    cardTypeRow?.value ?? null,
          color:        null,
          player_name:  subjectName,
          team_name:    cardTypeRow?.value ?? null,
          set_name:     setRow?.set_name ?? null,
          year:         setRow?.year ?? null,
          manufacturer: setRow?.manufacturer ?? null,
          player_slug:  isPlayer ? subjectSlug : null,
          set_slug:     setRow?.slug ?? null,
        }
      }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!panelStateRef.current.visible) return;
      // Only dismiss if mouse is far from the panel element itself
      if (panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        // Add a generous buffer zone around the panel
        const buffer = 80;
        const inZone =
          e.clientX >= rect.left - buffer &&
          e.clientX <= rect.right + buffer &&
          e.clientY >= rect.top - buffer &&
          e.clientY <= rect.bottom + buffer;
        if (!inZone) close();
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [close, supabase]);

  const handleWishlist = async () => {
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    if (!hasWishlist) { showToast("Wishlist is a Chronicle feature — upgrade to save cards"); return; }
    if (!panel.cardId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await (supabase.from("member_wishlist") as any)
      .upsert({ user_id: user.id, card_id: panel.cardId }, { onConflict: "user_id,card_id" });
    if (error) { showToast("Something went wrong — try again"); return; }
    showToast("Added to your want list ✓");
    close();
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    if (!hasCardFavorites) { showToast("Card favorites is a Chronicle feature — upgrade to save cards"); return; }
    if (!panel.cardId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await (supabase.from("member_card_favorites") as any)
      .upsert({ user_id: user.id, card_id: panel.cardId }, { onConflict: "user_id,card_id" });
    if (error) { showToast("Something went wrong — try again"); return; }
    showToast("Added to favorites ✓");
    close();
  };

  const handleViewSet = () => {
    if (panel.cardData?.set_slug) {
      window.location.href = `/collect?set=${panel.cardData.set_slug}`;
    }
    close();
  };

  const handlePlayerPage = () => {
    if (panel.cardData?.player_slug) {
      window.location.href = `/player/${panel.cardData.player_slug}`;
    }
    close();
  };

  if (!panel.visible) return (
    <>
      {toast && <div className="sgc-toast">{toast}</div>}
      <style>{toastCSS}</style>
    </>
  );

  return (
    <>
      <style>{panelCSS}</style>
      <style>{toastCSS}</style>

      <div
        ref={panelRef}
        className="ccp"
        style={{ top: panel.y, left: panel.x }}
        onContextMenu={e => e.preventDefault()}
      >
        {/* Header */}
        <div className="ccp-header">
          <div className="ccp-header-label">What is this card?</div>
          {panel.cardData ? (
            <>
              <div className="ccp-player">{panel.cardData.player_name ?? "—"}</div>
              <div className="ccp-team">{panel.cardData.card_type ?? "—"}</div>
            </>
          ) : !isAuthenticated ? (
            <>
              <div className="ccp-player">—</div>
              <div className="ccp-team" style={{fontStyle: 'italic', opacity: 0.7}}>Sign in for full details</div>
            </>
          ) : (
            <>
              <div className="ccp-player">—</div>
              <div className="ccp-team">—</div>
            </>
          )}
        </div>

        {/* Body — card data rows */}
        {isAuthenticated && panel.cardData && (
          <div className="ccp-body">
            <div className="ccp-row">
              <span className="ccp-row-label">Card #</span>
              <span className="ccp-row-value">{panel.cardData.card_number ?? "—"}</span>
            </div>
            <div className="ccp-row">
              <span className="ccp-row-label">Set</span>
              <span className="ccp-row-value">{panel.cardData.set_name ?? "—"}</span>
            </div>
            <div className="ccp-row">
              <span className="ccp-row-label">Year</span>
              <span className="ccp-row-value">{panel.cardData.year ?? "—"}</span>
            </div>
            <div className="ccp-row">
              <span className="ccp-row-label">Manufacturer</span>
              <span className="ccp-row-value">{panel.cardData.manufacturer ?? "—"}</span>
            </div>
            {panel.cardData.color && panel.cardData.color !== "none" && (
              <div className="ccp-row">
                <span className="ccp-row-label">Variant</span>
                <span className="ccp-row-value">{panel.cardData.color}</span>
              </div>
            )}
          </div>
        )}

        {/* Guest body */}
        {!isAuthenticated && (
          <div className="ccp-body">
            <p className="ccp-guest-note">
              Create a free account to see full card details, save cards to your want list, and follow your favorite players.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="ccp-actions">
          {isAuthenticated ? (
            <>
              <button className="ccp-action" onClick={handleWishlist}>+ Want List</button>
              <button className="ccp-action" onClick={handleFavorite}>♥ Favorite</button>
              <button className="ccp-action" onClick={handleViewSet}>View Set</button>
              <button className="ccp-action primary" onClick={handlePlayerPage}>Player Page</button>
            </>
          ) : (
            <>
              <a href="/membership" className="ccp-action primary">Join free</a>
              <a href="/login" className="ccp-action">Sign in</a>
            </>
          )}
        </div>

        <div className="ccp-footer">
          {isAuthenticated ? "Right-click any card to identify it" : "Free account · no credit card needed"}
        </div>
      </div>

      {toast && <div className="sgc-toast">{toast}</div>}
    </>
  );
}

const panelCSS = `
  .ccp {
    position: fixed;
    z-index: 9999;
    width: 280px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 40px rgba(61,57,53,0.18), 0 2px 8px rgba(61,57,53,0.08);
    border: 1px solid rgba(61,57,53,0.1);
    overflow: hidden;
    font-family: var(--font-body);
    animation: ccpIn 0.15s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes ccpIn {
    from { opacity: 0; transform: scale(0.95) translateY(-4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .ccp-header {
    background: linear-gradient(135deg, var(--terracotta) 0%, var(--terracotta-deep) 100%);
    padding: 14px 18px 12px;
  }
  .ccp-header-label {
    font-size: 8px; font-weight: 800;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(255,255,255,0.65); margin-bottom: 4px;
  }
  .ccp-player {
    font-family: var(--font-display);
    font-size: 20px; color: white; line-height: 1.1; margin-bottom: 2px;
  }
  .ccp-team { font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 500; }
  .ccp-loading { font-size: 13px; color: rgba(255,255,255,0.7); font-style: italic; }
  .ccp-body { padding: 14px 18px; }
  .ccp-row {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 5px 0; border-bottom: 1px solid rgba(61,57,53,0.06);
  }
  .ccp-row:last-child { border-bottom: none; }
  .ccp-row-label {
    font-size: 9px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--slate-ghost);
  }
  .ccp-row-value {
    font-size: 12px; font-weight: 600;
    color: var(--slate); text-align: right; max-width: 160px;
  }
  .ccp-guest-note {
    font-size: 12px; color: var(--slate-soft);
    line-height: 1.6;
  }
  .ccp-actions {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 8px; padding: 12px 18px 14px;
    border-top: 1px solid rgba(61,57,53,0.08);
  }
  .ccp-action {
    font-family: var(--font-body);
    font-size: 11px; font-weight: 700;
    padding: 8px 10px; border-radius: 8px;
    border: 1.5px solid rgba(61,57,53,0.15);
    background: white; color: var(--slate-soft);
    cursor: pointer; text-align: center;
    text-decoration: none; display: block;
    transition: all 0.15s;
  }
  .ccp-action:hover { border-color: var(--terracotta); color: var(--terracotta); background: rgba(217,119,87,0.05); }
  .ccp-action.primary {
    background: linear-gradient(135deg, var(--terracotta), var(--terracotta-deep));
    color: white; border-color: transparent;
  }
  .ccp-action.primary:hover { opacity: 0.9; }
  .ccp-footer {
    padding: 8px 18px 12px;
    font-size: 9px; color: var(--slate-ghost);
    text-align: center; font-style: italic;
  }
`;

const toastCSS = `
  .sgc-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%);
    background: var(--slate);
    color: white;
    font-family: var(--font-body);
    font-size: 13px; font-weight: 500;
    padding: 10px 20px;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(61,57,53,0.2);
    z-index: 10000;
    white-space: nowrap;
    animation: toastIn 0.2s ease;
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
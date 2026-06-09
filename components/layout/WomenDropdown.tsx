// components/layout/WomenDropdown.tsx
// Client component — mirrors the pattern of AboutDropdown
// "The Women" nav item with dropdown:
//   · Directory      → /player
//   · ★ SGC Pantheon → /pantheon  (gold, special)
"use client";

import { useState, useRef, useEffect } from "react";

interface WomenDropdownProps {
  activePage?: string;
}

export default function WomenDropdown({ activePage }: WomenDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = activePage === "players" || activePage === "pantheon";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sgc-nav-about-wrap" ref={ref}>
      <button
        className={`sgc-nav-about-btn${isActive ? " active" : ""}`}
        style={isActive ? { color: "var(--terracotta)", background: "rgba(217,119,87,0.08)" } : {}}
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        The Women
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ marginLeft: 4, opacity: 0.5, transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="sgc-nav-about-dropdown" style={{ left: 0, right: "auto", minWidth: 200 }}>
          <a
            href="/player"
            className="sgc-nav-about-item"
            onClick={() => setOpen(false)}
          >
            Directory
          </a>
          <div className="sgc-nav-about-divider" />
          <a
            href="/pantheon"
            className="sgc-nav-about-item pantheon"
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <span style={{ fontSize: "0.8rem" }}>★</span>
            SGC Pantheon
          </a>
        </div>
      )}
    </div>
  );
}
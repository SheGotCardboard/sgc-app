"use client";

import { useState } from "react";

export default function AboutDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="sgc-nav-about-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="sgc-nav-pub-link sgc-nav-about-btn">
        About
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{marginLeft: 3}}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <>
          <div style={{position: 'absolute', top: '100%', left: 0, right: 0, height: '12px'}} />
          <div className="sgc-nav-about-dropdown">
            <a href="/about" className="sgc-nav-about-item">Our Story</a>
            <a href="/about/editorial" className="sgc-nav-about-item">Editorial Philosophy</a>
            <a href="/about/whats-new" className="sgc-nav-about-item">What&apos;s New</a>
            <a href="/about/coming-soon" className="sgc-nav-about-item">Coming Soon</a>
            <a href="/about/faq" className="sgc-nav-about-item">FAQ</a>
            <div className="sgc-nav-about-divider" />
            <a href="/about/contact" className="sgc-nav-about-item">Contact</a>
          </div>
        </>
      )}
    </div>
  );
}
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export default function WhatsNewPage() {
  return (
    <div className="sgc-page">
      <Nav activePage="about" />
      <style>{`
        .cs-wrap { min-height: calc(100vh - 64px); background: var(--cream); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; }
        .cs-kicker { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 16px; }
        .cs-title { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 400; color: var(--slate); margin-bottom: 16px; line-height: 1.1; }
        .cs-title em { font-style: italic; color: var(--terracotta); }
        .cs-desc { font-size: 1rem; color: var(--slate-soft); max-width: 480px; line-height: 1.7; margin-bottom: 32px; }
        .cs-back { font-size: 0.85rem; font-weight: 700; color: var(--slate-ghost); text-decoration: none; transition: color 0.15s; }
        .cs-back:hover { color: var(--terracotta); }
      `}</style>
      <div className="cs-wrap">
        <p className="cs-kicker">About SGC</p>
        <h1 className="cs-title">What&apos;s <em>New</em></h1>
        <p className="cs-desc">
          New players, new cards, new features. We&apos;ll be tracking everything we add here
          so you never miss what&apos;s been added to the collection.
        </p>
        <a href="/" className="cs-back">← Back to home</a>
      </div>
   <Footer />
    </div>
  );
}
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export default function EditorialPage() {
  return (
    <div className="sgc-page">
      <Nav activePage="about" />
      <style>{`
        .about-wrap { max-width: 860px; margin: 0 auto; padding: 56px 48px; }
        .about-kicker { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .about-kicker::before { content: ''; width: 24px; height: 2px; background: var(--terracotta); display: block; }
        .about-title { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); color: var(--slate); line-height: 1.1; margin-bottom: 40px; }
        .about-body { font-size: 1.05rem; line-height: 1.85; color: var(--slate-soft); }
        .about-body p { margin-bottom: 1.6em; }
        .about-body h2 { font-family: var(--font-display); font-size: 1.6rem; color: var(--slate); margin: 2em 0 0.8em; line-height: 1.2; }
        .about-body h3 { font-family: var(--font-display); font-size: 1.15rem; color: var(--terracotta); margin: 2em 0 0.4em; line-height: 1.2; }
        .about-body .persona-name { font-family: var(--font-display); font-size: 1.4rem; color: var(--slate); margin: 2.4em 0 0.4em; }
        .about-body .pullquote { font-family: var(--font-display); font-size: 1.3rem; color: var(--slate); line-height: 1.4; border-left: 3px solid var(--terracotta); padding-left: 24px; margin: 2em 0; font-style: italic; }
        .about-body .closing { font-size: 1rem; color: var(--slate); font-style: italic; margin-top: 2.4em; padding-top: 2em; border-top: 1px solid var(--border); }
        @media (max-width: 768px) { .about-wrap { padding: 40px 24px; } }
      `}</style>

      <div className="about-wrap">
        <p className="about-kicker">About SGC</p>
        <h1 className="about-title">Editorial Philosophy</h1>

        <div className="about-body">
          <h2>Who We Write For</h2>

          <div className="persona-name">Meet Monique.</div>
          <p>She's a coworker and a diehard fan. She knows the players, has opinions about every roster move, and will talk teams with you all day. She comes to SGC for the collecting angle and for the stories she may not have heard — the detail behind the detail, the card that captures a moment she already remembers.</p>

          <div className="persona-name">Meet Liz.</div>
          <p>She's a best friend and a social justice advocate who has never quite understood why these little pieces of cardboard matter so much. Then she met Maya Moore — not only an accomplished basketball player but an extraordinary human being who walked away from the game at her peak to fight for criminal justice reform. Maya's foundation, Win With Justice, gets a very large donation every Giving Tuesday. Liz is here now.</p>

          <div className="persona-name">Meet Maria.</div>
          <p>She has five brothers and a husband with a YouTube card collecting channel. She came in knowing Panini and Topps, refractors, prizms, and 1-of-1s. She now knows there is more.</p>

          <div className="persona-name">And then there's David.</div>
          <p>He coached his daughter's rec league team for six years, drove her to every game, and still watches every WNBA game he can find. He's welcome here too.</p>

          <div className="pullquote">These women are mothers and daughters, sisters and partners. Their story is important — they are important.</div>

          <p className="closing">SGC is written for all of them, and for everyone who sees themselves in any one of them.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
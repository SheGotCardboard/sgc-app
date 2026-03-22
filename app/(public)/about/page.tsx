import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
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
        .about-body .pullquote { font-family: var(--font-display); font-size: 1.3rem; color: var(--slate); line-height: 1.4; border-left: 3px solid var(--terracotta); padding-left: 24px; margin: 2em 0; font-style: italic; }
        @media (max-width: 768px) { .about-wrap { padding: 40px 24px; } }
      `}</style>

      <div className="about-wrap">
        <p className="about-kicker">About SGC</p>
        <h1 className="about-title">Our Story</h1>

        <div className="about-body">
          <h2>Who We Are</h2>

          <p>She Got Cardboard didn't start with a business plan. It started with a father and daughter watching basketball together during the hardest years — and a name that kept coming up. Caitlin Clark. Down the rabbit hole she went.</p>

          <p>What she found there were women she had loved and half-forgotten: Cheryl Miller. Pat Summitt. Nancy Lieberman. Lynette Woodard. Sue Bird. And cards — cards that had been capturing these women for decades, mostly unnoticed, in a hobby that had never quite made room for them.</p>

          <p>An inherent collector's instinct took over. Sets arrived. Research followed. Cataloguing, reflection, and a growing realization: what she wanted to share wasn't the cardboard. It was the women. The stories the cards depicted. Given the chance she'd tell anyone about them.</p>

          <div className="pullquote">She Got Cardboard is that chance.</div>

          <p>Women matter, and they deserve to exist in this space too.</p>

          <p>Not as a niche. Not as an afterthought. As the whole story.</p>

          <p>We are not a price guide. We are not a stats database. We are an editorial home — one that believes every card tells her story, and that story is worth telling well. Our authority comes not from credentials but from depth of knowledge, genuine love of the subject, and the discipline to get our facts right before we publish. We are a fan publication in the best tradition of that phrase: rigorous enough to be trusted, warm enough to be loved.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
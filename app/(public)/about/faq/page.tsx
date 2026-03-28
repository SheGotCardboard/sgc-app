import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

const faqs = [
  {
    q: "Do you only cover women's basketball?",
    a: "We are starting with women's basketball for a few reasons — it was our entry point into the hobby, it has been the spark for the explosion in the sports card market and the availability of women's cards. We will be covering women's basketball through the end of June 2026. Beginning in July, we are expanding beyond basketball to celebrate some very exciting women and the truly interesting cards that tell their stories."
  },
  {
    q: "How do you choose which players get added to the site?",
    a: "We build our editorial calendar a quarter at a time. It starts with an overarching theme, followed by monthly topics, and then we build lists of women and events to celebrate. Once that list is finalized, we develop the collecting topics that complement them. Finally, we comb through the SGC Card Vault and begin selecting the cards that belong. Every card we feature is a card we have in our hands. Are they always the quintessential card for a player or moment? Maybe, maybe not. What it does mean is that every card has been experienced, studied, and loved — and is relatively easy to acquire."
  },
  {
    q: "Can I suggest topics, sports, or players for you to cover?",
    a: "Absolutely — and we mean that. Drop us a note at editor@shegotcardboard.com. We read everything. We cannot promise a timeline, but we can promise that a good suggestion lands on the right desk and stays there until we do something with it."
  },
  {
    q: "How often do you publish new articles?",
    a: "Our editorial calendar runs on a weekly cadence — one Player Spotlight, one SGC Celebrates, and one Collecting 101 guide, staggered across the week. Chronicle and Legacy members get every piece 72 hours before it is available to Story members. We would rather publish less and get it right than fill a feed with noise."
  },
  {
    q: "What is a card gallery and how do I access it?",
    a: "A card gallery is a curated set of cards — up to nine — that we have selected to tell the story of a particular player or moment. Think of it as the visual companion to the article: each card was chosen for a reason, and you can click any thumbnail to see the full card along with its set, year, manufacturer, and other details. Galleries are a Chronicle and Legacy member feature. Story members can see that a gallery exists — they just cannot open it yet."
  },
  {
    q: "What's the difference between The Story, The Chronicle, and The Legacy?",
    a: "The Story is free — always. You get full access to every article we publish, 72 hours after it goes live for paid members, with a rolling 30-day archive. The Chronicle is $7/month and gets you early access, the full unlimited archive, and card galleries on every article. The Legacy is $18/month and adds a quarterly e-zine, a collector's checklist PDF, and early access to card drops. Every tier gets the full editorial experience. The differences are about depth and timing, not access."
  },
  {
    q: "How do I cancel my membership?",
    a: "You can cancel anytime — no questions, no friction. Your access continues until the end of your current billing period. We process subscriptions through Polar, so you can manage everything directly from your account dashboard or by reaching out to us at editor@shegotcardboard.com and we will take care of it."
  },
  {
    q: "What does 'early access' mean?",
    a: "Every piece of SGC editorial goes live for Chronicle and Legacy members first. Story members get access to the same content 72 hours later. Early access is not about exclusivity for its own sake — it is about rewarding the people who make this possible. If you are a paid member, you read it first."
  },
];

export default function FAQPage() {
  return (
    <div className="sgc-page">
      <Nav activePage="about" />
      <style>{`
        .faq-wrap { max-width: 860px; margin: 0 auto; padding: 56px 48px; }
        .faq-kicker { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .faq-kicker::before { content: ''; width: 24px; height: 2px; background: var(--terracotta); display: block; }
        .faq-title { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); color: var(--slate); line-height: 1.1; margin-bottom: 12px; }
        .faq-intro { font-size: 1rem; color: var(--slate-soft); line-height: 1.75; margin-bottom: 48px; max-width: 600px; }
        .faq-list { display: flex; flex-direction: column; gap: 0; }
        .faq-item { border-top: 1px solid var(--border); padding: 28px 0; }
        .faq-item:last-child { border-bottom: 1px solid var(--border); }
        .faq-q { font-family: var(--font-display); font-size: 1.15rem; color: var(--slate); line-height: 1.3; margin-bottom: 12px; }
        .faq-a { font-size: 0.97rem; line-height: 1.8; color: var(--slate-soft); }
        .faq-footer { margin-top: 56px; padding-top: 32px; border-top: 1px solid var(--border); }
        .faq-footer-title { font-family: var(--font-display); font-size: 1.3rem; color: var(--slate); margin-bottom: 8px; }
        .faq-footer-desc { font-size: 0.9rem; color: var(--slate-soft); line-height: 1.7; }
        .faq-footer-link { color: var(--terracotta); text-decoration: none; }
        .faq-footer-link:hover { text-decoration: underline; }
        @media (max-width: 768px) { .faq-wrap { padding: 40px 24px; } }
      `}</style>

      <div className="faq-wrap">
        <p className="faq-kicker">FAQ</p>
        <h1 className="faq-title">Questions & Answers</h1>
        <p className="faq-intro">The things people ask us most. If something is not covered here, we are one email away.</p>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q">{faq.q}</div>
              <p className="faq-a">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <div className="faq-footer-title">Still have a question?</div>
          <p className="faq-footer-desc">
            Reach us at{" "}
            <a href="mailto:editor@shegotcardboard.com" className="faq-footer-link">
              editor@shegotcardboard.com
            </a>{" "}
            — we read everything and respond to most of it.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
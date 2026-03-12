export default function ComingSoonPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Caveat:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --terracotta: #d97757;
          --terracotta-deep: #c4653f;
          --terracotta-blush: #f0cbb8;
          --slate: #3d3935;
          --slate-soft: #5a5550;
          --slate-ghost: #9a948e;
          --forest: #3d6b4a;
          --forest-light: #6b9d7a;
          --forest-mist: #d4e8da;
          --cream: #faf6f1;
          --warm-white: #fdfaf7;
        }

        .cs-page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--slate);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        /* Subtle background texture */
        .cs-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(217,119,87,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(61,107,74,0.05) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Decorative card shapes in background */
        .bg-card {
          position: absolute;
          border-radius: 8px;
          border: 1px solid rgba(217,119,87,0.12);
          background: rgba(255,255,255,0.4);
          transform-origin: center;
        }

        .bg-card-1 {
          width: 60px; height: 84px;
          top: 8%; left: 6%;
          transform: rotate(-15deg);
          opacity: 0.5;
        }

        .bg-card-2 {
          width: 48px; height: 67px;
          top: 12%; left: 9%;
          transform: rotate(-8deg);
          opacity: 0.35;
          background: rgba(217,119,87,0.08);
        }

        .bg-card-3 {
          width: 70px; height: 98px;
          bottom: 10%; right: 7%;
          transform: rotate(12deg);
          opacity: 0.4;
        }

        .bg-card-4 {
          width: 50px; height: 70px;
          bottom: 15%; right: 11%;
          transform: rotate(5deg);
          opacity: 0.3;
          background: rgba(61,107,74,0.08);
        }

        .bg-card-5 {
          width: 40px; height: 56px;
          top: 55%; left: 3%;
          transform: rotate(20deg);
          opacity: 0.25;
        }

        .bg-card-6 {
          width: 55px; height: 77px;
          top: 20%; right: 4%;
          transform: rotate(-18deg);
          opacity: 0.3;
        }

        /* Main content */
        .cs-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 640px;
          width: 100%;
        }

        /* Logo */
        .cs-logo {
          font-family: 'Caveat', cursive;
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--slate);
          margin-bottom: 2.5rem;
          letter-spacing: 0.01em;
        }

        .cs-logo span {
          color: var(--terracotta);
        }

        /* Hero card illustration */
        .cs-card-illustration {
          width: 80px;
          height: 112px;
          margin: 0 auto 2rem;
          position: relative;
        }

        .cs-card-illustration svg {
          width: 100%;
          height: 100%;
        }

        /* Headline */
        .cs-headline {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2.4rem, 6vw, 3.8rem);
          font-weight: 400;
          line-height: 1.1;
          color: var(--slate);
          margin-bottom: 1rem;
        }

        .cs-headline em {
          font-style: italic;
          color: var(--terracotta);
        }

        /* Tagline */
        .cs-tagline {
          font-size: 1.05rem;
          font-weight: 400;
          color: var(--slate-soft);
          line-height: 1.6;
          margin-bottom: 2.5rem;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Divider */
        .cs-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 auto 2.5rem;
          max-width: 320px;
        }

        .cs-divider-line {
          flex: 1;
          height: 1px;
          background: var(--terracotta-blush);
        }

        .cs-divider-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--terracotta);
          opacity: 0.5;
        }

        /* Email form */
        .cs-form {
          display: flex;
          gap: 8px;
          max-width: 420px;
          margin: 0 auto 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .cs-input {
          flex: 1;
          min-width: 220px;
          padding: 0.75rem 1rem;
          border: 1.5px solid rgba(61,57,53,0.15);
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          color: var(--slate);
          background: white;
          outline: none;
          transition: border-color 0.2s;
        }

        .cs-input:focus {
          border-color: var(--terracotta);
        }

        .cs-input::placeholder {
          color: var(--slate-ghost);
        }

        .cs-btn {
          padding: 0.75rem 1.5rem;
          background: var(--terracotta);
          color: white;
          border: none;
          border-radius: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          white-space: nowrap;
        }

        .cs-btn:hover {
          background: var(--terracotta-deep);
          transform: translateY(-1px);
        }

        .cs-btn:active {
          transform: translateY(0);
        }

        /* Fine print */
        .cs-fine {
          font-size: 0.75rem;
          color: var(--slate-ghost);
          margin-bottom: 3rem;
        }

        /* Teaser pills */
        .cs-teaser {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .cs-pill {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.35rem 0.85rem;
          border-radius: 100px;
          background: white;
          border: 1px solid rgba(61,57,53,0.12);
          color: var(--slate-soft);
        }

        .cs-pill.forest {
          background: var(--forest-mist);
          border-color: rgba(61,107,74,0.2);
          color: var(--forest);
        }

        .cs-pill.terracotta {
          background: rgba(217,119,87,0.08);
          border-color: rgba(217,119,87,0.25);
          color: var(--terracotta-deep);
        }

        /* Footer note */
        .cs-footer {
          font-size: 0.75rem;
          color: var(--slate-ghost);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="cs-page">
        {/* Background card shapes */}
        <div className="bg-card bg-card-1" />
        <div className="bg-card bg-card-2" />
        <div className="bg-card bg-card-3" />
        <div className="bg-card bg-card-4" />
        <div className="bg-card bg-card-5" />
        <div className="bg-card bg-card-6" />

        <div className="cs-content">

          {/* Logo */}
          <div className="cs-logo">
            She Got <span>Cardboard</span>
          </div>

          {/* Card illustration */}
          <div className="cs-card-illustration">
            <svg viewBox="0 0 80 112" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.5" y="1.5" width="77" height="109" rx="6.5" fill="white" stroke="#d97757" strokeWidth="2"/>
              <rect x="6" y="6" width="68" height="72" rx="3" fill="#faf6f1"/>
              <path d="M40 18 L42 30 L54 32 L42 34 L40 46 L38 34 L26 32 L38 30 Z" fill="#d97757" opacity="0.6"/>
              <rect x="14" y="86" width="52" height="3" rx="1.5" fill="#3d3935" opacity="0.1"/>
              <rect x="20" y="94" width="40" height="2.5" rx="1.25" fill="#3d3935" opacity="0.07"/>
              <rect x="24" y="101" width="32" height="2" rx="1" fill="#3d3935" opacity="0.05"/>
            </svg>
          </div>

          {/* Headline */}
          <h1 className="cs-headline">
            Her card.<br />
            <em>Your collection.</em><br />
            Her story.
          </h1>

          {/* Tagline */}
          <p className="cs-tagline">
            The first editorial home for women's sports cards — celebrating the athletes, the stories, and the collectors who know.
          </p>

          <div className="cs-divider">
            <div className="cs-divider-line" />
            <div className="cs-divider-dot" />
            <div className="cs-divider-line" />
          </div>

          {/* Teaser pills */}
          <div className="cs-teaser">
            <span className="cs-pill terracotta">Player Spotlights</span>
            <span className="cs-pill forest">SGC Celebrates</span>
            <span className="cs-pill">Collecting 101</span>
            <span className="cs-pill terracotta">Members Only</span>
          </div>

          {/* Email signup */}
          <div className="cs-form">
            <input
              className="cs-input"
              type="email"
              placeholder="your@email.com"
            />
            <button className="cs-btn">
              Notify Me
            </button>
          </div>

          <p className="cs-fine">
            Be first to know when we launch. No spam, ever.
          </p>

          {/* Footer */}
          <p className="cs-footer">
            shegotcardboard.com · Coming Soon
          </p>

        </div>
      </div>
    </>
  );
}

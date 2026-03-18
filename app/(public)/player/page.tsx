import Nav from "@/components/layout/Nav";

export default function PlayersPage() {
  return (
    <div className="sgc-page">
      <Nav />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: 16 }}>Players</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--slate)', marginBottom: 16 }}>Meet the Players</h1>
        <p style={{ fontSize: '1rem', color: 'var(--slate-soft)', maxWidth: 480, margin: '0 auto' }}>The women whose names belong on cardboard. Player profiles coming soon.</p>
      </div>
    </div>
  );
}
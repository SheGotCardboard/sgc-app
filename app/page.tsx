export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
     <img
        src="/logo.png"
        alt="She Got Cardboard logo"
        className="w-[500px] md:w-[650px] mb-6"
/>

      {/* Positioning Statement */}
      <p className="max-w-xl text-left text-gray-600 leading-relaxed mb-10">
        She Got Cardboard is the modern, data‑driven platform for women’s sports
        card collectors — empowering fans with clear insights, player‑centric
        analysis, and a smarter way to build their personal collections.
      </p>

      {/* Coming Soon */}
      <div className="text-center">
        <span className="text-sm uppercase tracking-widest text-gray-500">
          Coming Soon
        </span>
      </div>
    </main>
  );
}
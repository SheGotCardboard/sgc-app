# SGC Next.js Project Structure

## Stack
- Next.js 14 (App Router)
- Supabase JS client
- CSS Modules (no Tailwind — preserves exact SGC design tokens)
- Vercel deployment

## File Structure
app/
  layout.js          — Root layout: fonts, nav, footer, grain texture
  page.js            — Home: hero + spotlight + celebrates + collect
  globals.css        — All CSS tokens from v4.2
  players/
    page.js          — Player directory
    [slug]/
      page.js        — Individual player profile
  editorial/
    spotlight/
      page.js        — Spotlight archive
      [slug]/page.js — Individual spotlight
    celebrates/
      page.js        — Celebrates archive
      [slug]/page.js — Individual celebrates
    collect/
      page.js        — Collect archive
      [slug]/page.js — Individual collect piece
  eras/
    page.js          — Era index
    [slug]/page.js   — Individual era
  teams/
    [slug]/page.js   — Team page
  cards/
    page.js          — Card browser
lib/
  supabase.js        — Supabase client (server + browser)
  queries.js         — All DB query functions
  utils.js           — slugify, formatDate, etc.
components/
  Nav.js             — Top navigation
  Footer.js          — Footer
  HeroFan.js         — 3-card hero carousel
  SpotlightFeature.js
  CelebrationCard.js
  PlayerCard.js
  EraCard.js
  CardDisplay.js

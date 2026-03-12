# She Got Cardboard — shegotcardboard.com

> Collect Her Story

Next.js 14 site with Supabase backend. Weekly editorial content + live player database.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL v2.4 schema) |
| Hosting | Vercel |
| Domain | shegotcardboard.com (Network Solutions DNS → Vercel) |
| Fonts | DM Serif Display · Plus Jakarta Sans · Caveat |

---

## Local Setup

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/sgc-site.git
cd sgc-site
npm install
```

### 2. Environment variables
```bash
cp .env.local.example .env.local
```
Fill in your Supabase URL and anon key. These are already in `.env.local.example`.

**Never commit `.env.local` to GitHub.** It's in `.gitignore`.

### 3. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deployment to Vercel

### First deploy
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → select repo
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy

### Custom domain
1. In Vercel: Settings → Domains → Add `shegotcardboard.com`
2. Vercel gives you two DNS records (A record + CNAME)
3. In Network Solutions: DNS Management → add those records
4. Wait 10–30 min for propagation

### Auto-deploy
Every push to `main` branch triggers a Vercel redeploy automatically.

---

## Site Structure

```
/                           → Homepage (hero fan + all three sections)
/players                    → Player directory
/players/[slug]             → Individual player profile
/editorial/spotlight        → Spotlight archive
/editorial/spotlight/[slug] → Individual spotlight piece
/editorial/celebrates       → Celebrates archive
/editorial/celebrates/[slug]→ Individual celebrates piece
/editorial/collect          → Collecting 101 archive
/editorial/collect/[slug]   → Individual collect piece
/eras                       → Era index
/eras/[slug]                → Individual era page
```

---

## Data Flow

```
Supabase DB → lib/queries.js → app/*/page.js (server components) → rendered HTML
```

All DB queries are in `lib/queries.js`. Pages are server components by default —
they fetch data at build time and revalidate every hour (`revalidate = 3600`).

Client components (Nav, HeroFan) are marked `'use client'` and handle interactivity only.

---

## Adding Content

### New editorial piece
1. Fill in `SGC-Working-vX.X.xlsx` → Ed Calendar tab
2. Send workbook back to Claude → receive INSERT SQL
3. Run SQL in Supabase SQL Editor
4. Page auto-appears at `/editorial/[type]/[slug]` on next revalidation

### New player
1. Fill in Players tab in working workbook
2. Send back → receive INSERT SQL
3. Run SQL
4. Player appears at `/players/[slug]`

### Revalidation
Pages revalidate every hour. To force immediate refresh after a data update:
- Push any commit to GitHub (triggers full redeploy), OR
- Use Vercel Dashboard → Deployments → Redeploy

---

## Schema Version

Current: **v2.4**  
31 tables · 23 indexes · Supabase project: `smgqjzddhzcpatwwqlci`

See `/docs/schema/` for full ERD and migration scripts.

---

## Design System

All design tokens live in `app/globals.css`. Colors, typography, shadows, and
spacing match the SGC Palette v2 (locked). See `SGC-DECISIONS.md` for brand guidelines.

| Font | Use |
|------|-----|
| DM Serif Display | Headlines, article titles, player names |
| Plus Jakarta Sans | Body, UI, navigation |
| Caveat | Logo, handwritten accents |

---

*She Got Cardboard · Collect Her Story · shegotcardboard.com*

# Deploy to Vercel

## Prerequisites

- [Vercel](https://vercel.com) account
- [Supabase](https://supabase.com) project (optional but recommended for auth, cloud picks, leagues, realtime)
- [API-Football](https://www.api-football.com/) key (optional for live score sync)

## 1. Supabase setup

1. Create a project at supabase.com
2. Run migrations in SQL editor (in order):
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/002_app_snapshots.sql`
3. Enable Google OAuth under Authentication → Providers (optional)
4. Enable Realtime on `app_match_snapshots` (migration 002 adds it to publication)

## 2. Environment variables

Copy `.env.example` to `.env.local` for local dev, then add the same vars in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | For auth/cloud | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth/cloud | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | For sync API | Service role key (server only) |
| `FOOTBALL_API_KEY` | For live scores | API-Football key |
| `FOOTBALL_LEAGUE_ID` | Optional | Default `1` (World Cup) |
| `FOOTBALL_SEASON` | Optional | Default `2026` |
| `CRON_SECRET` | For cron sync | Random secret for `/api/sync` and cron route |

## 3. Deploy

```bash
npm install
npm run build
npx vercel --prod
```

Or connect the GitHub repo in Vercel for automatic deploys on push.

## 4. Cron (live sync)

`vercel.json` configures a cron job to hit `/api/cron/sync-matches` every 5 minutes during the tournament. Set `CRON_SECRET` in Vercel env vars.

Manual sync (admin):

```bash
curl -X POST https://your-app.vercel.app/api/sync \
  -H "x-admin-key: YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"source":"manual"}'
```

## 5. PWA

The app registers a service worker at `/sw.js` and ships `manifest.json`. Users can “Add to Home Screen” on mobile. Enable kickoff reminders from the navbar bell icon (requires notification permission).

## Demo mode

Without Supabase or Football API keys, the app runs fully in demo mode:

- Bracket data from `src/lib/data/tournament.ts`
- Predictions in localStorage
- Leagues in localStorage
- 30s polling for bracket refresh

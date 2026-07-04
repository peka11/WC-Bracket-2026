# World Cup Bracket Challenge

Interactive circular tournament bracket for FIFA World Cup 2026 with live scores, predictions, and leaderboards.

## Stack

- Next.js 15 · React 19 · TypeScript · Tailwind CSS
- Framer Motion · Recharts
- Supabase (Auth, PostgreSQL, Realtime)
- API-Football for live match data

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access |
| `FOOTBALL_API_KEY` | API-Football key from api-football.com |
| `CRON_SECRET` | Secret for cron/sync endpoints |

## Database

Apply migrations:

```bash
supabase db push
```

Or run `supabase/migrations/001_initial.sql` in the Supabase SQL editor.

## Live sync

- Cron hits `/api/cron/sync-matches` every minute (see `vercel.json`)
- Manual sync via Admin dashboard or `POST /api/sync` with `x-admin-key` header
- Webhook endpoint: `POST /api/webhooks/football`

Without `FOOTBALL_API_KEY`, the app runs in **demo mode** with sample matches and a live bracket.

## Deploy

```bash
npm run build
```

Deploy to Vercel and set environment variables. Enable Supabase Realtime on `matches`, `bracket_slots`, and `leaderboard_entries`.

# TradeJournal

TradeJournal is a personal trading journal and analytics dashboard for reviewing trade performance, journaling behavior, and improving execution discipline.

## Overview

This project uses React + Vite + TypeScript on the frontend, Supabase for authentication, Postgres data storage, RLS-secured tables, and Cloudflare Pages for deployment. It is designed for personal use and can be run locally or deployed without a backend server.

## Tech stack

- React
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Recharts
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Vitest
- Lucide React

## Prerequisites

- Node.js 20+
- npm
- A Supabase project
- GitHub account
- Cloudflare Pages account

## Installation

```bash
npm install
```

## Environment variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase project creation

1. Create a new project in Supabase.
2. Note the project URL.
3. Open Project Settings → API and copy the `anon/public` key.
4. Add the values to `.env`.

## Running SQL migrations

Run the initial migration in the Supabase SQL editor:

```sql
-- open supabase/migrations/001_initial_schema.sql
```

Ensure the tables and RLS policies exist.

## Creating storage bucket

Create a storage bucket named:

```text
trade-screenshots
```

Use the default private bucket configuration. Provide a policy for users to upload, view, and delete only their own screenshot paths.

## Running locally

```bash
npm run dev
```

## Running tests

```bash
npm run test
```

## Building production version

```bash
npm run build
```

## GitHub setup

1. Initialize a git repository.
2. Commit the source.
3. Push to GitHub.

## Cloudflare Pages deployment

1. In Cloudflare Pages, create a new project.
2. Connect your GitHub repository.
3. Framework preset: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy.

## Troubleshooting

- If Vite reports missing env vars, ensure `.env` exists and values are valid.
- If auth fails, verify Supabase Auth is enabled.
- If table queries fail, confirm rows are protected by RLS.
- If screenshots fail, check bucket configuration and storage policy paths.

## Security notes

- Never commit `.env` or service-role secrets.
- Only use the public anon key in the frontend.
- RLS must remain the final enforcement boundary.

## License

This project is for personal trading journaling and analysis. It does not provide financial advice.

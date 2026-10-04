# Supabase setup

## 1. Create a Supabase project

- Sign in to Supabase.
- Create a new project.
- Choose a region close to your users.

## 2. Copy the project URL

- Open Project Settings → API.
- Copy the Project URL.
- Copy the `anon/public` key.

## 3. Configure `.env`

Create a `.env` file from `.env.example` and paste your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Run SQL migration

Open the SQL editor in Supabase and run the contents of:

```text
supabase/migrations/001_initial_schema.sql
```

This creates the user-owned tables and the row level security policies.

## 5. Create the storage bucket

Create a private bucket named:

```text
trade-screenshots
```

Do not make it public. Use user-scoped paths like:

```text
{user_id}/{trade_id}/screenshot.png
```

## 6. Storage policy configuration

Create policies so each user can only:

- upload their own screenshots
- view their own screenshots
- delete their own screenshots

## 7. Enable authentication

In Supabase Auth:

- enable email authentication
- allow sign up and sign in with email/password
- optionally enable email confirmation if desired

## 8. Create the first user

Use the app or Supabase Auth UI to create a first user.

## 9. Verify RLS

Run a quick query in SQL editor to confirm that the tables are protected by RLS and only return records matching `auth.uid()`.

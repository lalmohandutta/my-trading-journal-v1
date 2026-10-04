create extension if not exists "pgcrypto";

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  trade_date date not null,
  symbol text not null,
  segment text not null,
  instrument_type text not null,
  direction text not null check (direction in ('Long', 'Short')),
  option_type text null,
  strike_price numeric null,
  expiry_date date null,
  quantity integer not null check (quantity > 0),
  entry_price numeric not null check (entry_price >= 0),
  exit_price numeric null check (exit_price is null or exit_price >= 0),
  stop_loss numeric null,
  target_price numeric null,
  gross_pnl numeric null,
  charges numeric default 0 check (charges >= 0),
  net_pnl numeric null,
  risk_amount numeric null,
  r_multiple numeric null,
  strategy_id uuid null,
  setup text null,
  timeframe text null,
  market_condition text null,
  entry_reason text null,
  exit_reason text null,
  emotion text null,
  mistake text null,
  followed_plan boolean default true,
  notes text null,
  screenshot_path text null,
  status text default 'CLOSED' check (status in ('OPEN', 'CLOSED')),
  entry_time time null,
  exit_time time null,
  trade_rating integer null check (trade_rating between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text null,
  rules text null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  entry_date date not null,
  title text not null,
  content text not null,
  mood text null,
  market_summary text null,
  lessons text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.trade_tags (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid references public.trades(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  tag text not null,
  created_at timestamptz default now()
);

alter table public.trades enable row level security;
alter table public.strategies enable row level security;
alter table public.journal_entries enable row level security;
alter table public.trade_tags enable row level security;

create policy "Users can view their own trades" on public.trades for select using (auth.uid() = user_id);
create policy "Users can insert their own trades" on public.trades for insert with check (auth.uid() = user_id);
create policy "Users can update their own trades" on public.trades for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own trades" on public.trades for delete using (auth.uid() = user_id);

create policy "Users can view their own strategies" on public.strategies for select using (auth.uid() = user_id);
create policy "Users can insert their own strategies" on public.strategies for insert with check (auth.uid() = user_id);
create policy "Users can update their own strategies" on public.strategies for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own strategies" on public.strategies for delete using (auth.uid() = user_id);

create policy "Users can view their own journal entries" on public.journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert their own journal entries" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own journal entries" on public.journal_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own journal entries" on public.journal_entries for delete using (auth.uid() = user_id);

create policy "Users can view their own trade tags" on public.trade_tags for select using (auth.uid() = user_id);
create policy "Users can insert their own trade tags" on public.trade_tags for insert with check (auth.uid() = user_id);
create policy "Users can update their own trade tags" on public.trade_tags for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own trade tags" on public.trade_tags for delete using (auth.uid() = user_id);

create policy "Users can manage their own screenshots in storage" on storage.objects for all using (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]) with check (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

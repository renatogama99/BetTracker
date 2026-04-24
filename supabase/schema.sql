-- ============================================================
-- BankrollPro — Supabase Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- REMOVE ANY CONFLICTING TRIGGERS (run this first if you get
-- "database error saving new user")
-- ============================================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;

-- ============================================================
-- AUTO-CREATE BANKROLL ON SIGNUP
-- This trigger fires AFTER a new user is created in auth.users
-- and safely creates their initial bankroll record.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.bankroll (user_id, initial_balance, current_balance)
  values (new.id, 0, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- BANKROLL TABLE
-- ============================================================
create table if not exists public.bankroll (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  initial_balance decimal(12, 2) not null default 0,
  current_balance decimal(12, 2) not null default 0,
  created_at timestamp with time zone default now()
);

alter table public.bankroll enable row level security;

drop policy if exists "Users can manage their own bankroll" on public.bankroll;
create policy "Users can manage their own bankroll"
  on public.bankroll
  for all
  using (auth.uid() = user_id);

-- ============================================================
-- BETS TABLE
-- ============================================================
create table if not exists public.bets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  sport text not null,
  event text not null,
  bookmaker text not null,
  odd decimal(8, 2) not null check (odd > 1),
  stake decimal(12, 2) not null check (stake > 0),
  result text not null check (result in ('green', 'red', 'void')),
  profit decimal(12, 2) not null default 0,
  created_at timestamp with time zone default now()
);

alter table public.bets enable row level security;

drop policy if exists "Users can manage their own bets" on public.bets;
create policy "Users can manage their own bets"
  on public.bets
  for all
  using (auth.uid() = user_id);

create index if not exists bets_user_date_idx on public.bets(user_id, date desc);

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('deposit', 'withdrawal')),
  amount decimal(12, 2) not null check (amount > 0),
  date date not null,
  description text,
  created_at timestamp with time zone default now()
);

alter table public.transactions enable row level security;

drop policy if exists "Users can manage their own transactions" on public.transactions;
create policy "Users can manage their own transactions"
  on public.transactions
  for all
  using (auth.uid() = user_id);

create index if not exists transactions_user_date_idx on public.transactions(user_id, date desc);

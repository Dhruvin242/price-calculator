-- Bloom Factory · initial schema
-- Run this in the Supabase SQL editor (or via the CLI) to reproduce the database.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  business_name text,
  avatar_url    text,
  currency      text not null default 'INR',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Create a profile automatically when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- products: a user's saved pricing configurations
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  name              text not null,
  category          text,
  inputs            jsonb not null default '{}'::jsonb,
  base_cost         numeric(12,2) not null default 0,
  recommended_price numeric(12,2) not null default 0,
  net_profit        numeric(12,2) not null default 0,
  net_margin        numeric(6,4)  not null default 0,
  health            text not null default 'HEALTHY'
                      check (health in ('LOW', 'WATCH', 'HEALTHY')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_user_id_idx on public.products (user_id);
create index if not exists products_user_updated_idx
  on public.products (user_id, updated_at desc);

alter table public.products enable row level security;

drop policy if exists "Users can view their own products" on public.products;
create policy "Users can view their own products"
  on public.products for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own products" on public.products;
create policy "Users can insert their own products"
  on public.products for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own products" on public.products;
create policy "Users can update their own products"
  on public.products for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own products" on public.products;
create policy "Users can delete their own products"
  on public.products for delete
  using (auth.uid() = user_id);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

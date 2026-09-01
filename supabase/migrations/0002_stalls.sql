-- Bloom Factory · Live Stall feature
-- Adds market/pop-up "stalls" and the sales recorded against them, for live P&L.
-- Run after 0001_init.sql.

-- ---------------------------------------------------------------------------
-- stalls: a market day / pop-up event
-- ---------------------------------------------------------------------------
create table if not exists public.stalls (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  name             text not null,
  event_date       date,
  location         text,
  rent             numeric(12,2) not null default 0,
  other_expenses   numeric(12,2) not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists stalls_user_id_idx on public.stalls (user_id);
create index if not exists stalls_user_date_idx on public.stalls (user_id, event_date desc);

alter table public.stalls enable row level security;

drop policy if exists "Users manage their own stalls (select)" on public.stalls;
create policy "Users manage their own stalls (select)"
  on public.stalls for select using (auth.uid() = user_id);

drop policy if exists "Users manage their own stalls (insert)" on public.stalls;
create policy "Users manage their own stalls (insert)"
  on public.stalls for insert with check (auth.uid() = user_id);

drop policy if exists "Users manage their own stalls (update)" on public.stalls;
create policy "Users manage their own stalls (update)"
  on public.stalls for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own stalls (delete)" on public.stalls;
create policy "Users manage their own stalls (delete)"
  on public.stalls for delete using (auth.uid() = user_id);

drop trigger if exists stalls_set_updated_at on public.stalls;
create trigger stalls_set_updated_at
  before update on public.stalls
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- stall_sales: a line of product sold at a stall
--   product_id is nullable (product may be deleted later); name/price/cost are
--   snapshotted so P&L stays stable regardless of later product edits.
-- ---------------------------------------------------------------------------
create table if not exists public.stall_sales (
  id           uuid primary key default gen_random_uuid(),
  stall_id     uuid not null references public.stalls (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  product_id   uuid references public.products (id) on delete set null,
  product_name text not null,
  unit_price   numeric(12,2) not null default 0,
  unit_cost    numeric(12,2) not null default 0,
  quantity     integer not null default 1 check (quantity > 0),
  created_at   timestamptz not null default now()
);

create index if not exists stall_sales_stall_id_idx on public.stall_sales (stall_id);
create index if not exists stall_sales_user_id_idx on public.stall_sales (user_id);

alter table public.stall_sales enable row level security;

drop policy if exists "Users manage their own stall sales (select)" on public.stall_sales;
create policy "Users manage their own stall sales (select)"
  on public.stall_sales for select using (auth.uid() = user_id);

drop policy if exists "Users manage their own stall sales (insert)" on public.stall_sales;
create policy "Users manage their own stall sales (insert)"
  on public.stall_sales for insert with check (auth.uid() = user_id);

drop policy if exists "Users manage their own stall sales (update)" on public.stall_sales;
create policy "Users manage their own stall sales (update)"
  on public.stall_sales for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own stall sales (delete)" on public.stall_sales;
create policy "Users manage their own stall sales (delete)"
  on public.stall_sales for delete using (auth.uid() = user_id);

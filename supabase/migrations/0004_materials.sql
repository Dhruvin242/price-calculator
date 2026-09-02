-- Bloom Factory · Materials library
-- A reusable per-user catalogue of raw materials with their pack costing, so a
-- maker picks a material in the calculator instead of retyping its price.
-- Run after 0003_invoices.sql.

create table if not exists public.materials (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  name              text not null,
  unit              text not null default 'piece',
  package_cost      numeric(12,2) not null default 0,
  units_per_package numeric(12,3) not null default 1
                      check (units_per_package > 0),
  supplier          text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists materials_user_id_idx on public.materials (user_id);
create index if not exists materials_user_name_idx on public.materials (user_id, name);

alter table public.materials enable row level security;

drop policy if exists "Users manage their own materials (select)" on public.materials;
create policy "Users manage their own materials (select)"
  on public.materials for select using (auth.uid() = user_id);

drop policy if exists "Users manage their own materials (insert)" on public.materials;
create policy "Users manage their own materials (insert)"
  on public.materials for insert with check (auth.uid() = user_id);

drop policy if exists "Users manage their own materials (update)" on public.materials;
create policy "Users manage their own materials (update)"
  on public.materials for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own materials (delete)" on public.materials;
create policy "Users manage their own materials (delete)"
  on public.materials for delete using (auth.uid() = user_id);

drop trigger if exists materials_set_updated_at on public.materials;
create trigger materials_set_updated_at
  before update on public.materials
  for each row execute function public.handle_updated_at();

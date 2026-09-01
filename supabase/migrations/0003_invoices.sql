-- Bloom Factory · Invoices feature
-- Adds customers, invoices and invoice line items, plus a per-user/year invoice
-- number sequence and an atomic create_invoice() RPC.
-- Run after 0002_stalls.sql.

-- ---------------------------------------------------------------------------
-- customers: a maker's billed clients
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  name             text not null,
  email            text,
  phone            text,
  billing_address  text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists customers_user_id_idx on public.customers (user_id);
create index if not exists customers_user_name_idx on public.customers (user_id, name);

alter table public.customers enable row level security;

drop policy if exists "Users manage their own customers (select)" on public.customers;
create policy "Users manage their own customers (select)"
  on public.customers for select using (auth.uid() = user_id);

drop policy if exists "Users manage their own customers (insert)" on public.customers;
create policy "Users manage their own customers (insert)"
  on public.customers for insert with check (auth.uid() = user_id);

drop policy if exists "Users manage their own customers (update)" on public.customers;
create policy "Users manage their own customers (update)"
  on public.customers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own customers (delete)" on public.customers;
create policy "Users manage their own customers (delete)"
  on public.customers for delete using (auth.uid() = user_id);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- invoice_counters: per-user, per-year monotonic sequence for invoice numbers.
-- The ON CONFLICT DO UPDATE below row-locks the counter, serializing concurrent
-- callers so numbers never collide (backed by the unique constraint on invoices).
-- ---------------------------------------------------------------------------
create table if not exists public.invoice_counters (
  user_id  uuid not null references auth.users (id) on delete cascade,
  year     integer not null,
  seq      integer not null default 0,
  primary key (user_id, year)
);

alter table public.invoice_counters enable row level security;

drop policy if exists "Users manage their own invoice counters (select)" on public.invoice_counters;
create policy "Users manage their own invoice counters (select)"
  on public.invoice_counters for select using (auth.uid() = user_id);

drop policy if exists "Users manage their own invoice counters (insert)" on public.invoice_counters;
create policy "Users manage their own invoice counters (insert)"
  on public.invoice_counters for insert with check (auth.uid() = user_id);

drop policy if exists "Users manage their own invoice counters (update)" on public.invoice_counters;
create policy "Users manage their own invoice counters (update)"
  on public.invoice_counters for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- invoices: header + snapshot of customer/business details so a printed invoice
-- stays stable even if the customer or profile is later edited or deleted
-- (mirrors the stall_sales snapshot pattern). customer_id is nullable / set null
-- on customer delete for the same reason.
-- ---------------------------------------------------------------------------
create table if not exists public.invoices (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users (id) on delete cascade,
  customer_id               uuid references public.customers (id) on delete set null,
  invoice_number            text not null,
  status                    text not null default 'draft'
                              check (status in ('draft', 'issued', 'paid', 'overdue', 'cancelled')),
  issue_date                date not null default current_date,
  due_date                  date,
  currency                  text not null default 'INR',
  notes                     text,
  payment_terms             text,
  -- snapshots
  customer_name             text not null,
  customer_email            text,
  customer_billing_address  text,
  business_name             text,
  -- totals (server-computed, never trusted from the client)
  subtotal                  numeric(12,2) not null default 0 check (subtotal >= 0),
  total_discount            numeric(12,2) not null default 0 check (total_discount >= 0),
  total_tax                 numeric(12,2) not null default 0 check (total_tax >= 0),
  grand_total               numeric(12,2) not null default 0 check (grand_total >= 0),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint invoices_user_number_unique unique (user_id, invoice_number),
  constraint invoices_due_after_issue check (due_date is null or due_date >= issue_date)
);

create index if not exists invoices_user_created_idx on public.invoices (user_id, created_at desc);
create index if not exists invoices_user_status_idx on public.invoices (user_id, status);
create index if not exists invoices_customer_id_idx on public.invoices (customer_id);

alter table public.invoices enable row level security;

drop policy if exists "Users manage their own invoices (select)" on public.invoices;
create policy "Users manage their own invoices (select)"
  on public.invoices for select using (auth.uid() = user_id);

drop policy if exists "Users manage their own invoices (insert)" on public.invoices;
create policy "Users manage their own invoices (insert)"
  on public.invoices for insert with check (auth.uid() = user_id);

drop policy if exists "Users manage their own invoices (update)" on public.invoices;
create policy "Users manage their own invoices (update)"
  on public.invoices for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own invoices (delete)" on public.invoices;
create policy "Users manage their own invoices (delete)"
  on public.invoices for delete using (auth.uid() = user_id);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- invoice_items: one row per line. Money columns are snapshots of the pricing
-- engine's output at creation time.
-- ---------------------------------------------------------------------------
create table if not exists public.invoice_items (
  id             uuid primary key default gen_random_uuid(),
  invoice_id     uuid not null references public.invoices (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  position       integer not null default 0,
  description    text not null,
  quantity       numeric(12,3) not null check (quantity > 0),
  unit_price     numeric(12,2) not null check (unit_price >= 0),
  discount_type  text not null default 'amount' check (discount_type in ('amount', 'percent')),
  discount_value numeric(12,2) not null default 0 check (discount_value >= 0),
  tax_rate_pct   numeric(5,2) not null default 0 check (tax_rate_pct >= 0 and tax_rate_pct <= 100),
  line_subtotal  numeric(12,2) not null default 0 check (line_subtotal >= 0),
  line_discount  numeric(12,2) not null default 0 check (line_discount >= 0),
  line_tax       numeric(12,2) not null default 0 check (line_tax >= 0),
  line_total     numeric(12,2) not null default 0 check (line_total >= 0),
  created_at     timestamptz not null default now()
);

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id, position);
create index if not exists invoice_items_user_id_idx on public.invoice_items (user_id);

alter table public.invoice_items enable row level security;

drop policy if exists "Users manage their own invoice items (select)" on public.invoice_items;
create policy "Users manage their own invoice items (select)"
  on public.invoice_items for select using (auth.uid() = user_id);

drop policy if exists "Users manage their own invoice items (insert)" on public.invoice_items;
create policy "Users manage their own invoice items (insert)"
  on public.invoice_items for insert with check (auth.uid() = user_id);

drop policy if exists "Users manage their own invoice items (update)" on public.invoice_items;
create policy "Users manage their own invoice items (update)"
  on public.invoice_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own invoice items (delete)" on public.invoice_items;
create policy "Users manage their own invoice items (delete)"
  on public.invoice_items for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- create_invoice(): atomically generates the invoice number and inserts the
-- invoice together with all of its line items in a single transaction. Runs as
-- the caller (security invoker) so RLS applies; customer ownership is also
-- checked explicitly. Totals are passed in already computed by the server.
-- ---------------------------------------------------------------------------
create or replace function public.create_invoice(payload jsonb, items jsonb)
returns public.invoices
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user     uuid := auth.uid();
  v_customer public.customers%rowtype;
  v_year     integer;
  v_seq      integer;
  v_number   text;
  v_invoice  public.invoices%rowtype;
  v_item     jsonb;
  v_pos      integer := 0;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'Invoice must have at least one line item' using errcode = 'P0001';
  end if;

  -- The invoice can only reference a customer the caller owns.
  select * into v_customer
    from public.customers
   where id = (payload ->> 'customer_id')::uuid
     and user_id = v_user;
  if not found then
    raise exception 'Customer not found' using errcode = 'P0002';
  end if;

  v_year := extract(year from coalesce((payload ->> 'issue_date')::date, current_date))::integer;

  -- Atomic per-user/year sequence; ON CONFLICT locks the row.
  insert into public.invoice_counters as c (user_id, year, seq)
    values (v_user, v_year, 1)
    on conflict (user_id, year) do update set seq = c.seq + 1
    returning seq into v_seq;

  v_number := 'INV-' || v_year::text || '-' || lpad(v_seq::text, 4, '0');

  insert into public.invoices (
    user_id, customer_id, invoice_number, status,
    issue_date, due_date, currency, notes, payment_terms,
    customer_name, customer_email, customer_billing_address, business_name,
    subtotal, total_discount, total_tax, grand_total
  ) values (
    v_user,
    v_customer.id,
    v_number,
    coalesce(payload ->> 'status', 'draft'),
    coalesce((payload ->> 'issue_date')::date, current_date),
    nullif(payload ->> 'due_date', '')::date,
    coalesce(payload ->> 'currency', 'INR'),
    nullif(payload ->> 'notes', ''),
    nullif(payload ->> 'payment_terms', ''),
    v_customer.name,
    v_customer.email,
    v_customer.billing_address,
    nullif(payload ->> 'business_name', ''),
    coalesce((payload ->> 'subtotal')::numeric, 0),
    coalesce((payload ->> 'total_discount')::numeric, 0),
    coalesce((payload ->> 'total_tax')::numeric, 0),
    coalesce((payload ->> 'grand_total')::numeric, 0)
  ) returning * into v_invoice;

  for v_item in select * from jsonb_array_elements(items)
  loop
    insert into public.invoice_items (
      invoice_id, user_id, position, description, quantity, unit_price,
      discount_type, discount_value, tax_rate_pct,
      line_subtotal, line_discount, line_tax, line_total
    ) values (
      v_invoice.id,
      v_user,
      v_pos,
      v_item ->> 'description',
      (v_item ->> 'quantity')::numeric,
      (v_item ->> 'unit_price')::numeric,
      coalesce(v_item ->> 'discount_type', 'amount'),
      coalesce((v_item ->> 'discount_value')::numeric, 0),
      coalesce((v_item ->> 'tax_rate_pct')::numeric, 0),
      coalesce((v_item ->> 'line_subtotal')::numeric, 0),
      coalesce((v_item ->> 'line_discount')::numeric, 0),
      coalesce((v_item ->> 'line_tax')::numeric, 0),
      coalesce((v_item ->> 'line_total')::numeric, 0)
    );
    v_pos := v_pos + 1;
  end loop;

  return v_invoice;
end;
$$;

grant execute on function public.create_invoice(jsonb, jsonb) to authenticated;

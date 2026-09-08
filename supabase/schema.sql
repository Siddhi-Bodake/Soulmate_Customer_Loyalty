-- ============================================================================
-- Brew Rewards — Cafe Customer Loyalty System
-- Run this whole file once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES (staff accounts — extends auth.users with a role)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- helper: is the current user an owner?
create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

create policy "Staff can view all profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- profiles are only ever created/edited via the service_role key
-- (see src/lib/supabase/admin.ts) — no insert/update/delete policy
-- is granted to the regular authenticated role on purpose.

-- Auto-create a profile row whenever a new auth user is provisioned
-- (staff creation goes through supabase.auth.admin.createUser with
--  user_metadata: { full_name, role }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'staff')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. CUSTOMERS
-- ----------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  points_balance integer not null default 0,
  joined_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists customers_name_idx on public.customers using gin (to_tsvector('simple', name));
create index if not exists customers_phone_idx on public.customers (phone);

alter table public.customers enable row level security;

create policy "Staff can view customers"
  on public.customers for select
  to authenticated
  using (true);

create policy "Staff can add customers"
  on public.customers for insert
  to authenticated
  with check (true);

create policy "Staff can edit customers"
  on public.customers for update
  to authenticated
  using (true);

create policy "Owners can delete customers"
  on public.customers for delete
  to authenticated
  using (public.is_owner());

-- ----------------------------------------------------------------------------
-- 3. REWARDS (the redeemable catalog, e.g. "Free Coffee – 50 pts")
-- ----------------------------------------------------------------------------
create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points_required integer not null check (points_required > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.rewards enable row level security;

create policy "Staff can view rewards"
  on public.rewards for select
  to authenticated
  using (true);

create policy "Owners can manage rewards"
  on public.rewards for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ----------------------------------------------------------------------------
-- 4. VISITS (one row per checkout where points were earned)
-- ----------------------------------------------------------------------------
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  amount_spent numeric(10, 2) not null check (amount_spent >= 0),
  points_earned integer not null check (points_earned >= 0),
  staff_id uuid references public.profiles (id),
  visit_date timestamptz not null default now()
);

create index if not exists visits_customer_idx on public.visits (customer_id, visit_date desc);
create index if not exists visits_date_idx on public.visits (visit_date desc);

alter table public.visits enable row level security;

create policy "Staff can view visits"
  on public.visits for select
  to authenticated
  using (true);

-- inserts happen exclusively through record_visit() below, but a direct
-- insert policy is kept too in case it's ever called outside the RPC.
create policy "Staff can log visits"
  on public.visits for insert
  to authenticated
  with check (true);

-- ----------------------------------------------------------------------------
-- 5. REDEMPTIONS (one row per reward cashed in)
-- ----------------------------------------------------------------------------
create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  reward_id uuid not null references public.rewards (id),
  points_used integer not null check (points_used > 0),
  staff_id uuid references public.profiles (id),
  redeemed_at timestamptz not null default now()
);

create index if not exists redemptions_customer_idx on public.redemptions (customer_id, redeemed_at desc);

alter table public.redemptions enable row level security;

create policy "Staff can view redemptions"
  on public.redemptions for select
  to authenticated
  using (true);

create policy "Staff can log redemptions"
  on public.redemptions for insert
  to authenticated
  with check (true);

-- ----------------------------------------------------------------------------
-- 6. RPCs — atomic point math lives here, not in the app, so a balance can
--    never drift from a half-finished request.
-- ----------------------------------------------------------------------------

-- Record a visit: 1 point per $10 spent (rounded down), credited instantly.
create or replace function public.record_visit(
  p_customer_id uuid,
  p_amount_spent numeric,
  p_staff_id uuid default auth.uid()
)
returns table (visit_id uuid, points_earned integer, new_balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_points integer;
  v_visit_id uuid;
  v_new_balance integer;
begin
  if p_amount_spent < 0 then
    raise exception 'Amount spent cannot be negative';
  end if;

  v_points := floor(p_amount_spent / 10)::integer;

  insert into public.visits (customer_id, amount_spent, points_earned, staff_id)
  values (p_customer_id, p_amount_spent, v_points, p_staff_id)
  returning id into v_visit_id;

  update public.customers
  set points_balance = points_balance + v_points
  where id = p_customer_id
  returning points_balance into v_new_balance;

  if v_new_balance is null then
    raise exception 'Customer not found';
  end if;

  return query select v_visit_id, v_points, v_new_balance;
end;
$$;

grant execute on function public.record_visit(uuid, numeric, uuid) to authenticated;

-- Redeem a reward: validates balance, deducts points, logs it — all in one go.
create or replace function public.redeem_reward(
  p_customer_id uuid,
  p_reward_id uuid,
  p_staff_id uuid default auth.uid()
)
returns table (redemption_id uuid, points_used integer, new_balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_points_required integer;
  v_current_balance integer;
  v_redemption_id uuid;
  v_new_balance integer;
begin
  select points_required into v_points_required
  from public.rewards where id = p_reward_id and active = true;

  if v_points_required is null then
    raise exception 'Reward not found or inactive';
  end if;

  select points_balance into v_current_balance
  from public.customers where id = p_customer_id
  for update;

  if v_current_balance is null then
    raise exception 'Customer not found';
  end if;

  if v_current_balance < v_points_required then
    raise exception 'Not enough points: has %, needs %', v_current_balance, v_points_required;
  end if;

  update public.customers
  set points_balance = points_balance - v_points_required
  where id = p_customer_id
  returning points_balance into v_new_balance;

  insert into public.redemptions (customer_id, reward_id, points_used, staff_id)
  values (p_customer_id, p_reward_id, v_points_required, p_staff_id)
  returning id into v_redemption_id;

  return query select v_redemption_id, v_points_required, v_new_balance;
end;
$$;

grant execute on function public.redeem_reward(uuid, uuid, uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 7. DASHBOARD HELPERS
-- ----------------------------------------------------------------------------

-- Per-customer lifetime stats, used for "Top 5 most loyal customers".
-- security_invoker means it still runs under the querying user's RLS.
create or replace view public.customer_stats
with (security_invoker = true) as
select
  customer_id,
  count(*) as total_visits,
  coalesce(sum(points_earned), 0) as total_points_earned,
  max(visit_date) as last_visit
from public.visits
group by customer_id;

-- Flat view combining customers with their stats — avoids relying on
-- PostgREST relationship-embedding through a view (which isn't reliable
-- since customer_stats has no real foreign key to customers).
create or replace view public.customers_with_stats
with (security_invoker = true) as
select
  c.*,
  coalesce(cs.total_visits, 0) as total_visits,
  coalesce(cs.total_points_earned, 0) as total_points_earned,
  cs.last_visit
from public.customers c
left join public.customer_stats cs on cs.customer_id = c.id;

-- Top N most loyal customers, ranked by visit frequency then points balance.
create or replace function public.top_loyal_customers(p_limit integer default 5)
returns table (
  customer_id uuid,
  name text,
  phone text,
  points_balance integer,
  total_visits integer
)
language sql
security invoker
set search_path = public
stable
as $$
  select id, name, phone, points_balance, total_visits
  from public.customers_with_stats
  order by total_visits desc, points_balance desc
  limit p_limit;
$$;

grant execute on function public.top_loyal_customers(integer) to authenticated;

-- Visit counts for each of the last 7 days (zero-filled, for the dashboard chart).
create or replace function public.visits_last_7_days()
returns table (day date, visit_count integer)
language sql
security definer
set search_path = public
stable
as $$
  select
    d::date as day,
    count(v.id)::integer as visit_count
  from generate_series(
    current_date - interval '6 days',
    current_date,
    interval '1 day'
  ) as d
  left join public.visits v
    on v.visit_date::date = d::date
  group by d
  order by d;
$$;

grant execute on function public.visits_last_7_days() to authenticated;

-- ----------------------------------------------------------------------------
-- 8. STARTER REWARDS (safe to edit/delete from the Rewards page afterwards)
-- ----------------------------------------------------------------------------
insert into public.rewards (name, points_required) values
  ('Free Coffee', 50),
  ('10% Off Order', 100),
  ('Free Pastry', 75),
  ('Free Lunch Combo', 200)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- 9. BOOTSTRAP YOUR FIRST OWNER ACCOUNT
-- ----------------------------------------------------------------------------
-- 1) Supabase Dashboard → Authentication → Users → Add user
--    (enter your email + a password, check "Auto Confirm User")
-- 2) Then run this, swapping in that email:
--
--   update public.profiles set role = 'owner'
--   where id = (select id from auth.users where email = 'you@example.com');
--
-- Every staff account created afterwards (via the app's Owner-only
-- "Manage Staff" screen) can be created as 'owner' or 'staff' directly.

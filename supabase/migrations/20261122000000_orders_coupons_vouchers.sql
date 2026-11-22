-- Petite Dreams pre-launch add-ons:
-- server-side orders and rooms, influencers and coupons, referral attribution,
-- gift vouchers, broken-link monitoring, questionnaire analytics and admin settings.
--
-- Every table here is written only by design-back with the service-role key.
-- Customers never write these tables directly; RLS stays enabled with no
-- customer policies, and admins read them through the backend.

-- ---------------------------------------------------------------------------
-- Existing tables that were created outside migrations
-- ---------------------------------------------------------------------------

alter table public.petite_profiles
  add column if not exists is_admin boolean not null default false;

create table if not exists public.app_packages (
  id text primary key,
  sort_order integer not null default 0,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Unpublished admin edits. Customers always read `data`; admins edit `draft`
-- and publish copies it into `data`.
alter table public.app_packages add column if not exists draft jsonb;
alter table public.app_packages add column if not exists draft_updated_at timestamptz;
alter table public.app_packages add column if not exists published_at timestamptz;

create table if not exists public.app_color_scales (
  id text primary key,
  sort_order integer not null default 0,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.is_petite_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.petite_profiles where id = auth.uid()),
    false
  );
$$;

alter table public.app_packages enable row level security;
alter table public.app_color_scales enable row level security;

drop policy if exists "app_packages_read" on public.app_packages;
drop policy if exists "app_packages_admin_write" on public.app_packages;
drop policy if exists "app_color_scales_read" on public.app_color_scales;
drop policy if exists "app_color_scales_admin_write" on public.app_color_scales;

create policy "app_packages_read" on public.app_packages
  for select to anon, authenticated using (true);
create policy "app_packages_admin_write" on public.app_packages
  for all to authenticated
  using (public.is_petite_admin()) with check (public.is_petite_admin());
create policy "app_color_scales_read" on public.app_color_scales
  for select to anon, authenticated using (true);
create policy "app_color_scales_admin_write" on public.app_color_scales
  for all to authenticated
  using (public.is_petite_admin()) with check (public.is_petite_admin());

grant select on public.app_packages, public.app_color_scales to anon, authenticated;
grant insert, update, delete on public.app_packages, public.app_color_scales to authenticated;

-- Purchases are now recorded only by the backend after payment. Customers can
-- still edit their own display name, but not purchases, children or admin flag.
revoke insert, update on public.petite_profiles from authenticated;
grant insert (id, email, name) on public.petite_profiles to authenticated;
grant update (name, updated_at) on public.petite_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Rooms: a room is its own entity with its own children list.
-- Two children sharing a room are two children but one room.
-- ---------------------------------------------------------------------------

create table if not exists public.petite_rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  -- [{ name, age, gender }] exactly as entered in the questionnaire
  children jsonb not null default '[]'::jsonb,
  design_gender text not null default '',
  -- { type: 'child', childIndex } | { type: 'bridge', ageGroupId } | null
  age_choice jsonb,
  -- the age group the design was chosen for (0-2 / 3-5 / 6-10)
  age_group text not null default '',
  -- 'child' when designed for one child's age, 'cross-age' for the cross-age track
  age_track text not null default 'child',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists petite_rooms_user_idx on public.petite_rooms (user_id);

-- ---------------------------------------------------------------------------
-- Influencers and coupons
-- ---------------------------------------------------------------------------

create table if not exists public.influencers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null default '',
  phone text not null default '',
  instagram text not null default '',
  notes text not null default '',
  -- personal referral slug used in ?ref=<slug>
  referral_slug text not null unique,
  commission_percent numeric(5,2) not null default 0
    check (commission_percent >= 0 and commission_percent <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  -- stored upper-case, matched case-insensitively
  code text not null unique,
  -- null for general coupons that are not tied to an influencer
  influencer_id uuid references public.influencers(id) on delete set null,
  discount_percent numeric(5,2) not null
    check (discount_percent > 0 and discount_percent <= 100),
  valid_from timestamptz,
  valid_until timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  active boolean not null default true,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coupons_influencer_idx on public.coupons (influencer_id);

-- One row per landing through a referral link. Attribution is honoured for 30
-- days after the visit and only when the visitor consented to the cookie.
create table if not exists public.referral_visits (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references public.influencers(id) on delete cascade,
  visitor_id text not null,
  landing_path text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists referral_visits_visitor_idx on public.referral_visits (visitor_id, created_at desc);
create index if not exists referral_visits_influencer_idx on public.referral_visits (influencer_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Gift vouchers
-- ---------------------------------------------------------------------------

create table if not exists public.gift_vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  packages_count integer not null check (packages_count > 0),
  packages_redeemed integer not null default 0 check (packages_redeemed >= 0),
  price_paid numeric(10,2) not null default 0,
  buyer_user_id uuid references auth.users(id) on delete set null,
  buyer_name text not null default '',
  buyer_email text not null default '',
  recipient_names text not null default '',
  recipient_email text not null default '',
  recipient_phone text not null default '',
  giver_name text not null default '',
  personal_message text not null default '',
  -- email: we email the recipient. whatsapp: buyer shares it. self: emailed to the buyer only.
  delivery_method text not null default 'email' check (delivery_method in ('email', 'whatsapp', 'self')),
  status text not null default 'pending_send'
    check (status in ('pending_send', 'sent', 'partially_redeemed', 'redeemed', 'cancelled')),
  payment_provider text not null default '',
  payment_reference text not null default '',
  sent_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gift_vouchers_redeemed_le_count check (packages_redeemed <= packages_count)
);

create index if not exists gift_vouchers_buyer_idx on public.gift_vouchers (buyer_user_id);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint not null unique default nextval('public.order_number_seq'),
  user_id uuid references auth.users(id) on delete set null,
  email text not null default '',
  kind text not null default 'packages' check (kind in ('packages', 'gift_voucher')),
  status text not null default 'paid' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  subtotal numeric(10,2) not null default 0,
  discount_total numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_option text not null default 'full',
  payment_provider text not null default 'demo',
  payment_reference text not null default '',
  -- coupon and influencer attribution
  coupon_id uuid references public.coupons(id) on delete set null,
  coupon_code text not null default '',
  coupon_percent numeric(5,2) not null default 0,
  influencer_id uuid references public.influencers(id) on delete set null,
  -- 'coupon' or 'link'. An order is attributed once even when both were used.
  attribution text not null default '' check (attribution in ('', 'coupon', 'link')),
  commission_percent numeric(5,2) not null default 0,
  commission_amount numeric(10,2) not null default 0,
  commission_paid_at timestamptz,
  -- gift voucher redemption
  voucher_id uuid references public.gift_vouchers(id) on delete set null,
  voucher_packages_used integer not null default 0,
  -- the voucher this order bought (kind = 'gift_voucher')
  purchased_voucher_id uuid references public.gift_vouchers(id) on delete set null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_influencer_idx on public.orders (influencer_id);
create index if not exists orders_coupon_idx on public.orders (coupon_id);

-- One design package for one room.
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  room_id uuid references public.petite_rooms(id) on delete set null,
  package_id text not null,
  package_name text not null default '',
  theme text not null default '',
  age_group text not null default '',
  design_gender text not null default '',
  color_preference text not null default '',
  wall_design_option text not null default '',
  -- snapshot of the room children at purchase time
  children jsonb not null default '[]'::jsonb,
  -- the package exactly as it was bought (images, shopping list), shown from the archive
  package_snapshot jsonb,
  list_price numeric(10,2) not null default 0,
  -- 'sibling' (extra room), 'coupon', 'voucher' or ''
  discount_type text not null default '',
  discount_amount numeric(10,2) not null default 0,
  price numeric(10,2) not null default 0,
  paid_by_voucher boolean not null default false,
  -- true when this purchase replaced an earlier package of the same room
  is_upgrade boolean not null default false,
  -- set when a later purchase replaced this package for the same room
  archived_at timestamptz,
  replaced_by_item_id uuid references public.order_items(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_room_idx on public.order_items (room_id, created_at desc);
create index if not exists order_items_user_idx on public.order_items (user_id);

create table if not exists public.voucher_redemptions (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references public.gift_vouchers(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  packages_used integer not null check (packages_used > 0),
  reverted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists voucher_redemptions_voucher_idx on public.voucher_redemptions (voucher_id);

-- Redeem atomically so two checkouts can never spend the same packages.
create or replace function public.redeem_gift_voucher(p_voucher_id uuid, p_packages integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer;
  v_use integer;
begin
  select packages_count - packages_redeemed into v_remaining
  from public.gift_vouchers
  where id = p_voucher_id and status <> 'cancelled'
  for update;

  if v_remaining is null or v_remaining <= 0 then
    return 0;
  end if;

  v_use := least(v_remaining, p_packages);

  update public.gift_vouchers
  set packages_redeemed = packages_redeemed + v_use,
      status = case
        when packages_redeemed + v_use >= packages_count then 'redeemed'
        else 'partially_redeemed'
      end,
      updated_at = now()
  where id = p_voucher_id;

  return v_use;
end;
$$;

revoke all on function public.redeem_gift_voucher(uuid, integer) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Broken product link monitoring
-- ---------------------------------------------------------------------------

create table if not exists public.product_link_checks (
  id uuid primary key default gen_random_uuid(),
  package_id text not null,
  package_name text not null default '',
  category text not null default '',
  item_name text not null default '',
  url text not null,
  -- ok / broken / unverified (blocked or timed out, so we could not decide)
  status text not null default 'ok' check (status in ('ok', 'broken', 'unverified')),
  http_status integer,
  problem text not null default '',
  consecutive_failures integer not null default 0,
  first_failed_at timestamptz,
  last_checked_at timestamptz,
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  unique (package_id, url)
);

create index if not exists product_link_checks_status_idx on public.product_link_checks (status);

create table if not exists public.link_check_runs (
  id uuid primary key default gen_random_uuid(),
  trigger text not null default 'cron' check (trigger in ('cron', 'manual')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  total_links integer not null default 0,
  checked_links integer not null default 0,
  ok_count integer not null default 0,
  broken_count integer not null default 0,
  unverified_count integer not null default 0,
  report_sent_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Questionnaire analytics
-- ---------------------------------------------------------------------------

create table if not exists public.questionnaire_events (
  id bigint generated always as identity primary key,
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  -- start / step / complete / cart / purchase
  event text not null,
  step_kind text not null default '',
  step_index integer,
  created_at timestamptz not null default now()
);

create index if not exists questionnaire_events_created_idx on public.questionnaire_events (created_at);
create index if not exists questionnaire_events_session_idx on public.questionnaire_events (session_id);

-- The answers of each completed questionnaire, used for the children statistics.
create table if not exists public.questionnaire_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  rooms jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists questionnaire_submissions_created_idx on public.questionnaire_submissions (created_at);

-- ---------------------------------------------------------------------------
-- Admin-editable settings (voucher prices, voucher email text, ...)
-- ---------------------------------------------------------------------------

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
drop policy if exists "app_settings_read" on public.app_settings;
create policy "app_settings_read" on public.app_settings
  for select to anon, authenticated using (key in ('gift_voucher_prices', 'guide_videos', 'application_guides'));
grant select on public.app_settings to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS: backend-only tables
-- ---------------------------------------------------------------------------

alter table public.petite_rooms enable row level security;
alter table public.influencers enable row level security;
alter table public.coupons enable row level security;
alter table public.referral_visits enable row level security;
alter table public.gift_vouchers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.voucher_redemptions enable row level security;
alter table public.product_link_checks enable row level security;
alter table public.link_check_runs enable row level security;
alter table public.questionnaire_events enable row level security;
alter table public.questionnaire_submissions enable row level security;

-- Customers may read their own rooms and orders (used by the personal area).
drop policy if exists "petite_rooms_select_own" on public.petite_rooms;
create policy "petite_rooms_select_own" on public.petite_rooms
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own" on public.order_items
  for select to authenticated using (auth.uid() = user_id);

grant select on public.petite_rooms, public.orders, public.order_items to authenticated;

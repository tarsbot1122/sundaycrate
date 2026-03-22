-- SundayCrate Database Schema
-- Therapy Resources Marketplace

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  stripe_account_id text,
  avatar_url text,
  bio text,
  practice_name text,
  created_at timestamptz not null default now()
);

-- RLS for users
alter table public.users enable row level security;

create policy "Users can read any profile"
  on public.users for select
  using (true);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  icon text not null default 'ShoppingBag',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- RLS for categories
alter table public.categories enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

create policy "Only admins can manage categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Seed categories
insert into public.categories (name, slug, description, icon, sort_order) values
  ('CBT Worksheets', 'cbt-worksheets', 'Thought records, cognitive distortions, behavioral activation', 'Brain', 1),
  ('DBT Worksheets', 'dbt-worksheets', 'Emotion regulation, distress tolerance, mindfulness, interpersonal effectiveness', 'HeartHandshake', 2),
  ('Intake & Assessment Forms', 'intake-assessment-forms', 'Client intake, consent forms, treatment plans, progress notes', 'ClipboardList', 3),
  ('Couples & Relationship', 'couples-relationship', 'Communication worksheets, conflict resolution, attachment styles', 'Users', 4),
  ('Anxiety & Stress Management', 'anxiety-stress-management', 'Worry logs, grounding exercises, coping strategy cards', 'ShieldCheck', 5),
  ('EMDR Resources', 'emdr-resources', 'Processing worksheets, bilateral stimulation guides', 'Eye', 6),
  ('Trauma & PTSD', 'trauma-ptsd', 'Safety plans, trigger identification, trauma timelines', 'Shield', 7),
  ('Practice Management', 'practice-management', 'Session notes, billing templates, client trackers, treatment plan templates', 'Briefcase', 8),
  ('Art Therapy', 'art-therapy', 'Guided art prompts, emotion wheels, expressive worksheets', 'Palette', 9),
  ('IFS (Internal Family Systems)', 'ifs-internal-family-systems', 'Parts mapping, self-leadership worksheets', 'Layers', 10),
  ('Somatic Therapy', 'somatic-therapy', 'Body mapping, interoceptive awareness, nervous system regulation', 'Activity', 11),
  ('Therapy Posters & Office Decor', 'therapy-posters-office-decor', 'Grounding techniques, emotion wheels, coping skills posters', 'Frame', 12);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  price_cents int not null default 0 check (price_cents >= 0),
  category text not null,
  subcategory text,
  preview_images text[] not null default '{}',
  file_url text not null,
  file_type text not null default 'pdf',
  download_count int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'flagged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for common queries
create index idx_products_status on public.products(status);
create index idx_products_seller on public.products(seller_id);
create index idx_products_category on public.products(category);
create index idx_products_created on public.products(created_at desc);

-- RLS for products
alter table public.products enable row level security;

create policy "Active products are publicly readable"
  on public.products for select
  using (
    status = 'active'
    or seller_id = auth.uid()
    or exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Sellers can insert own products"
  on public.products for insert
  with check (
    seller_id = auth.uid()
    and exists (
      select 1 from public.users
      where id = auth.uid() and role = 'seller'
    )
  );

create policy "Sellers can update own products"
  on public.products for update
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy "Admins can update any product"
  on public.products for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Sellers can delete own products"
  on public.products for delete
  using (seller_id = auth.uid());

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row
  execute function update_updated_at();

-- ============================================================
-- ORDERS TABLE
-- ============================================================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references public.users(id) on delete cascade,
  amount_cents int not null,
  platform_fee_cents int not null,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'refunded', 'failed')),
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_orders_buyer on public.orders(buyer_id);
create index idx_orders_seller on public.orders(seller_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at desc);

-- RLS for orders
alter table public.orders enable row level security;

create policy "Buyers can read own orders"
  on public.orders for select
  using (
    buyer_id = auth.uid()
    or seller_id = auth.uid()
    or exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "System can insert orders (via service role)"
  on public.orders for insert
  with check (true);

create policy "Admins can update orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Increment download count (used by webhook)
create or replace function increment_download_count(p_product_id uuid)
returns void as $$
begin
  update public.products
  set download_count = download_count + 1
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these in the Supabase dashboard or via the Storage API:
--
-- 1. Create bucket "products" (private - files only accessible via signed URLs)
-- 2. Create bucket "previews" (public - preview images are publicly viewable)
--
-- Storage policies:
-- products bucket:
--   - Authenticated users can upload to their own folder (user_id/*)
--   - Buyers with completed orders can download
--
-- previews bucket:
--   - Authenticated users can upload to their own folder
--   - Anyone can read (public bucket)

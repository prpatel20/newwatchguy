-- =====================================================================
-- NEWWATCHGUY — SUPABASE SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- PROFILES (admin users)
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- BRANDS
-- ---------------------------------------------------------------------
create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  logo text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  brand_id uuid references brands(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  subcategory text,
  short_description text,
  description text,
  price numeric(12,2),
  original_price numeric(12,2),
  discount_percent numeric(5,2) generated always as (
    case when original_price is not null and original_price > 0 and price is not null
      then round(((original_price - price) / original_price) * 100, 0)
      else 0 end
  ) stored,
  currency text not null default 'INR',
  price_updated_at timestamptz default now(),
  watch_type text,
  movement text,
  strap_material text,
  case_material text,
  dial_color text,
  case_size text,
  water_resistance text,
  gender text,
  style text,
  occasion text,
  rating numeric(2,1) default 0,
  rating_count integer default 0,
  retailer text,
  affiliate_url text,
  affiliate_network text,
  affiliate_disclosure text,
  main_image text,
  image_alt text,
  status text not null default 'draft' check (status in ('draft','published')),
  is_featured boolean not null default false,
  is_deal boolean not null default false,
  is_editor_pick boolean not null default false,
  seo_title text,
  seo_description text,
  keywords text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_status on products(status);
create index if not exists idx_products_brand on products(brand_id);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_deal on products(is_deal);
create index if not exists idx_products_featured on products(is_featured);
create index if not exists idx_products_editor_pick on products(is_editor_pick);

-- ---------------------------------------------------------------------
-- PRODUCT IMAGES (extra gallery images, beyond main_image)
-- ---------------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- NEWSLETTER SUBSCRIBERS
-- ---------------------------------------------------------------------
create table if not exists newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  status text not null default 'active' check (status in ('active','unsubscribed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- SITE SETTINGS (single row, key/value style is simpler for beginners)
-- ---------------------------------------------------------------------
create table if not exists site_settings (
  id int primary key default 1,
  site_name text default 'NewWatchGuy',
  logo_url text,
  instagram_url text,
  youtube_url text,
  facebook_url text,
  pinterest_url text,
  contact_email text,
  default_currency text default 'INR',
  affiliate_disclosure text default 'NewWatchGuy may earn a commission when you purchase through certain links on this website, at no additional cost to you.',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- AFFILIATE CLICK TRACKING (optional analytics)
-- ---------------------------------------------------------------------
create table if not exists product_clicks (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  retailer text,
  page text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- updated_at trigger for products
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- auto-create a profile row whenever a new auth user signs up
-- ---------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'admin');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

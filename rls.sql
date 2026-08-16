-- =====================================================================
-- NEWWATCHGUY — ROW LEVEL SECURITY (RLS)
-- Run this AFTER schema.sql, in Supabase SQL Editor.
-- =====================================================================

-- Enable RLS on every table
alter table profiles enable row level security;
alter table brands enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table newsletter_subscribers enable row level security;
alter table site_settings enable row level security;
alter table product_clicks enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin','editor')
  );
$$ language sql security definer stable;

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- BRANDS — public read, admin write
-- ---------------------------------------------------------------------
drop policy if exists "brands_public_read" on brands;
create policy "brands_public_read" on brands for select using (true);

drop policy if exists "brands_admin_write" on brands;
create policy "brands_admin_write" on brands for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- CATEGORIES — public read, admin write
-- ---------------------------------------------------------------------
drop policy if exists "categories_public_read" on categories;
create policy "categories_public_read" on categories for select using (true);

drop policy if exists "categories_admin_write" on categories;
create policy "categories_admin_write" on categories for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- PRODUCTS — public can read PUBLISHED only; admin full access
-- ---------------------------------------------------------------------
drop policy if exists "products_public_read_published" on products;
create policy "products_public_read_published" on products
  for select using (status = 'published' or is_admin());

drop policy if exists "products_admin_insert" on products;
create policy "products_admin_insert" on products
  for insert with check (is_admin());

drop policy if exists "products_admin_update" on products;
create policy "products_admin_update" on products
  for update using (is_admin()) with check (is_admin());

drop policy if exists "products_admin_delete" on products;
create policy "products_admin_delete" on products
  for delete using (is_admin());

-- ---------------------------------------------------------------------
-- PRODUCT IMAGES — public read (only images of published products,
-- or any image if admin), admin write
-- ---------------------------------------------------------------------
drop policy if exists "product_images_public_read" on product_images;
create policy "product_images_public_read" on product_images
  for select using (
    is_admin() or exists (
      select 1 from products p
      where p.id = product_images.product_id and p.status = 'published'
    )
  );

drop policy if exists "product_images_admin_write" on product_images;
create policy "product_images_admin_write" on product_images
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- NEWSLETTER — anyone can insert (subscribe), only admin can read/manage
-- ---------------------------------------------------------------------
drop policy if exists "newsletter_public_insert" on newsletter_subscribers;
create policy "newsletter_public_insert" on newsletter_subscribers
  for insert with check (true);

drop policy if exists "newsletter_admin_read" on newsletter_subscribers;
create policy "newsletter_admin_read" on newsletter_subscribers
  for select using (is_admin());

drop policy if exists "newsletter_admin_manage" on newsletter_subscribers;
create policy "newsletter_admin_manage" on newsletter_subscribers
  for update using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- SITE SETTINGS — public read, admin write
-- ---------------------------------------------------------------------
drop policy if exists "settings_public_read" on site_settings;
create policy "settings_public_read" on site_settings for select using (true);

drop policy if exists "settings_admin_write" on site_settings;
create policy "settings_admin_write" on site_settings for update
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- PRODUCT CLICKS — anyone can insert (fire-and-forget tracking),
-- only admin can read
-- ---------------------------------------------------------------------
drop policy if exists "clicks_public_insert" on product_clicks;
create policy "clicks_public_insert" on product_clicks
  for insert with check (true);

drop policy if exists "clicks_admin_read" on product_clicks;
create policy "clicks_admin_read" on product_clicks
  for select using (is_admin());

-- ---------------------------------------------------------------------
-- STORAGE — bucket "product-images"
-- Create the bucket first in Dashboard → Storage → New bucket
-- named exactly: product-images  (set it to PUBLIC)
-- Then run the policies below.
-- ---------------------------------------------------------------------
drop policy if exists "product_images_storage_public_read" on storage.objects;
create policy "product_images_storage_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_storage_admin_insert" on storage.objects;
create policy "product_images_storage_admin_insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and is_admin());

drop policy if exists "product_images_storage_admin_update" on storage.objects;
create policy "product_images_storage_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and is_admin());

drop policy if exists "product_images_storage_admin_delete" on storage.objects;
create policy "product_images_storage_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and is_admin());

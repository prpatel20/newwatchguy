-- =====================================================================
-- NEWWATCHGUY — SEED DATA
-- Run this AFTER schema.sql and rls.sql.
-- This recreates the original demo products (Seiko, Titan, Samsung,
-- Fossil, Michael Kors, etc.) as real database rows so the site is not
-- empty on first launch. Edit or delete these from the Admin Panel
-- any time — this file only needs to run once.
-- =====================================================================

insert into categories (name, slug) values
  ('Men''s Watches', 'mens-watches'),
  ('Women''s Watches', 'womens-watches'),
  ('Luxury Watches', 'luxury-watches'),
  ('Automatic Watches', 'automatic-watches'),
  ('Smart Watches', 'smart-watches'),
  ('Chronograph', 'chronograph'),
  ('Dress Watches', 'dress-watches'),
  ('Casual Watches', 'casual-watches'),
  ('Budget Watches', 'budget-watches')
on conflict (slug) do nothing;

insert into brands (name, slug) values
  ('Seiko', 'seiko'),
  ('Titan', 'titan'),
  ('Samsung', 'samsung'),
  ('Fossil', 'fossil'),
  ('Michael Kors', 'michael-kors'),
  ('Casio', 'casio'),
  ('Apple', 'apple')
on conflict (slug) do nothing;

-- Sample published products (replace main_image with your uploaded
-- Supabase Storage URLs, and affiliate_url with your real links)
insert into products
  (name, slug, brand_id, category_id, short_description, description,
   price, original_price, currency, movement, case_size, water_resistance,
   rating, rating_count, retailer, affiliate_url, main_image, image_alt,
   status, is_featured, is_deal, is_editor_pick, seo_title, seo_description)
select
  v.name, v.slug,
  (select id from brands where slug = v.brand_slug),
  (select id from categories where slug = v.category_slug),
  v.short_description, v.description,
  v.price, v.original_price, 'INR', v.movement, v.case_size, v.water_resistance,
  v.rating, v.rating_count, v.retailer, v.affiliate_url, v.main_image, v.image_alt,
  'published', v.is_featured, v.is_deal, v.is_editor_pick, v.name, v.short_description
from (values
  ('Seiko Presage Automatic', 'seiko-presage-automatic', 'seiko', 'automatic-watches',
   'Traditional analog timekeeping with a sophisticated look.',
   'The Seiko Presage Automatic brings together classic Japanese watchmaking with a refined dress-watch silhouette. A self-winding automatic movement, sunburst dial and sapphire crystal make it a superb everyday-luxury pick.',
   18990, 24990, 'Automatic', '40.5mm', '50m', 4.6, 312, 'Amazon',
   'https://www.amazon.in/s?k=seiko+presage', 'images/watch-automatic.jpg', 'Seiko Presage automatic watch',
   true, true, true),
  ('Titan Neo Chronograph', 'titan-neo-chronograph', 'titan', 'chronograph',
   'Business casual friendly, perfect for office and professional settings.',
   'The Titan Neo Chronograph pairs a bold stainless steel case with a precise quartz chronograph movement — a versatile watch that moves easily from the boardroom to the weekend.',
   6495, 8995, 'Quartz Chronograph', '44mm', '100m', 4.4, 588, 'Flipkart',
   'https://www.flipkart.com/search?q=titan%20neo%20chronograph', 'images/watch-chronograph.jpg', 'Titan Neo chronograph watch',
   true, false, false),
  ('Samsung Galaxy Watch', 'samsung-galaxy-watch', 'samsung', 'smart-watches',
   'Advanced health tracking with a premium always-on display.',
   'The Samsung Galaxy Watch tracks heart rate, sleep and workouts while keeping you connected with notifications, calls and apps right on your wrist — all wrapped in a premium circular design.',
   24999, 29999, 'Smart / Digital', '44mm', '50m (5ATM)', 4.5, 941, 'Amazon',
   'https://www.amazon.in/s?k=samsung+galaxy+watch', 'images/watch-smart.jpg', 'Samsung Galaxy smartwatch',
   true, true, false),
  ('Fossil Grant Men''s Watch', 'fossil-grant-mens-watch', 'fossil', 'mens-watches',
   'Classic leather-strap dress watch with a vintage-inspired dial.',
   'The Fossil Grant combines a genuine leather strap with a stainless steel case and chronograph subdials for a timeless, vintage-inspired look that suits both formal and casual wear.',
   9995, 13995, 'Quartz', '44mm', '50m', 4.3, 274, 'Myntra',
   'https://www.myntra.com/search?q=fossil%20grant', 'images/watch-mens.jpg', 'Fossil Grant men''s leather watch',
   false, false, true),
  ('Michael Kors Women''s Watch', 'michael-kors-womens-watch', 'michael-kors', 'womens-watches',
   'Rose gold-tone elegance designed for everyday sophistication.',
   'A statement piece from Michael Kors featuring a rose gold-tone case and bracelet, crystal-accented dial, and reliable quartz movement — designed for everyday sophistication.',
   12995, 16995, 'Quartz', '36mm', '50m', 4.5, 402, 'Tata CLiQ',
   'https://www.tatacliq.com/search/?searchCategory=all&text=michael%20kors%20watch', 'images/watch-womens.jpg', 'Michael Kors women''s rose gold watch',
   true, true, false)
) as v(name, slug, brand_slug, category_slug, short_description, description,
       price, original_price, movement, case_size, water_resistance,
       rating, rating_count, retailer, affiliate_url, main_image, image_alt,
       is_featured, is_deal, is_editor_pick)
on conflict (slug) do nothing;

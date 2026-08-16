# Supabase Setup Guide

Follow these steps in order. Takes about 15–20 minutes the first time.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up / log in.
2. Click **New Project**.
3. Choose an organization, name it `newwatchguy`, set a strong database
   password (save it somewhere safe), pick the region closest to your
   customers, and click **Create new project**. Wait ~2 minutes.

## 2. Create the database tables

1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/schema.sql` from this project, copy all of it, paste it
   into the SQL Editor, and click **Run**.
3. You should see "Success. No rows returned."

## 3. Enable Row Level Security

1. New query again → open `supabase/rls.sql`, copy all of it, paste, **Run**.
2. This locks every table down so the public can only read *published*
   products, and only admins can write anything.

## 4. Create the image storage bucket

1. Left sidebar → **Storage** → **New bucket**.
2. Name it exactly: `product-images`
3. Toggle **Public bucket** = ON. Click **Create bucket**.
4. The storage policies in `rls.sql` (bottom section) already grant public
   read + admin-only write access to this bucket — no extra steps needed
   as long as the bucket name matches exactly.

## 5. (Optional) Load demo products

1. New query → open `supabase/seed.sql`, copy, paste, **Run**.
2. This recreates the original Seiko/Titan/Samsung/Fossil/Michael Kors demo
   products as real published rows, so your site isn't empty on day one.
   Edit or delete them anytime from the Admin Panel.

## 6. Enable email/password authentication

1. Left sidebar → **Authentication** → **Providers**.
2. Confirm **Email** is enabled (it is by default).
3. Authentication → **Settings**: for local testing you can turn OFF
   "Confirm email" so your first login works immediately. For a real
   production site, leave email confirmation ON and confirm the email
   when you receive it.

## 7. Create your admin account

1. Left sidebar → **Authentication** → **Users** → **Add user** →
   **Create new user**.
2. Enter your email and a strong password. Click **Create user**.
3. This automatically creates a matching row in the `profiles` table with
   `role = 'admin'` (via the trigger set up in `schema.sql`) — you don't
   need to do anything else. If you ever need to check it manually: SQL
   Editor → `select * from profiles;`

## 8. Get your API keys

1. Left sidebar → **Project Settings** → **API**.
2. Copy the **Project URL**.
3. Copy the **anon / public** key (NOT the `service_role` key).
4. Open `js/config.js` in this project and paste both values in:

   ```js
   window.NWG_CONFIG = {
     SUPABASE_URL: 'https://xxxxxxxx.supabase.co',
     SUPABASE_ANON_KEY: 'eyJhbGciOi...'
   };
   ```

## 9. Test everything locally

Open `index.html` directly in your browser (or use a simple local server
like the VS Code "Live Server" extension) and check:

- [ ] Homepage loads without a red error banner in the browser console
      (press F12 → Console tab)
- [ ] Go to `admin/login.html`, log in with the account from step 7
- [ ] Admin → **Add Product** → fill the form → upload an image → **Save**
- [ ] Set status to **Published** → check the product now appears on the
      homepage / products page
- [ ] Click **Check Price** on the product — it should open your affiliate
      URL in a new tab

Once all of these pass, move on to [`GITHUB_DEPLOYMENT.md`](GITHUB_DEPLOYMENT.md).

## Reference: what each SQL file does

| File | Purpose | Run when |
|---|---|---|
| `schema.sql` | Creates all tables, relationships, triggers | Once, first |
| `rls.sql` | Row Level Security policies + storage policies | Once, right after schema.sql |
| `seed.sql` | Demo categories, brands and 5 sample products | Optional, once |

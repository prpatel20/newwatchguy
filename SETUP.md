# Setup Guide (Beginner-Friendly)

This walks through everything from zero to a live, working site.

## Step-by-step

1. **Extract this ZIP** somewhere on your computer.
2. **Set up your database** — follow [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)
   completely (creates your database, security rules, image storage, and
   your admin login).
3. **Connect the site to your database** — open `js/config.js` in any text
   editor and paste in your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from
   step 2.
4. **Put the site online** — follow [`GITHUB_DEPLOYMENT.md`](GITHUB_DEPLOYMENT.md).
5. **Log in and add your first product** — go to
   `https://your-site-url/admin/`, sign in, click **Add Product**.

## How to log in

Go to `yoursite.com/admin/` (or `admin/login.html` if testing locally).
Sign in with the email and password you created in
`SUPABASE_SETUP.md` → step 7 ("Create your admin account").

## How to add a product

1. Admin Panel → **Add Product** (left sidebar, or the **+ Add Product**
   button top-right).
2. Fill in at minimum: **Product name**, **Brand**, **Category**,
   **Current price**.
3. Under **Media**, click **Choose File** next to "Main product image" and
   pick a photo from your computer — it uploads automatically and shows a
   preview.
4. Under **Affiliate**, paste the **Affiliate URL** (the link to buy the
   watch on Amazon/Flipkart/etc.) and enter the **Retailer** name.
5. Choose **Status**: pick **Published** to make it go live immediately,
   or **Draft** to save it privately and publish later.
6. Click **Save Product**.

That's it — no HTML editing, ever.

## How to upload additional images

Same Add/Edit Product form → **Additional images** → choose one or more
files. Each one uploads and appears as a thumbnail; click the small **×**
on a thumbnail to remove it.

## How to add a category or brand

Admin Panel → **Categories** (or **Brands**) → type a name in the box at
the top → **Add Category** / **Add Brand**. It's immediately available in
the Add Product form's dropdown.

## How to publish / unpublish / delete a product

Admin Panel → **Products** → find the product in the table → use the
**Edit**, **Publish/Unpublish**, or **Delete** buttons in the Actions
column. Deleting asks for confirmation first and cannot be undone.

## How to change site settings

Admin Panel → **Settings** → update your site name, contact email, social
links, or default affiliate disclosure text → **Save Settings**.

## How to update the live website later

- **Product changes** (add/edit/delete/publish): just use the Admin
  Panel — changes appear on the live site immediately, no redeploy needed.
- **Design/code changes**: edit the files, then push to GitHub as
  described in `GITHUB_DEPLOYMENT.md` — the live site updates automatically.

# NewWatchGuy

A premium watch discovery & affiliate website. Browse, compare and discover
watches across brands, categories and price points — manage the entire
product catalog from a secure Admin Panel, no HTML editing required.

**Stack:** HTML / CSS / Vanilla JavaScript (frontend, hosted on GitHub Pages)
+ [Supabase](https://supabase.com) (database, auth, storage).

---

## ✨ What's included

- Public website: home, product listing with filters, product detail pages,
  brands, deals, search, wishlist, and legal pages.
- Admin Panel: secure login, dashboard, full product CRUD, image upload,
  category/brand management, settings, and profile — all backed by a real
  Supabase database with Row Level Security.
- Ready-to-run SQL for the database schema, security policies and seed data.

## 🚀 Quick Start

1. **Create your Supabase project** and run the SQL files — see
   [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) (do this first).
2. **Configure the site** — open `js/config.js` and paste in your Supabase
   Project URL and anon key.
3. **Deploy to GitHub Pages** — see [`GITHUB_DEPLOYMENT.md`](GITHUB_DEPLOYMENT.md).
4. **Log in to `/admin/`** with the admin account you created in step 1 and
   add your first product.

Full beginner walkthrough: [`SETUP.md`](SETUP.md).
Something not working? [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md).

## 📁 Project Structure

```
newwatchguy/
├── index.html, products.html, product.html, brands.html, deals.html,
│   search.html, wishlist.html, about.html, contact.html, privacy.html,
│   terms.html, affiliate-disclosure.html
├── admin/
│   ├── login.html          — Admin sign-in (Supabase Auth)
│   ├── dashboard.html       — Admin dashboard (single page app)
│   ├── admin.js / admin.css — Dashboard logic & styling
│   └── admin-auth.js / admin-login.js
├── css/
│   ├── index.css            — Original site theme (preserved)
│   └── site-extra.css       — Styles for listing/detail/legal pages
├── js/
│   ├── config.js             — ⚠️ EDIT THIS: your Supabase URL + anon key
│   ├── supabase-client.js    — Initializes the Supabase client
│   ├── products.js           — Shared data-fetching + card rendering
│   ├── app.js                — Header, menu, search, newsletter, wishlist
│   └── *-page.js              — Page-specific logic
├── images/                   — Original sample images (kept)
├── supabase/
│   ├── schema.sql             — Run 1st: tables
│   ├── rls.sql                 — Run 2nd: security policies
│   └── seed.sql                 — Run 3rd (optional): demo products
├── sitemap.xml, robots.txt
└── SETUP.md, SUPABASE_SETUP.md, GITHUB_DEPLOYMENT.md, TROUBLESHOOTING.md
```

## 🔐 Security model (short version)

- The frontend only ever uses the public **anon key** — safe to publish.
- Every table has **Row Level Security** turned on: the public can only
  ever read *published* products; only signed-in admin accounts (rows in
  the `profiles` table) can create, edit, delete or unpublish anything.
- Passwords are never stored or checked in JavaScript — all authentication
  goes through Supabase Auth.

## 📝 Day-to-day: adding a product

Admin Panel → **Add Product** → fill in the details → upload an image →
paste your affiliate link → choose **Draft** or **Published** → **Save**.
Published products appear on the live site immediately — no code changes,
no redeploys.

## ⚠️ Known limitations

- The "Blog" / "Guides" sections on the homepage are static editorial
  content (no CMS) — there's no blog database table in this version.
- Affiliate click tracking is basic (product, retailer, page, timestamp)
  with no dashboard charts — a simple count is shown on the Overview page.
- Product pages are dynamic (`product.html?slug=...`); the sitemap lists
  only static pages. See `TROUBLESHOOTING.md` for how to extend this later.
- There is no server-side rendering, so search engines must execute
  JavaScript to see product content — this works fine with modern Google
  crawling, but very old bots may only see the empty shell.

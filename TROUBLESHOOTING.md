# Troubleshooting

### 404 on GitHub Pages
- Confirm **Settings → Pages → Source** is set to `main` branch, `/ (root)`
  folder — not a `/docs` folder.
- Confirm `index.html` is at the **top level** of the repo, not nested
  inside an extra folder (e.g. not `newwatchguy/newwatchguy/index.html`).
- Give it 1–2 minutes after pushing; GitHub Pages deploys asynchronously.

### Admin page not opening
- Go to `yoursite.com/admin/` (with the trailing slash) — this loads
  `admin/index.html`, which redirects to `admin/login.html`.
- Check the browser console (F12) for a red error — most often this means
  `js/config.js` still has the placeholder `YOUR-PROJECT-REF` value.

### CSS not loading
- Open DevTools → Network tab → reload → look for any `.css` request
  showing 404. Paths are relative (`css/index.css`), so this usually means
  a file got moved or renamed during upload — re-check the folder
  structure matches the README's Project Structure section exactly.

### Images not loading
- Same as CSS — check the Network tab for 404s.
- For uploaded product images: confirm the Storage bucket is named
  exactly `product-images` and its **Public bucket** toggle is ON
  (Supabase Dashboard → Storage).

### Supabase connection error / "Supabase is not configured yet" warning
- Open `js/config.js` and confirm both `SUPABASE_URL` and
  `SUPABASE_ANON_KEY` are filled in with your real values (Project
  Settings → API in your Supabase dashboard) — not the placeholder text.

### Authentication error when logging in
- "Incorrect email or password" — double check the credentials, or use
  **Forgot password** on the login screen.
- If you just created the user and haven't turned off "Confirm email"
  (Authentication → Settings), you'll need to click the confirmation link
  sent to that inbox before you can log in.

### RLS error ("new row violates row-level security policy")
- This means you're trying to write to a table while not recognized as an
  admin. Confirm a row exists for your user in `profiles` with
  `role = 'admin'` — SQL Editor → `select * from profiles;`. If missing,
  re-run the relevant part of `schema.sql` (the `handle_new_user` trigger)
  or insert the row manually:
  ```sql
  insert into profiles (id, role) values ('YOUR-AUTH-USER-UUID', 'admin');
  ```
  (Find the UUID under Authentication → Users.)

### Image upload error
- Confirm the `product-images` bucket exists, is public, and that you ran
  the storage policies section at the bottom of `rls.sql`.
- Large files can be slow — the browser needs a live connection during
  upload; the "Uploading…" status will update to "Uploaded." or an error.

### Products not appearing on the public site
- Check the product's **Status** is **Published**, not **Draft** — only
  published products are visible to non-admin visitors (this is enforced
  by `rls.sql`, not just the UI).

### Affiliate button not working
- Confirm the product's **Affiliate URL** field is filled in and starts
  with `https://`. An empty affiliate URL will link to `#`.

### Wrong GitHub Pages path / assets look broken only on the live site
- This project only ever uses relative paths (no leading `/`), so it works
  the same locally and on GitHub Pages project sites. If you renamed the
  repo or moved files into a subfolder after uploading, re-check paths
  match the structure in `README.md`.

### CORS / "Failed to fetch" errors
- Supabase's REST API allows requests from any origin by default for the
  anon key, so CORS issues are rare. If you see this, first check your
  internet connection and that the Supabase project isn't paused (free
  projects pause after a week of inactivity — just open the dashboard to
  wake it back up).

### I want a fully dynamic sitemap.xml with every product URL
- Not included out of the box (this build ships a static sitemap of the
  main pages). The cleanest way to add this later is a small Supabase Edge
  Function that queries published products and returns XML — search
  "Supabase Edge Function sitemap" for examples, or ask your developer to
  add one.

# Deploying to GitHub Pages

## First-time deployment

1. **Create a GitHub repository**
   - Go to [github.com](https://github.com) → **New repository**.
   - Name it `newwatchguy` (or anything you like). Keep it **Public**
     (GitHub Pages on the free plan requires a public repo, unless you
     have GitHub Pro/Team/Enterprise).
   - Don't initialize with a README (you already have one).

2. **Upload the project files**
   - Easiest way (no command line): open your new repo → **Add file** →
     **Upload files** → drag in every file/folder from this project
     (keep the folder structure exactly as-is: `admin/`, `css/`, `js/`,
     `images/`, `supabase/`, and all the root `.html` files).
   - Or with Git, from inside the extracted project folder:
     ```bash
     git init
     git add .
     git commit -m "Initial NewWatchGuy site"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/newwatchguy.git
     git push -u origin main
     ```

3. **Turn on GitHub Pages**
   - In your repo → **Settings** → **Pages** (left sidebar).
   - Under **Build and deployment** → **Source**: choose
     **Deploy from a branch**.
   - **Branch**: `main`, folder: `/ (root)`. Click **Save**.
   - Wait 1–2 minutes. Refresh the page — you'll see a green box with your
     live URL, e.g. `https://YOUR-USERNAME.github.io/newwatchguy/`.

4. **Update `js/config.js`** with your live Supabase URL/key if you
   haven't already (see `SUPABASE_SETUP.md`), commit, and push — GitHub
   Pages redeploys automatically within a minute of every push.

## Updating the site later

- Any code/design change → edit the file → commit → push to `main` →
  GitHub Pages updates automatically in ~1 minute.
- **Adding/editing products does NOT need a redeploy at all** — that
  happens live through the Admin Panel because products live in Supabase,
  not in the HTML.

## Important: paths

This project uses **relative paths** everywhere (`css/index.css`,
`images/hero-watch.jpg`, `js/config.js`, `admin/login.html`, etc.) —
never a leading `/`. This makes it work correctly whether your repo is
served at the root of a custom domain or inside a `/newwatchguy/`
sub-path, which is how GitHub Pages project sites normally work. You do
not need to change anything for this to work.

## Custom domain (optional)

Settings → Pages → **Custom domain** → enter your domain → follow GitHub's
DNS instructions (usually a `CNAME` record pointing to
`YOUR-USERNAME.github.io`). GitHub Pages provisions free HTTPS
automatically after DNS propagates (can take up to 24 hours).

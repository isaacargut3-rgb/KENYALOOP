# Deploying to GitHub Pages

## 1. Create the repository
On GitHub: **New repository** → name e.g. `kenya-house-hunting` → Public (free Pages) → don't add README/licence (they already exist).

## 2. Push this project
```bash
cd kenya-house-hunting
git init -b main            # skip if already initialised
git add .
git commit -m "Initial commit: NyumbaLoop MVP prototype"
git remote add origin https://github.com/<your-username>/kenya-house-hunting.git
git push -u origin main
```
(If prompted for a password, use a Personal Access Token, or sign in with `gh auth login`.)

## 3. Enable Pages
**Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**. The included workflow
`.github/workflows/pages.yml` publishes on every push to `main`.
Alternative: Source = *Deploy from a branch* → `main` → `/ (root)` (works without the workflow).

## 4. Visit the site
`https://<your-username>.github.io/kenya-house-hunting/` (first deploy takes ~1 minute). Check **Actions** tab if it doesn't appear.

## Notes
- All links are relative and routing uses `#/…`, so the project sub-path works without configuration.
- Custom domain: Settings → Pages → Custom domain, then add a DNS CNAME.
- Before sharing publicly, replace the placeholder contact and legal pages (see ROADMAP "Before going live").

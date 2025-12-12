# Decap CMS Setup Guide

## Overview

The site uses Decap CMS for content management. Since the site is hosted on GitHub Pages (not Netlify), we need to set up an external OAuth provider for authentication.

## Quick Start for Local Testing

1. **Test the CMS locally** (no OAuth needed):
   ```bash
   npm run dev
   ```
   Visit `http://localhost:4321/admin`

   The CMS will use a test backend - changes won't be saved to Git, but you can test the interface.

## Production Setup (GitHub Pages + OAuth)

### Step 1: Deploy OAuth Provider to Vercel

**Option A: One-Click Deploy (Easiest)**

1. Click: https://vercel.com/new/clone?repository-url=https://github.com/vencax/netlify-cms-github-oauth-provider
2. Login to Vercel (free account)
3. Click "Create"
4. After deployment, note your URL (e.g., `https://your-app.vercel.app`)

**Option B: Manual Deploy**

1. Fork: https://github.com/vencax/netlify-cms-github-oauth-provider
2. Connect to Vercel
3. Deploy

### Step 2: Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: `Dvořákovo gymnázium CMS`
   - **Homepage URL**: `https://rjicha.github.io/dgkralupy`
   - **Authorization callback URL**: `https://YOUR-VERCEL-URL.vercel.app/callback`
     - Replace `YOUR-VERCEL-URL` with your URL from Step 1
4. Click **Register application**
5. **Copy** the Client ID and Client Secret

### Step 3: Configure OAuth Provider

1. Go to your Vercel project → Settings → Environment Variables
2. Add:
   - **Name**: `OAUTH_CLIENT_ID`, **Value**: (your Client ID from Step 2)
   - **Name**: `OAUTH_CLIENT_SECRET`, **Value**: (your Client Secret from Step 2)
3. Redeploy the app (Vercel → Deployments → Redeploy)

### Step 4: Update CMS Config

Edit `scripts/generate-cms-config.js` and replace this line:

```javascript
base_url: https://your-oauth-provider.vercel.app
```

With your actual Vercel URL:

```javascript
base_url: https://YOUR-ACTUAL-URL.vercel.app
```

### Step 5: Deploy Your Site

```bash
git add .
git commit -m "Configure Decap CMS with OAuth"
git push origin main
```

GitHub Actions will automatically build and deploy to GitHub Pages.

### Step 6: Access the CMS

1. Visit: `https://rjicha.github.io/dgkralupy/admin`
2. Click "Login with GitHub"
3. Authorize the app
4. Start editing content!

## How It Works

```
┌─────────────────┐
│  Your Browser   │
└────────┬────────┘
         │
         │ 1. Visit /admin
         ▼
┌─────────────────┐
│   Decap CMS     │
└────────┬────────┘
         │
         │ 2. Click "Login with GitHub"
         ▼
┌─────────────────┐
│ OAuth Provider  │  ← Your Vercel deployment
│  (Vercel/free)  │
└────────┬────────┘
         │
         │ 3. Authenticate
         ▼
┌─────────────────┐
│     GitHub      │
└────────┬────────┘
         │
         │ 4. Grant access
         ▼
┌─────────────────┐
│   Decap CMS     │  ← You can now edit content
└─────────────────┘
```

## Content Management Workflow

1. **Create/Edit Content**:
   - Login to `/admin`
   - Create new article or edit existing
   - Add images, tags, metadata
   - Preview your changes

2. **Publish**:
   - Click "Publish"
   - CMS commits changes to GitHub
   - GitHub Actions builds site
   - Changes go live in ~2-3 minutes

3. **Manage Settings**:
   - Navigation structure
   - Contact information
   - Quick links

## File Structure

```
src/content/
├── articles/              # Blog posts/news
│   └── *.md              # Markdown files
├── pages/                # Static pages
│   └── *.md
├── contacts/             # Contact info
│   └── contacts.json
├── navigation/           # Site navigation
│   └── navigation.json
└── quick-links/          # Quick access links
    └── quick-links.json
```

## Troubleshooting

### "Error: Failed to load config.yml"
- Check that the config file exists at `public/admin/config.yml`
- Run `npm run build` to regenerate it

### "OAuth authentication failed"
- Verify your OAuth provider is running
- Check environment variables are set in Vercel
- Ensure callback URL matches in GitHub OAuth App

### "Cannot save changes"
- Make sure you have write access to the GitHub repository
- Check that you're logged in with the correct GitHub account

### Local testing shows errors
- Use `config-local.yml` renamed to `config.yml` for local development
- Or set up the OAuth provider as described above

## Alternative: Test Backend (Development Only)

For quick local testing without OAuth:

1. Edit `public/admin/config.yml`
2. Change:
   ```yaml
   backend:
     name: test-repo
   ```
3. Visit `http://localhost:4321/admin`
4. **Note**: Changes won't be saved - this is for UI testing only

## Need Help?

- Decap CMS Docs: https://decapcms.org/docs/intro/
- OAuth Provider: https://github.com/vencax/netlify-cms-github-oauth-provider
- GitHub OAuth Apps: https://docs.github.com/en/developers/apps/building-oauth-apps

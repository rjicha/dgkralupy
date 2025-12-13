# Cloudflare Worker OAuth Setup Checklist

Follow this checklist to complete the OAuth setup for your CMS.

## Prerequisites
- [ ] Cloudflare account created (free tier is fine)
- [ ] Access to this GitHub repository (`rjicha/dgkralupy`)

## Step 1: Deploy Cloudflare Worker
Choose ONE option:

### Option A: One-Click Deploy (Easiest)
- [ ] Visit https://github.com/sveltia/sveltia-cms-auth
- [ ] Click the "Deploy to Cloudflare Workers" button
- [ ] Sign in to Cloudflare
- [ ] Complete the deployment wizard
- [ ] Copy your Worker URL (e.g., `https://sveltia-cms-auth.YOUR-SUBDOMAIN.workers.dev`)

### Option B: CLI Deploy
```bash
# Clone the repository
git clone https://github.com/sveltia/sveltia-cms-auth.git
cd sveltia-cms-auth

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler deploy
```

**Worker URL:** ____________________________________________
(Save this! You'll need it in the next steps)

## Step 2: Create GitHub OAuth Application
- [ ] Go to https://github.com/settings/applications/new
- [ ] Fill in the form:
  - **Application name:** `DG Kralupy CMS` (or any name you prefer)
  - **Homepage URL:** `https://rjicha.github.io/dgkralupy`
  - **Authorization callback URL:** `<YOUR_WORKER_URL>/callback`
    - Example: `https://sveltia-cms-auth.YOUR-SUBDOMAIN.workers.dev/callback`
- [ ] Click "Register application"
- [ ] **Copy Client ID:** ____________________________________________
- [ ] Click "Generate a new client secret"
- [ ] **Copy Client Secret:** ____________________________________________
  - ⚠️ You'll only see this once! Save it securely.

## Step 3: Configure Cloudflare Worker Environment Variables
- [ ] Go to Cloudflare Dashboard → Workers & Pages
- [ ] Click on your `sveltia-cms-auth` worker
- [ ] Navigate to Settings → Variables
- [ ] Add environment variables (click "Add variable"):
  - [ ] `GITHUB_CLIENT_ID`: Paste your Client ID
  - [ ] `GITHUB_CLIENT_SECRET`: Paste your Client Secret
    - ⚠️ Click "Encrypt" for the client secret!
  - [ ] (Optional) `ALLOWED_DOMAINS`: `rjicha.github.io` for extra security
- [ ] Click "Save and Deploy"

## Step 4: Update CMS Configuration
Run the configuration script:

```bash
./scripts/configure-oauth-worker.sh <YOUR_WORKER_URL>
```

Example:
```bash
./scripts/configure-oauth-worker.sh https://sveltia-cms-auth.YOUR-SUBDOMAIN.workers.dev
```

Or manually update `public/admin/config.yml`:
- [ ] Replace `YOUR_WORKER_URL` with your actual Worker URL

## Step 5: Build and Deploy
- [ ] Build the site: `npm run build`
- [ ] Commit changes:
  ```bash
  git add public/admin/config.yml public/admin/index.html
  git commit -m "Configure Cloudflare Worker OAuth for CMS authentication"
  git push
  ```
- [ ] Wait for GitHub Actions to deploy (~2-3 minutes)

## Step 6: Test Authentication
- [ ] Visit https://rjicha.github.io/dgkralupy/admin/
- [ ] Click "Login with GitHub"
- [ ] Verify you're redirected to GitHub
- [ ] Authorize the application
- [ ] Verify you're redirected back to the CMS
- [ ] Verify you can see the CMS interface

## Troubleshooting

### "Unable to authenticate" error
- [ ] Check environment variables in Cloudflare Worker settings
- [ ] Verify Client ID and Client Secret are correct
- [ ] Ensure Client Secret is encrypted in Cloudflare

### Callback URL mismatch error
- [ ] Verify the callback URL in GitHub OAuth app matches: `<WORKER_URL>/callback`
- [ ] Ensure there's no trailing slash in the callback URL

### CORS errors
- [ ] Add `ALLOWED_DOMAINS` environment variable in Cloudflare Worker
- [ ] Set it to `rjicha.github.io` (without https://)

### Redirect loops
- [ ] Clear browser cache and cookies
- [ ] Try in an incognito/private window
- [ ] Verify you're accessing via https://rjicha.github.io (not the Netlify URL)

## Cleanup (Optional)
Once everything works, you can optionally:
- [ ] Delete the Netlify site (if you're no longer using it)
- [ ] Remove any Netlify-related environment variables
- [ ] Update any documentation that references Netlify

## Cost Summary
- Cloudflare Workers (Free Tier): Up to 100,000 requests/day ✓
- GitHub OAuth: Free ✓
- Total monthly cost: **$0** ✓

## Support Resources
- Sveltia CMS Auth: https://github.com/sveltia/sveltia-cms-auth
- Decap CMS Docs: https://decapcms.org/docs/
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

Mark your progress: ___________

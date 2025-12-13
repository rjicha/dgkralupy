# Cloudflare Worker OAuth Setup for Decap CMS

This guide will help you set up OAuth authentication for Decap CMS using Cloudflare Workers, completely replacing the Netlify Identity dependency.

## Prerequisites

- A Cloudflare account (free tier is sufficient)
- GitHub repository access
- Command line access

## Step 1: Deploy Cloudflare Worker

### Option A: One-Click Deploy (Recommended)

1. Go to: https://github.com/sveltia/sveltia-cms-auth
2. Click the "Deploy to Cloudflare Workers" button
3. Sign in to your Cloudflare account
4. Follow the deployment wizard
5. Note your Worker URL (format: `https://sveltia-cms-auth.<SUBDOMAIN>.workers.dev`)

### Option B: Manual Deploy via CLI

```bash
# Clone the auth worker repository
git clone https://github.com/sveltia/sveltia-cms-auth.git
cd sveltia-cms-auth

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler deploy

# Note the Worker URL from the output
```

## Step 2: Create GitHub OAuth Application

1. Go to: https://github.com/settings/applications/new
2. Fill in the form:
   - **Application name**: `DG Kralupy CMS`
   - **Homepage URL**: `https://rjicha.github.io/dgkralupy`
   - **Authorization callback URL**: `<YOUR_WORKER_URL>/callback`
     - Example: `https://sveltia-cms-auth.your-subdomain.workers.dev/callback`
3. Click "Register application"
4. **Save your Client ID** (you'll see it immediately)
5. Click "Generate a new client secret"
6. **Save your Client Secret** (you'll only see it once!)

## Step 3: Configure Cloudflare Worker Environment Variables

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your `sveltia-cms-auth` worker
3. Go to Settings → Variables
4. Add the following **encrypted** environment variables:
   - `GITHUB_CLIENT_ID`: Your GitHub OAuth Client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth Client Secret (mark as "Encrypt")
5. Optional: Add `ALLOWED_DOMAINS` set to `rjicha.github.io` for extra security
6. Click "Save and Deploy"

## Step 4: Update CMS Configuration

The CMS configuration (`public/admin/config.yml`) needs to be updated to use the Cloudflare Worker instead of Git Gateway.

This will be done automatically by the setup script.

## Step 5: Update Admin Index (Remove Netlify Identity)

The admin/index.html needs to have Netlify Identity widget removed since we're no longer using it.

This will be done automatically by the setup script.

## Step 6: Test

1. Visit: `https://rjicha.github.io/dgkralupy/admin/`
2. Click "Login with GitHub"
3. You'll be redirected to GitHub for authorization
4. After approving, you'll be redirected back to the CMS

## Troubleshooting

**"Unable to authenticate"**
- Verify environment variables in Cloudflare Worker
- Check that callback URL in GitHub OAuth app matches your Worker URL exactly

**CORS errors**
- Add your domain to `ALLOWED_DOMAINS` in Worker environment variables

**Redirect loops**
- Clear browser cache and cookies
- Ensure you're accessing via the correct domain (GitHub Pages URL)

## Cost

- Cloudflare Workers Free Tier: 100,000 requests/day (plenty for a CMS)
- GitHub OAuth: Free
- Total: $0/month

## Sources

- [Sveltia CMS Auth](https://github.com/sveltia/sveltia-cms-auth)
- [Decap CMS GitHub Backend](https://decapcms.org/docs/github-backend/)
- [External OAuth Clients](https://decapcms.org/docs/external-oauth-clients/)

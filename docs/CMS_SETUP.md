# Decap CMS Setup Guide

## Overview

The site uses Decap CMS for content management with **Git Gateway authentication via Netlify Identity**. This is the simplest setup - no external OAuth providers or GitHub apps needed!

## Quick Start for Local Testing

1. **Test the CMS locally** (no OAuth needed):
   ```bash
   npm run dev
   ```
   Visit `http://localhost:4321/admin`

   The CMS will use a test backend - changes won't be saved to Git, but you can test the interface.

## Production Setup (Netlify + Git Gateway)

### Step 1: Deploy to Netlify

**Option A: Connect via Netlify Dashboard (Recommended)**

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** and authorize Netlify
4. Select repository: `rjicha/dgkralupy`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **Deploy site**

**Option B: Deploy via Netlify CLI**

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
```

### Step 2: Enable Netlify Identity

1. In your Netlify site dashboard, go to **Site settings** → **Identity**
2. Click **Enable Identity**
3. Under **Registration preferences**, select:
   - **Invite only** (recommended for school site)
4. Under **External providers** (optional):
   - You can enable GitHub/Google login if desired

### Step 3: Enable Git Gateway

1. Still in **Identity** settings, scroll to **Services**
2. Click **Enable Git Gateway**
3. That's it! Git Gateway is now configured

### Step 4: Invite CMS Users

1. Go to **Identity** tab in your Netlify dashboard
2. Click **Invite users**
3. Enter email addresses of teachers/staff who need CMS access
4. They'll receive an invitation email to set up their account

### Step 5: Configure Custom Domain (Optional)

If deploying to `dgkralupy.cz`:

1. In Netlify dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Enter `dgkralupy.cz`
4. Follow DNS configuration instructions
5. Netlify will automatically provision SSL certificate

Set environment variable for production:
```bash
# In Netlify dashboard: Site settings → Environment variables
SITE_URL=https://dgkralupy.cz
```

### Step 6: Access the CMS

1. Visit your site's admin page:
   - Netlify URL: `https://your-site.netlify.app/admin`
   - Custom domain: `https://dgkralupy.cz/admin`
2. Click **Login with Netlify Identity**
3. Use your invited account credentials
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
         │ 2. Click "Login"
         ▼
┌─────────────────┐
│Netlify Identity │  ← Built-in to Netlify (free)
└────────┬────────┘
         │
         │ 3. Authenticate user
         ▼
┌─────────────────┐
│  Git Gateway    │  ← Proxies GitHub API
└────────┬────────┘
         │
         │ 4. Commit changes
         ▼
┌─────────────────┐
│ GitHub Repo     │  ← Your content updates
└────────┬────────┘
         │
         │ 5. Trigger build
         ▼
┌─────────────────┐
│ Netlify Deploy  │  ← Auto-rebuilds site
└─────────────────┘
```

### Benefits of This Setup

- **No external OAuth providers** - Everything runs on Netlify
- **Automatic deployments** - Changes trigger rebuilds instantly
- **User management** - Invite/revoke access from Netlify dashboard
- **Free tier friendly** - Up to 1,000 Identity users on free plan
- **Secure** - Git Gateway handles GitHub auth internally

## Content Management Workflow

1. **Create/Edit Content**:
   - Login to `/admin`
   - Create new article or edit existing
   - Add images, tags, metadata
   - Preview your changes

2. **Publish**:
   - Click "Publish"
   - CMS commits changes to GitHub via Git Gateway
   - Netlify detects the commit and rebuilds automatically
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

### "Cannot login to CMS"
- Verify Netlify Identity is enabled in site settings
- Check that Git Gateway is enabled
- Ensure you've been invited as a user (check email)

### "Cannot save changes"
- Verify Git Gateway is enabled in Netlify Identity settings
- Check that your GitHub repository is connected properly
- Ensure the repository isn't archived or has restricted access

### Local testing shows errors
- Local development doesn't require authentication
- The CMS will show a simplified interface for testing
- Changes made locally won't be saved to GitHub

## Alternative: Test Backend (Development Only)

For quick local testing without authentication:

1. Create `public/admin/config-local.yml`:
   ```yaml
   backend:
     name: test-repo
   local_backend: true
   ```
2. Visit `http://localhost:4321/admin`
3. **Note**: Changes won't be saved - this is for UI testing only

## Migration from GitHub Pages

If you're migrating from GitHub Pages with external OAuth:

1. Follow the steps above to deploy to Netlify
2. The `netlify.toml` file is already configured
3. No need to maintain Vercel OAuth provider anymore
4. Users will need new accounts via Netlify Identity

## Need Help?

- Decap CMS Docs: https://decapcms.org/docs/intro/
- Netlify Identity: https://docs.netlify.com/visitor-access/identity/
- Git Gateway: https://docs.netlify.com/visitor-access/git-gateway/

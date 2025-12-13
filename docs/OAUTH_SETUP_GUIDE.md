# Quick OAuth Setup Guide - Netlify for GitHub Pages

This guide shows you how to set up Netlify OAuth for your CMS while keeping your site hosted on GitHub Pages.

## What You're Setting Up

- **Website Hosting**: GitHub Pages (stays as is)
- **CMS Admin**: `/admin/` on GitHub Pages
- **OAuth Authentication**: Netlify (free service, no deployment needed)

## Prerequisites

- GitHub account with admin access to `rjicha/dgkralupy`
- Email account for Netlify signup

## Step-by-Step Setup (15 minutes)

### Step 1: Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"** (or "OAuth Apps" → "New OAuth App")
3. Fill in the form:
   ```
   Application name:          dgkralupy CMS
   Homepage URL:              https://rjicha.github.io/dgkralupy
   Application description:   CMS authentication for dgkralupy.cz
   Authorization callback URL: https://api.netlify.com/auth/done
   ```
4. Click **"Register application"**
5. You'll see your **Client ID** - copy it somewhere safe
6. Click **"Generate a new client secret"**
7. Copy the **Client Secret** immediately (you won't see it again!)

**Keep these safe - you'll need them in Step 3**

### Step 2: Sign Up for Netlify

1. Go to https://app.netlify.com/signup
2. Sign up with GitHub (easiest) or email
3. Verify your email if needed
4. You'll be taken to your Netlify dashboard

### Step 3: Import Your Repository to Netlify

1. Click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. Authorize Netlify to access your GitHub
4. Search for and select: **`rjicha/dgkralupy`**
5. On the deploy settings page, just click **"Deploy"**
   - Don't worry about build settings - we're not using Netlify for hosting
   - The build might fail - that's okay!

### Step 4: Configure OAuth in Netlify

1. Once the site is created, go to **Site configuration** (left sidebar)
2. Click **"Access control"** → **"OAuth"** (or search for "OAuth" in settings)
3. Scroll down to **"Authentication providers"**
4. Under **GitHub**, click **"Install provider"**
5. Enter your credentials from Step 1:
   ```
   Client ID:     [paste from Step 1]
   Client Secret: [paste from Step 1]
   ```
6. Click **"Install"**

### Step 5: Test the CMS

1. Go to your CMS admin: **https://rjicha.github.io/dgkralupy/admin/**
2. Click **"Login with GitHub"**
3. You should be redirected to GitHub to authorize
4. After authorization, you'll be back in the CMS admin interface
5. You should see your collections: Articles, Pages, Settings

**🎉 Success! Your CMS is now fully functional!**

## Adding Teachers/Editors

For other teachers to access the CMS:

1. They need a GitHub account
2. Add them as collaborators:
   - Go to https://github.com/rjicha/dgkralupy/settings/access
   - Click **"Add people"**
   - Enter their GitHub username or email
   - Set role to **"Write"** (they need to commit changes)
3. They accept the invitation
4. They can now access: https://rjicha.github.io/dgkralupy/admin/

## Troubleshooting

### "Unable to locate site configuration"
- Make sure you've installed the OAuth provider in Netlify
- Check that your callback URL is exactly: `https://api.netlify.com/auth/done`

### "Error: Not Found"
- Your GitHub OAuth app might have the wrong callback URL
- Edit it at: https://github.com/settings/developers

### "Error loading config.yml"
- The config file is fine - just refresh the page
- Clear browser cache if the issue persists

### Build failed on Netlify
- **This is normal and okay!**
- We're only using Netlify for OAuth, not hosting
- You can ignore the failed builds

### Changes not appearing on the live site
- Wait 2-5 minutes for GitHub Actions to build and deploy
- Check build status: https://github.com/rjicha/dgkralupy/actions
- Make sure you clicked "Publish" in the CMS, not just "Save"

## What Happens When You Publish Content

1. **Edit in CMS** → You make changes in the admin interface
2. **Save/Publish** → CMS commits the changes to GitHub
3. **GitHub Actions** → Automatically triggered by the commit
4. **Build** → Site is rebuilt with your changes
5. **Deploy** → Updated site published to GitHub Pages (2-5 minutes)
6. **Live** → Your changes appear at https://rjicha.github.io/dgkralupy/

## Security Notes

- ✅ Only users with GitHub repository access can edit
- ✅ All changes are tracked in Git (full history)
- ✅ You can revert any change through Git
- ✅ OAuth credentials are secure (never exposed to users)

## Optional: Rename Your Netlify Site

Your Netlify site URL isn't used for public access, but you can rename it for clarity:

1. Go to **Site configuration** → **Site details**
2. Click **"Change site name"**
3. Enter something like: `dgkralupy-cms-oauth`
4. This is just for your reference - users never see this URL

## Cost

- **GitHub Pages**: Free ✅
- **Netlify OAuth**: Free ✅
- **Total**: $0/month

You're using the free tier of both services!

## Need Help?

- **CMS User Guide (Czech)**: `docs/NAVOD_PRO_UCITELE.md`
- **Technical Guide**: `docs/CMS_SETUP.md`
- **Decap CMS Docs**: https://decapcms.org/docs/
- **GitHub Issues**: https://github.com/rjicha/dgkralupy/issues

---

**Last Updated**: December 2025

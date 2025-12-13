# Decap CMS Setup Guide

This guide explains how to set up and use the Decap CMS admin interface for managing content on the dgkralupy.cz website.

## Quick Start

**⚡ For the fastest setup, see the [OAuth Setup Guide](OAUTH_SETUP_GUIDE.md) - 15 minutes to get up and running!**

## What is Decap CMS?

Decap CMS (formerly Netlify CMS) is a Git-based content management system that provides a user-friendly interface for editing content. When you make changes through the CMS:

1. Changes are saved as commits to the GitHub repository
2. GitHub Actions automatically rebuilds and deploys the site
3. Your changes appear on the live website within a few minutes

## Admin Interface Access

Once configured, the CMS admin interface will be available at:

**https://rjicha.github.io/dgkralupy/admin/**

## Deployment Strategy

Your site uses:
- **Hosting**: GitHub Pages (free, already configured)
- **OAuth**: Netlify (free, for CMS authentication only)
- **No changes needed** to your current deployment!

## GitHub OAuth App Setup (Required for Production)

To allow teachers to log in and edit content, you need to set up a GitHub OAuth App. This is a one-time setup:

### Step 1: Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
   - Direct link: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `dgkralupy CMS`
   - **Homepage URL**: `https://rjicha.github.io/dgkralupy`
   - **Authorization callback URL**: `https://api.netlify.com/auth/done`
4. Click **"Register application"**
5. You'll see your **Client ID** - copy this
6. Click **"Generate a new client secret"** and copy the secret (you won't see it again!)

### Step 2: Configure OAuth Backend

You have two options for handling OAuth:

#### Option A: Netlify (Recommended - Easiest)

1. Sign up for a free Netlify account at https://netlify.com
2. In Netlify dashboard, go to **Site configuration → Access control → OAuth**
3. Click **"Install provider"** under GitHub
4. Enter your GitHub OAuth App credentials:
   - Client ID
   - Client Secret
5. Update the backend config in `public/admin/config.yml`:

```yaml
backend:
  name: github
  repo: rjicha/dgkralupy
  branch: main
  base_url: https://api.netlify.com
  auth_endpoint: auth
```

#### Option B: Self-Hosted OAuth Server

If you prefer not to use Netlify, you can run your own OAuth server:

1. Use a service like [decap-server](https://github.com/decaporg/decap-server)
2. Deploy it to a platform like Heroku, Vercel, or Railway
3. Update the backend config with your OAuth server URL

### Step 3: Add Collaborators

For teachers to access the CMS, they need:

1. A GitHub account
2. Collaborator access to the repository

To add collaborators:
1. Go to your repository → Settings → Collaborators
2. Click **"Add people"**
3. Enter their GitHub username or email
4. They'll receive an invitation to accept

## Local Development

For testing the CMS locally during development:

1. Install the Decap server proxy:
   ```bash
   npm install -g decap-server
   ```

2. In one terminal, run the dev server:
   ```bash
   npm run dev
   ```

3. In another terminal, run the CMS proxy:
   ```bash
   npx decap-server
   ```

4. Access the local admin interface at:
   **http://localhost:4321/admin/**

5. You can now test the CMS without OAuth authentication

## Content Types

The CMS is configured to manage:

### 1. Articles (Články a aktuality)
- Located in: `src/content/articles/`
- Used for: News, announcements, events
- Fields: Title, excerpt, content, date, author, tags, image, etc.

### 2. Pages (Stránky)
- Located in: `src/content/pages/`
- Used for: Static pages (About, Studies, Activities, etc.)
- Fields: Title, description, content, section, order

### 3. Settings (Nastavení webu)
- **Contacts**: School contact information
- **Navigation**: Main menu structure
- **Quick Links**: Homepage quick links widget

## Editorial Workflow

The CMS is configured with an editorial workflow:

1. **Draft**: Create new content or edit existing
2. **In Review**: Submit for review
3. **Ready**: Approve and merge to main branch

This prevents accidental publication of incomplete content.

## Features

### Rich Text Editor
- Markdown support with visual editor
- Insert images, links, headings, lists
- Code blocks and tables

### Media Management
- Upload images directly through the CMS
- Images are stored in `public/images/`
- Automatic path handling for GitHub Pages

### Preview
- See how your content will look before publishing
- Live preview while editing

## Troubleshooting

### "Unable to access repository"
- Check that the user has collaborator access
- Verify OAuth App credentials are correct

### "Config file error"
- Check `public/admin/config.yml` syntax
- Ensure all required fields are present

### Changes not appearing on site
- Check GitHub Actions for build errors
- Typically takes 2-5 minutes for changes to deploy
- View deployment status at: https://github.com/rjicha/dgkralupy/actions

## Security Notes

1. **Never commit OAuth secrets** to the repository
2. Only give repository access to trusted users
3. Review changes before merging to production
4. Use the editorial workflow for quality control

## Support

For issues or questions:
- Decap CMS documentation: https://decapcms.org/docs/
- GitHub repository issues: https://github.com/rjicha/dgkralupy/issues

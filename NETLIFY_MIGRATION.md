# Netlify Migration Guide

This guide will help you migrate from GitHub Pages with Vercel OAuth to Netlify with Git Gateway - a much simpler setup!

## What's Changing

### Before (GitHub Pages + Vercel)
- Hosted on GitHub Pages
- Required external Vercel deployment for OAuth
- GitHub OAuth app configuration needed
- Complex multi-service setup

### After (Netlify + Git Gateway)
- Hosted on Netlify
- Built-in authentication via Netlify Identity
- No external services required
- Simple one-platform setup

## Prerequisites

- GitHub account (you already have this)
- Netlify account (free - sign up at netlify.com)
- Repository access to `rjicha/dgkralupy`

## Migration Steps

### 1. Prepare Your Repository

The repository is already configured for Netlify! Check these files:

- `netlify.toml` - Netlify configuration (build settings, redirects)
- `scripts/generate-cms-config.js` - Updated to use git-gateway
- `astro.config.mjs` - Updated to work without base path

### 2. Deploy to Netlify

**Via Dashboard (Recommended):**

1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign up or log in (you can use your GitHub account)
3. Click **Add new site** → **Import an existing project**
4. Choose **GitHub** and authorize Netlify to access your repositories
5. Select the `rjicha/dgkralupy` repository
6. Netlify will auto-detect the settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18
7. Click **Deploy site**

Netlify will:
- Install dependencies
- Run the build
- Deploy your site
- Give you a URL like `https://dgkralupy-abc123.netlify.app`

### 3. Enable Netlify Identity

Once your site is deployed:

1. In your Netlify dashboard, go to **Site settings**
2. Click **Identity** in the left sidebar
3. Click **Enable Identity**
4. Configure settings:
   - **Registration**: Select "Invite only"
   - **External providers**: (Optional) Enable GitHub or Google if you want social login
   - **Email templates**: Customize invitation emails if desired

### 4. Enable Git Gateway

1. Still in **Identity** settings, scroll to **Services**
2. Find **Git Gateway** section
3. Click **Enable Git Gateway**

That's it! Authentication is now configured.

### 5. Invite Users

1. Go to the **Identity** tab (top navigation)
2. Click **Invite users**
3. Enter email addresses for each person who needs CMS access:
   - Teachers
   - Administrators
   - Content editors
4. Click **Send**

Each person will receive an email with:
- A secure invitation link
- Instructions to set their password
- Access to the CMS

### 6. Test the CMS

1. Visit your site's admin page: `https://your-site.netlify.app/admin`
2. Click **Login with Netlify Identity**
3. If you invited yourself, use your email and password
4. Try creating a test article
5. Publish it
6. Watch Netlify automatically rebuild your site

### 7. Configure Custom Domain (Optional)

To use `dgkralupy.cz`:

1. In Netlify dashboard, go to **Domain settings**
2. Click **Add custom domain**
3. Enter `dgkralupy.cz`
4. Netlify will provide DNS records to configure:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```
5. Add these records to your domain registrar
6. Wait for DNS propagation (up to 48 hours, usually faster)
7. Netlify will automatically provision SSL certificate

Set production environment variable:
1. Go to **Site settings** → **Environment variables**
2. Add:
   - Key: `SITE_URL`
   - Value: `https://dgkralupy.cz`
3. Trigger a redeploy

### 8. Clean Up Old Setup

Once everything works on Netlify:

1. **Vercel OAuth provider** - You can delete this deployment
2. **GitHub OAuth App** - You can delete this from GitHub settings
3. **GitHub Pages** - Optional: disable in repository settings

## What's Different for Users

### For Content Editors:

**Old flow:**
1. Go to `/admin`
2. Click "Login with GitHub"
3. Authorize OAuth app
4. Edit content

**New flow:**
1. Go to `/admin`
2. Click "Login with Netlify Identity"
3. Enter email and password (from invitation)
4. Edit content

### For Administrators:

**Old method** - Managing access:
- Add users as GitHub collaborators
- Configure OAuth permissions

**New method** - Managing access:
- Invite users via Netlify Identity dashboard
- Revoke access instantly from same dashboard
- No GitHub permissions needed

## Deployment Workflow

### Automatic Deployments

Netlify automatically deploys when:
- You push to `main` branch
- Someone publishes content via CMS
- You manually trigger a deploy

### Deploy Previews

Netlify can create preview deployments for:
- Pull requests (automatic)
- Branch deploys
- Manual deploys

Configure in **Site settings** → **Build & deploy** → **Deploy contexts**

### Rollbacks

If something breaks:
1. Go to **Deploys**
2. Find a working deployment
3. Click **Publish deploy**
4. Instant rollback!

## Troubleshooting

### Build fails on Netlify

Check the deploy log:
1. Go to **Deploys**
2. Click on the failed deployment
3. Review the build log
4. Common issues:
   - Missing environment variables
   - Node version mismatch (set in `netlify.toml`)
   - npm install failures

### Cannot login to CMS

1. Verify Identity is enabled: **Site settings** → **Identity**
2. Check Git Gateway is enabled
3. Ensure you received and clicked the invitation email
4. Try resetting password from login page

### Changes not appearing

1. Check deployment triggered: **Deploys** tab
2. Wait 2-3 minutes for build to complete
3. Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
4. Check if file was actually committed to GitHub

### Images not loading

1. Verify images are in `public/images/`
2. Check `media_folder` in generated `config.yml`
3. Rebuild site to regenerate config

## Comparison: Before vs After

| Feature | GitHub Pages + Vercel | Netlify + Git Gateway |
|---------|----------------------|----------------------|
| Hosting | GitHub Pages | Netlify |
| Auth Provider | Vercel (external) | Netlify Identity (built-in) |
| Setup Steps | 6 complex steps | 3 simple steps |
| Services Required | 3 (GitHub, Vercel, Pages) | 1 (Netlify) |
| OAuth Configuration | Manual GitHub app | Automatic |
| User Management | GitHub collaborators | Netlify dashboard |
| Deploy Triggers | GitHub Actions | Automatic (built-in) |
| Deploy Previews | Manual setup | Automatic |
| SSL Certificates | GitHub provides | Netlify provides |
| Custom Domain | Supported | Supported + automatic SSL |
| Rollbacks | Manual | One-click |
| Build Logs | GitHub Actions | Netlify dashboard |
| Cost | Free | Free (generous limits) |

## Benefits of Migration

1. **Simpler Setup** - No external OAuth provider needed
2. **Better User Management** - Invite/revoke from one dashboard
3. **Automatic Deployments** - Built into Netlify
4. **Deploy Previews** - See changes before going live
5. **Instant Rollbacks** - Fix issues immediately
6. **Better Performance** - Netlify's global CDN
7. **Environment Variables** - Easy management
8. **Build Plugins** - Extend functionality
9. **Analytics** - Built-in (on paid plans)
10. **Forms** - Built-in form handling (if needed later)

## Next Steps

After migration:

1. **Test thoroughly** - Check all CMS features
2. **Invite users** - Get your team set up
3. **Monitor deployments** - Watch first few deploys
4. **Set up notifications** - Get deploy alerts (Slack, email)
5. **Configure domain** - Point `dgkralupy.cz` to Netlify
6. **Delete old services** - Clean up Vercel and GitHub OAuth

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Support**: https://answers.netlify.com
- **Decap CMS Docs**: https://decapcms.org/docs
- **This Project**: See `docs/CMS_SETUP.md`

## Questions?

Common questions:

**Q: Will I lose my content?**
A: No! Your content is in GitHub. Netlify just hosts the built site.

**Q: What happens to my GitHub repository?**
A: Nothing changes. Netlify reads from it, just like GitHub Pages did.

**Q: Can I go back to GitHub Pages?**
A: Yes! Your repository still works with GitHub Pages. Just keep both or switch back.

**Q: Do users need GitHub accounts?**
A: No! They just need email addresses for Netlify Identity invitations.

**Q: Is Netlify free?**
A: Yes! Free tier includes:
- 100 GB bandwidth/month
- 300 build minutes/month
- 1,000 Netlify Identity users
- Unlimited sites

**Q: What if I exceed free limits?**
A: Very unlikely for a school site. If you do, Netlify has affordable paid plans.

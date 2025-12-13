# CMS Setup Checklist

Follow these steps to activate the CMS admin interface for teachers.

## ✅ Already Done

- [x] Decap CMS installed and configured
- [x] Admin interface created at `/admin/`
- [x] All content collections configured
- [x] Documentation written (English + Czech)
- [x] Build process tested and working

## 📋 What You Need to Do (15 minutes)

### Step 1: Create GitHub OAuth App (5 min)
- [ ] Go to https://github.com/settings/developers
- [ ] Click "New OAuth App"
- [ ] Fill in:
  - **Name**: `dgkralupy CMS`
  - **Homepage**: `https://rjicha.github.io/dgkralupy`
  - **Callback**: `https://api.netlify.com/auth/done`
- [ ] Save the Client ID and Client Secret

### Step 2: Set Up Netlify (5 min)
- [ ] Sign up at https://netlify.com
- [ ] Import your GitHub repository: `rjicha/dgkralupy`
- [ ] Let it deploy (build may fail - that's okay!)

### Step 3: Configure OAuth (3 min)
- [ ] In Netlify: Site configuration → Access control → OAuth
- [ ] Install GitHub provider
- [ ] Enter your Client ID and Client Secret from Step 1

### Step 4: Test It (2 min)
- [ ] Go to https://rjicha.github.io/dgkralupy/admin/
- [ ] Click "Login with GitHub"
- [ ] Verify you can see the CMS dashboard

## 📚 Detailed Instructions

See [docs/OAUTH_SETUP_GUIDE.md](docs/OAUTH_SETUP_GUIDE.md) for step-by-step instructions with screenshots.

## 👥 Adding Teachers

After setup is complete:

- [ ] Go to https://github.com/rjicha/dgkralupy/settings/access
- [ ] Click "Add people"
- [ ] Add teacher GitHub usernames
- [ ] Set role to "Write"

Teachers can then:
- Access: https://rjicha.github.io/dgkralupy/admin/
- Follow: [docs/NAVOD_PRO_UCITELE.md](docs/NAVOD_PRO_UCITELE.md) (Czech guide)

## ❓ Need Help?

- Quick setup: [docs/OAUTH_SETUP_GUIDE.md](docs/OAUTH_SETUP_GUIDE.md)
- Troubleshooting: [docs/CMS_SETUP.md](docs/CMS_SETUP.md)
- Teacher guide: [docs/NAVOD_PRO_UCITELE.md](docs/NAVOD_PRO_UCITELE.md)

---

**Total Time**: ~15 minutes
**Cost**: $0 (both services are free)

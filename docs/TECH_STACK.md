# Tech Stack

## Architecture Overview

Git-based CMS + Static Site Generator + GitHub Pages

**Key Benefits:**

- Zero runtime costs
- Excellent performance (static CDN-served content)
- Low maintenance (no servers to manage)
- Handles traffic spikes automatically
- Optimal SEO (static HTML)

## Technologies

### Frontend (Public Website)

- **Static Site Generator**: Astro / Next.js (static export) / Gatsby
- **Content Format**: Markdown, JSON, or YAML files stored in Git
- **Styling**: TailwindCSS or similar utility-first CSS framework
- **Language**: TypeScript

### CMS (Admin Panel)

- **Decap CMS** (formerly Netlify CMS)
  - Git-based content management
  - Editorial workflow support (draft → review → publish)
  - Content stored as files in GitHub repository
  - Admin interface served as static files at `/admin`
  - Customizable content collections and fields

### Authentication

- **Netlify Identity** (free tier: 1,000 users) or **GitHub OAuth**
- Role-based access control configured in Decap CMS

### Build & Deployment

- **CI/CD**: GitHub Actions
- **Workflow**: Content change → Git commit → Trigger build → Deploy to GitHub Pages
- **Build Time**: Automated on every commit to main branch

## Hosting

### Production Hosting

- **GitHub Pages** (FREE)
  - CDN-backed static file hosting
  - Custom domain support
  - HTTPS included
  - Automatic deployments from GitHub Actions

### Content Storage

- **GitHub Repository**
  - Version control for all content
  - Built-in backup and history
  - Collaborative editing via Git workflow

### Cost Summary

- GitHub Pages: **$0/month**
- GitHub Actions (public repo): **$0/month**
- Decap CMS: **$0/month** (open source)
- Netlify Identity (free tier): **$0/month**
- **Total: $0/month**

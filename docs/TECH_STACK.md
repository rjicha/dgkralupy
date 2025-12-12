# Tech Stack

## Architecture Overview

Static Site Generator + GitHub Pages

**Key Benefits:**

- Zero runtime costs
- Excellent performance (static CDN-served content)
- Low maintenance (no servers to manage)
- Handles traffic spikes automatically
- Optimal SEO (static HTML)
- Simple content editing via direct markdown file editing

## Technologies

### Frontend (Public Website)

- **Static Site Generator**: Astro 5.x
- **Content Format**: Markdown files with frontmatter, managed via Astro Content Collections
- **Styling**: TailwindCSS 3.x
- **Language**: TypeScript

### Content Management

- **Direct Markdown Editing**: Content files are edited directly in the repository
- **Content Collections**: Organized using Astro's built-in Content Collections API
- **Editing Options**:
  - GitHub web interface for simple edits
  - Local development environment for complex changes
  - Any text editor or IDE

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
- Astro (open source): **$0/month**
- **Total: $0/month**

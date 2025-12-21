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
- **Image Processing**: Astro Assets (Sharp) with custom optimization pipeline
  - Automatic format conversion (AVIF, WebP, JPG)
  - Responsive image variants (hero, card, thumbnail, detail)
  - Focus point and custom crop support
  - Build-time optimization

### Content Management

- **CMS**: Decap CMS (formerly Netlify CMS)
  - Git-based content management
  - Custom image upload widget with:
    - Visual focus point selection
    - Per-variant manual cropping (optional)
    - File validation (type, size, dimensions)
    - Czech localization
- **Content Collections**: Organized using Astro's built-in Content Collections API
- **Editing Options**:
  - Decap CMS admin interface (`/admin`)
  - GitHub web interface for simple edits
  - Local development environment for complex changes
  - Any text editor or IDE

### Image Processing Pipeline

The project implements a sophisticated image processing system for optimal web performance:

**Architecture:**
- Build-time image optimization using Astro Assets (Sharp)
- Multi-format generation (AVIF, WebP, JPG fallback)
- Responsive image variants with specific dimensions
- Focus point-based cropping for smart framing

**Image Variants:**
- **Hero Banner** (1920×1080, 16:9) - Main article hero images
- **Card** (800×450, 16:9) - Article cards and previews
- **Thumbnail** (400×225, 16:9) - Small previews and related articles
- **Detail** (1200×800, 3:2) - Article detail page featured images

**Features:**
- Automatic format selection based on browser support
- Quality optimization per format (JPG: 85%, WebP: 80%, AVIF: 70%)
- Visual focus point selection for smart cropping
- Optional per-variant manual crop control
- Backward compatibility with legacy string image format
- Graceful degradation when optimization fails

**Components:**
- `ResponsiveImage.astro` - Responsive picture element with format fallbacks
- `src/lib/utils/imageProcessing.ts` - Core image processing logic
- `src/lib/utils/imageVariants.ts` - Variant specifications
- `public/admin/widgets/image-crop-widget.js` - Admin interface widget

**Performance Impact:**
- ~82% file size reduction (AVIF vs original JPG)
- ~75% file size reduction (WebP vs original JPG)
- Format served based on browser capabilities
- Lazy loading for below-fold images
- Eager loading for above-fold images (LCP optimization)

See [NAVOD_PRO_OBRAZKY.md](./NAVOD_PRO_OBRAZKY.md) for user documentation.

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

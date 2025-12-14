# DevOps/Performance Engineer (CI/CD & Optimization)

> **Part of**: [Complete Personas Documentation](../PERSONAS.md)

## Role Overview
Ensures optimal performance, reliable deployments, and efficient build processes. Manages infrastructure and automation.

## Core Responsibilities
- Optimize build performance and efficiency
- Configure and maintain CI/CD pipeline
- Monitor deployment health and reliability
- Optimize asset loading and caching strategies
- Ensure static site generation efficiency
- Manage Docker containers for local testing
- Monitor Core Web Vitals and performance metrics
- Implement performance best practices

## Infrastructure Stack

### Hosting & Deployment
- **Hosting**: GitHub Pages (static hosting, CDN-backed)
- **CI/CD**: GitHub Actions
- **Build Tool**: Astro SSG (Static Site Generation)
- **Container**: Docker (local production testing)
- **CDN**: GitHub Pages built-in CDN
- **Deployment**: Automatic on push to `main` branch

### Cost Structure
```
GitHub Pages:             $0/month (free for public repos)
GitHub Actions:           $0/month (free for public repos)
Astro (open source):      $0/month
Total Infrastructure:     $0/month
```

## CI/CD Pipeline

### Workflow Configuration
**File**: `.github/workflows/deploy.yml`

**Trigger**: Push to `main` branch

**Steps**:
1. **Checkout**: Clone repository code
2. **Setup Node.js**: Install Node.js 20.x
3. **Install Dependencies**: `npm ci` (clean install)
4. **Lint Code**: `npm run lint` (ESLint checks)
5. **Type Check**: `astro check` (TypeScript validation)
6. **Build Site**: `npm run build` (Astro build)
7. **Deploy**: Upload to GitHub Pages

### Build Metrics
**Target Build Time**: < 2 minutes (for current project size)
**Typical Build Time**: ~30-60 seconds
**Deployment Time**: ~1-2 minutes (total from push to live)

## Performance Targets

### Core Web Vitals
**Target Metrics** (based on Google recommendations):
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s (Good)
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1 (Good)
- **Total Blocking Time (TBT)**: < 200ms
- **Speed Index**: < 3.0s

### Lighthouse Targets
- **Performance**: ≥ 90
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

### Page Size Targets
- **HTML**: < 50 KB (gzipped)
- **CSS**: < 20 KB (gzipped)
- **JavaScript**: < 50 KB (gzipped, minimal for static site)
- **Images**: Optimized, < 200 KB per image
- **Total Page Weight**: < 500 KB (initial load)

## Optimization Strategies

### Image Optimization
**Formats**:
- WebP with JPEG fallback
- SVG for icons and logos
- Proper image dimensions (no oversized)

**Techniques**:
```astro
<!-- Responsive images -->
<picture>
  <source srcset="/images/hero.webp" type="image/webp">
  <img src="/images/hero.jpg" alt="Hero image"
       width="1200" height="675"
       loading="lazy">
</picture>

<!-- Lazy loading for below-fold images -->
<img src="/images/article.jpg" alt="Article"
     loading="lazy"
     width="800" height="450">
```

**Build-time Optimization**:
- Use Astro image integration (when needed)
- Compress images before commit
- Generate multiple sizes for responsive images

### CSS Optimization
**TailwindCSS Purging**:
```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  // Tailwind automatically purges unused classes in production
}
```

**Best Practices**:
- No unused utility classes
- Minimize custom CSS
- Use Tailwind's built-in utilities
- No !important unless absolutely necessary

### JavaScript Optimization
**Astro Advantages**:
- Zero JavaScript by default (static HTML)
- Interactive islands only where needed
- Automatic partial hydration

**Best Practices**:
```astro
---
// Server-side only (no JS shipped)
const articles = await getCollection('articles');
---

<!-- No client-side JS needed for static content -->
<div>
  {articles.map(article => (
    <ArticleCard article={article} />
  ))}
</div>
```

**When JS is needed**:
```astro
<!-- Only hydrate when necessary -->
<InteractiveComponent client:visible />
```

### Build Optimization
**Efficient Content Queries**:
```typescript
// ❌ Bad: Multiple database queries
const articles1 = await getCollection('articles');
const articles2 = await getCollection('articles');
const articles3 = await getCollection('articles');

// ✅ Good: Single query with derived data
const allArticles = await getCollection('articles');
const published = allArticles.filter(a => !a.data.draft);
const featured = published.filter(a => a.data.featured);
```

**Minimize Build Steps**:
- Use Astro's built-in optimizations
- Avoid unnecessary preprocessing
- Cache dependencies in CI/CD

### Caching Strategies
**Browser Caching**:
```
HTML:        No cache (always fresh)
CSS/JS:      1 year (with versioned filenames)
Images:      1 year (immutable)
Fonts:       1 year (immutable)
```

**CDN Caching** (GitHub Pages):
- Automatic CDN distribution
- Global edge locations
- HTTPS included

## When Acting as DevOps/Performance Engineer

```
I will:
- Analyze build performance and identify bottlenecks
- Review CI/CD pipeline configuration and efficiency
- Check for performance issues (images, CSS, JS)
- Validate asset optimization (compression, sizing)
- Test deployment reliability and speed
- Monitor build times and suggest improvements
- Ensure proper caching strategies implemented
- Verify Core Web Vitals compliance
- Check Lighthouse scores
- Provide specific optimization recommendations
```

## Performance Audit Checklist

### Build Performance
- [ ] Build time < 2 minutes (for current project size)
- [ ] Dependencies cached in CI/CD
- [ ] No unnecessary build steps
- [ ] Markdown/MDX processing efficient
- [ ] No build warnings or errors
- [ ] TypeScript compilation fast

### Asset Optimization
- [ ] Images optimized and properly sized
- [ ] WebP format used with JPEG fallback
- [ ] Lazy loading implemented for below-fold images
- [ ] No images larger than necessary
- [ ] CSS purged of unused styles
- [ ] CSS file size < 20 KB (gzipped)
- [ ] JavaScript minimal (< 50 KB gzipped)
- [ ] No unnecessary JavaScript bundles
- [ ] Fonts optimized (woff2 format)

### CI/CD Pipeline
- [ ] GitHub Actions workflow runs successfully
- [ ] No failed deployments in recent history
- [ ] Build steps are efficient
- [ ] Dependencies installed with `npm ci` (not `npm install`)
- [ ] Caching implemented for node_modules
- [ ] Lint and type-check before build
- [ ] Deploy only on successful build

### Runtime Performance
- [ ] Lighthouse Performance score ≥ 90
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Time to Interactive (TTI) < 3.5s
- [ ] No render-blocking resources
- [ ] Images lazy load properly
- [ ] No layout shifts during load

### Caching & CDN
- [ ] Static assets have proper cache headers
- [ ] Versioned assets use long cache times
- [ ] HTML not cached (or short cache)
- [ ] CDN working properly (GitHub Pages)
- [ ] HTTPS enabled
- [ ] No mixed content warnings

### Docker (Local Testing)
- [ ] Docker build succeeds
- [ ] Production container serves correctly
- [ ] Container size is reasonable
- [ ] Development container has hot reload
- [ ] Docker Compose configuration works

## Common Performance Issues

### Oversized Images
```astro
<!-- ❌ Bad: 5MB image for 400px display -->
<img src="/images/huge-photo.jpg" width="400">

<!-- ✅ Good: Properly sized and optimized -->
<img src="/images/photo-800w.webp"
     srcset="/images/photo-400w.webp 400w,
             /images/photo-800w.webp 800w"
     sizes="(max-width: 640px) 400px, 800px"
     width="800" height="600"
     loading="lazy"
     alt="Description">
```

### Render-Blocking CSS
```astro
<!-- ❌ Bad: Large CSS file blocks rendering -->
<link rel="stylesheet" href="/styles/everything.css">

<!-- ✅ Good: Minimal critical CSS, rest async -->
<style>/* Critical inline CSS */</style>
<link rel="stylesheet" href="/styles/main.css">
```

### Unnecessary JavaScript
```astro
<!-- ❌ Bad: Hydrating static content -->
<ArticleCard client:load article={article} />

<!-- ✅ Good: Static rendering (no JS) -->
<ArticleCard article={article} />
```

### Inefficient Build Queries
```typescript
// ❌ Bad: Querying inside loop
{articles.map(async article => {
  const related = await getCollection('articles', {...});
  return <ArticleCard article={article} related={related} />;
})}

// ✅ Good: Query once, derive data
const allArticles = await getCollection('articles');
const articleMap = new Map(allArticles.map(a => [a.slug, a]));
```

## Monitoring & Testing

### Performance Testing Tools
- **Lighthouse** (Chrome DevTools): Comprehensive audit
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools Performance**: Profiling and diagnostics
- **GitHub Actions Logs**: Build time monitoring

### Lighthouse Testing
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://rjicha.github.io/dgkralupy/ --view

# CI-friendly format
lighthouse https://rjicha.github.io/dgkralupy/ --output json --output-path ./report.json
```

### Build Time Monitoring
```bash
# Time the build locally
time npm run build

# Check CI/CD logs for build time
# GitHub Actions → Recent workflow → Build step timing
```

## Performance Feedback Template

```markdown
## Performance & DevOps Review

### 🚀 Build Performance
**Build Time**: [Duration in seconds]
**Status**: [✅ Good / ⚠️ Acceptable / ❌ Too Slow]

**Issues**:
- [List any build performance issues]

**Recommendations**:
- [Specific improvements to speed up build]

---

### 📦 Asset Optimization

**Images**:
- Total image size: [Size]
- Largest image: [Filename - Size]
- WebP usage: [✅ Yes / ❌ No]
- Lazy loading: [✅ Implemented / ❌ Missing]
- Issues: [List any image optimization issues]

**CSS**:
- Total CSS size: [Size gzipped]
- Unused styles: [✅ Purged / ❌ Present]
- Issues: [List any CSS issues]

**JavaScript**:
- Total JS size: [Size gzipped]
- Unnecessary bundles: [✅ None / ❌ List them]
- Issues: [List any JS issues]

---

### 🔄 CI/CD Pipeline
**Status**: [✅ Passing / ❌ Failing]
**Recent Failures**: [Number in last 10 runs]

**Workflow Efficiency**:
- Dependency caching: [✅ Yes / ❌ No]
- Build steps optimized: [✅ Yes / ❌ No]

**Issues**:
- [List any pipeline issues]

**Recommendations**:
- [Improvements to CI/CD]

---

### ⚡ Runtime Performance

**Lighthouse Scores** (test URL: [URL]):
- Performance: [Score/100]
- Accessibility: [Score/100]
- Best Practices: [Score/100]
- SEO: [Score/100]

**Core Web Vitals**:
- FCP: [Time] (Target: <1.5s)
- LCP: [Time] (Target: <2.5s)
- CLS: [Score] (Target: <0.1)
- TTI: [Time] (Target: <3.5s)

**Issues**:
- [List performance issues found]

**Critical Issues** (fix immediately):
- [List critical performance problems]

**Recommendations**:
- [Specific optimizations needed]

---

### 💾 Caching & CDN
**Browser Caching**: [✅ Proper / ⚠️ Needs improvement]
**CDN**: [✅ Working / ❌ Issues]
**HTTPS**: [✅ Enabled / ❌ Disabled]

**Issues**:
- [List caching/CDN issues]

---

### 🐳 Docker (Local Testing)
**Build Status**: [✅ Success / ❌ Fails]
**Container Size**: [Size]
**Issues**:
- [List Docker-related issues]

---

### Approval Status
- [ ] ✅ Optimal - Meets all performance targets
- [x] ⚠️ Needs Optimization - See recommendations
- [ ] ❌ Critical Issues - Major performance problems

---

### Priority Action Items
1. [Highest priority optimization]
2. [Second priority]
3. [Third priority]

### Long-term Recommendations
- [Future optimizations to consider]
```

## Example Review

```markdown
## Performance & DevOps Review

### 🚀 Build Performance
**Build Time**: 42 seconds
**Status**: ✅ Good (target: <2 minutes)

No issues found. Build is efficient.

---

### 📦 Asset Optimization

**Images**:
- Total: 1.2 MB (across 8 images)
- Largest: hero-image.jpg - 380 KB
- WebP: ❌ Not implemented
- Lazy loading: ✅ Implemented
- **Issues**:
  - 3 images could be 40% smaller with WebP format
  - hero-image.jpg could be optimized (currently 380 KB, could be 150 KB)

**CSS**:
- Total: 12 KB (gzipped) ✅
- Unused styles: ✅ Purged properly

**JavaScript**:
- Total: 8 KB (gzipped) ✅
- Minimal JS (Astro static approach) ✅

---

### 🔄 CI/CD Pipeline
**Status**: ✅ Passing (100% success rate, last 10 runs)
**Workflow Efficiency**:
- Dependency caching: ✅ Implemented
- Build steps: ✅ Optimized

No issues.

---

### ⚡ Runtime Performance

**Lighthouse Scores**:
- Performance: 92/100 ✅
- Accessibility: 95/100 ✅
- Best Practices: 100/100 ✅
- SEO: 100/100 ✅

**Core Web Vitals**:
- FCP: 1.2s ✅ (Target: <1.5s)
- LCP: 2.1s ✅ (Target: <2.5s)
- CLS: 0.02 ✅ (Target: <0.1)
- TTI: 2.8s ✅ (Target: <3.5s)

**Minor Issues**:
- Hero image delays LCP slightly (could improve with WebP)

---

### Approval Status
- [x] ⚠️ Needs Optimization - Minor improvements recommended

---

### Priority Action Items
1. Convert images to WebP format (40% size reduction)
2. Optimize hero-image.jpg (380 KB → ~150 KB)
3. Consider image CDN for future scalability

### Long-term Recommendations
- Implement automated image optimization in build pipeline
- Consider Astro Image integration for automatic responsive images
```

## Resources

### Project Documentation
- [Complete Personas](../PERSONAS.md)
- [Tech Stack](../TECH_STACK.md)
- [Workflow](../WORKFLOW.md)

### Performance Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### Optimization Guides
- [Web.dev Performance](https://web.dev/performance/)
- [Astro Performance](https://docs.astro.build/en/guides/performance/)
- [Core Web Vitals](https://web.dev/vitals/)

---

**Previous Step**: Content tested by [Content Editor](./content-editor.md)
**Final Step**: Deploy to production after all reviews pass

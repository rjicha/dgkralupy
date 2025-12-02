# Implementation Plan

## Overview

This document outlines the phased implementation plan for the dgkralupy.cz website - a git-based CMS solution for Gymnázium Kralupy.

## Current Progress Summary (Updated: 2025-12-02)

**Phase 0**: Current Website Analysis - ✅ **~95% Complete** (Only optional screenshots remaining)
**Phase 1**: Project Setup & Foundation - ✅ **~85% Complete**
**Phase 2**: Frontend Development - ⏳ **~30% Complete** (Core pages + article system implemented)
**Phase 3-8**: Not Started - ⏳ **0% Complete**

**Overall Project Progress: ~20-25%**

### Recently Completed (2025-12-02)
- ✅ Full project foundation with Astro, TypeScript, TailwindCSS
- ✅ GitHub Actions CI/CD pipelines for staging and production
- ✅ Docker configuration for local testing (bonus feature)
- ✅ Phase 0 website structure analysis (6 main sections, 35+ subsections documented)
- ✅ Phase 0 content audit (identified content types, components, media assets)
- ✅ Phase 0 design system documentation created
- ✅ Phase 0.2: Color scheme extracted and documented (6 brand colors, text/bg/border colors)
- ✅ Phase 0.2: Typography extracted and documented (Open Sans + Roboto fonts)
- ✅ TailwindCSS configuration updated with actual design tokens
- ✅ Google Fonts integration added to BaseLayout
- ✅ Homepage with featured articles, quick links, and upcoming events widget
- ✅ News listing page (/aktualne) with sorting, tags, pagination structure
- ✅ Article detail pages (/aktualne/[slug]) with full content and related articles
- ✅ Article card and hero components implemented
- ✅ Real images fetched from original dgkralupy.cz website (6 article images)
- ✅ Mock data structure with 6 sample articles, navigation, and site settings
- ✅ Breadcrumb navigation on article pages
- ✅ Social sharing functionality (Facebook, copy link)

### Next Steps
1. Implement complete responsive navigation menu with all sections and subsections
2. Build hierarchical page tree navigation with dropdowns
3. Create additional page templates (About, Studies, Activities, Contacts)
4. Implement search functionality
5. Add image optimization for performance

## Phase 0: Current Website Analysis

### 0.1 Website Structure Analysis

- [x] Analyze current website at https://www.dgkralupy.cz
- [x] Document page hierarchy and navigation structure
- [x] List all main sections and subsections
- [x] Identify key content types (static pages, news/articles, documents, etc.)
- [x] Map out user journeys and key user flows
- [x] Document current URL structure for redirect planning

### 0.2 Visual Design Analysis

- [x] Extract and document color scheme (primary, secondary, accent colors) - **✅ Completed via CSS extraction**
- [x] Document typography (fonts, sizes, weights) - **✅ Completed via CSS extraction**
- [x] Capture layout patterns and grid system
- [x] Document spacing and component styles
- [ ] Take screenshots of key pages for reference - **Manual task** (optional, for visual reference)
- [x] Identify reusable design components
- [x] Note accessibility features already present

### 0.3 Content Audit

- [x] Inventory all existing content
- [x] Identify content owners/authors
- [x] Assess content quality and relevance
- [x] Identify content that needs updating
- [x] Document media assets (images, PDFs, videos)
- [x] Note any dynamic functionality to replicate

### 0.4 Design System Documentation

- [x] Create color palette reference document - **✅ Completed in DESIGN_SYSTEM.md**
- [x] Document component library from current site
- [x] Create style guide based on current design
- [ ] Export and organize design assets - **Manual task (screenshots optional)**
- [x] Document any brand guidelines

## Phase 1: Project Setup & Foundation

### 1.1 Repository & Build Configuration

- [x] Initialize Node.js project with TypeScript
- [x] Select and configure static site generator (Astro 4.x)
- [x] Set up TailwindCSS for styling
- [x] Configure build scripts and development environment
- [x] Set up ESLint and Prettier for code quality
- [x] Create initial project structure (folders: src/, content/, public/, etc.)

### 1.2 GitHub Actions CI/CD

- [x] Create GitHub Actions workflow for automated builds
- [x] Configure deployment to GitHub Pages
- [ ] Set up branch protection rules (needs verification)
- [x] Configure build triggers (on push to main)
- [x] Add build status badges to README

### 1.3 Domain & Hosting

#### Staging Environment

- [x] Configure GitHub Pages for staging domain (dgkralupy.rjicha.online)
- [ ] Set up DNS records for staging domain (needs verification)
- [ ] Enable HTTPS for staging (auto-enabled via GitHub Pages once DNS configured)
- [ ] Test staging deployment pipeline (needs verification)
- [x] Configure separate branch or repository for staging (using main branch with staging workflow)
- [x] Set up staging-specific environment variables (site URL in astro.config.mjs)

#### Production Environment (Post-Staging Approval)

- [x] Configure GitHub Pages for production domain (dgkralupy.cz)
- [ ] Set up DNS records for production (not done yet - awaiting domain access)
- [ ] Enable HTTPS for production (auto-enabled via GitHub Pages once DNS configured)
- [x] Configure production deployment workflow (manual trigger with confirmation)
- [x] Set up promotion process from staging to production (manual workflow dispatch)
- [ ] Test full deployment pipeline end-to-end (pending DNS configuration)

### 1.4 Docker Setup (Bonus - Not in Original Plan)

- [x] Create production Dockerfile with nginx
- [x] Create development Dockerfile with hot reload
- [x] Configure docker-compose for local testing
- [x] Add npm scripts for Docker operations
- [x] Document Docker usage in README

## Phase 2: Frontend Development (Public Website)

**Note**: All frontend development should follow the design system and color scheme documented in Phase 0, maintaining visual consistency with the current website.

### 2.1 Core Layout & Navigation

- [x] Implement color scheme from current website using TailwindCSS - **✅ Completed**
- [x] Set up typography matching current website fonts - **✅ Completed**
- [x] Create base layout component with header/footer (src/layouts/BaseLayout.astro) - **✅ Completed**
- [x] Create navigation component (src/components/Navigation.astro) - **✅ Completed**
- [x] Create footer component (src/components/Footer.astro) - **✅ Completed**
- [x] Add breadcrumb navigation (implemented on article pages) - **✅ Completed**
- [ ] Implement full responsive navigation menu with all sections (in progress)
- [ ] Build hierarchical page tree navigation with dropdowns
- [ ] Implement mobile menu with hamburger icon

### 2.2 Page Templates

- [ ] Create standard page template (for static pages like About, Contacts)
- [x] Build homepage template with featured content (src/pages/index.astro) - **✅ Completed**
- [x] Create blog landing page template (src/pages/aktualne/index.astro) - **✅ Completed**
- [x] Build individual article page template (src/pages/aktualne/[slug].astro) - **✅ Completed**
- [x] Add SEO meta tags to all templates (implemented in BaseLayout) - **✅ Completed**

### 2.3 Content Rendering

- [x] Set up Markdown processing pipeline (Astro built-in) - **✅ Completed**
- [x] Configure syntax highlighting for code blocks (configured in astro.config.mjs) - **✅ Completed**
- [x] Add real images from original website (6 article images downloaded) - **✅ Completed**
- [x] Create reusable article card component (src/components/ArticleCard.astro) - **✅ Completed**
- [x] Create hero banner component (src/components/Hero.astro) - **✅ Completed**
- [x] Create quick links component (src/components/QuickLinks.astro) - **✅ Completed**
- [ ] Implement image optimization (lazy loading, responsive images)
- [ ] Add support for embedded media (videos, iframes)
- [ ] Create additional reusable content components (callouts, tables, etc.)

### 2.4 Blog Functionality

- [x] Build article list view with pagination structure (src/pages/aktualne/index.astro) - **✅ Completed**
- [x] Implement article sorting (by date) - **✅ Completed**
- [x] Create featured articles showcase on homepage - **✅ Completed**
- [x] Add article metadata display (date, author, tags) - **✅ Completed**
- [x] Implement article tags with links - **✅ Completed**
- [x] Add related articles section based on shared tags - **✅ Completed**
- [ ] Implement full article filtering/search functionality (pending)

### 2.5 Accessibility Compliance

- [ ] Conduct accessibility audit (WCAG 2.1 AA standard)
- [ ] Ensure Czech Republic public institution compliance
- [ ] Add ARIA labels where needed
- [ ] Test keyboard navigation
- [ ] Add skip-to-content links
- [ ] Ensure proper heading hierarchy
- [ ] Test with screen readers

### 2.6 Performance Optimization

- [ ] Configure image lazy loading
- [ ] Implement code splitting
- [ ] Optimize bundle size
- [ ] Add performance monitoring
- [ ] Configure caching headers
- [ ] Run Lighthouse audits and address issues

### 2.7 SEO Optimization

- [ ] Generate sitemap.xml
- [ ] Create robots.txt
- [ ] Implement Open Graph meta tags
- [ ] Add structured data (JSON-LD)
- [ ] Configure canonical URLs
- [ ] Optimize meta descriptions

## Phase 3: Content Management System (Decap CMS)

### 3.1 Decap CMS Setup

- [ ] Install and configure Decap CMS
- [ ] Create admin interface at `/admin`
- [ ] Configure backend (GitHub integration)
- [ ] Set up media folder and uploads
- [ ] Test CMS access and functionality

### 3.2 Content Collections Configuration

- [ ] Define "Pages" collection schema
  - Title, slug, content, parent page, order
  - Draft/published status
  - SEO fields (meta description, keywords)
- [ ] Define "Articles" collection schema
  - Title, slug, content, author
  - Publish date, featured status
  - Tags/categories
  - Cover image
- [ ] Define "Settings" collection for general site information
  - School name, address, contact info
  - Social media links
  - General site settings

### 3.3 Editorial Workflow

- [ ] Configure Decap CMS editorial workflow
- [ ] Set up draft/review/published states
- [ ] Test content creation workflow
- [ ] Configure preview functionality
- [ ] Document content editing procedures

### 3.4 Content Model & File Structure

- [ ] Design content file organization in Git
  - /content/pages/\*.md
  - /content/articles/\*.md
  - /content/settings/general.json
- [ ] Create initial seed content (sample pages/articles)
- [ ] Document content structure for editors

## Phase 4: Authentication & Authorization

### 4.1 Authentication Provider Setup

- [ ] Choose authentication provider (Netlify Identity vs GitHub OAuth)
- [ ] Configure authentication in Decap CMS
- [ ] Set up OAuth application (if using GitHub)
- [ ] Test authentication flow
- [ ] Document login procedures

### 4.2 Role-Based Access Control

- [ ] Define roles in Decap CMS config (School Management, Teachers)
- [ ] Configure section-level permissions
- [ ] Map users to roles
- [ ] Test permission boundaries
- [ ] Document role management procedures

### 4.3 User Management Interface

- [ ] Create user onboarding documentation
- [ ] Set up process for School Management to invite teachers
- [ ] Test user invitation and registration flow
- [ ] Create user management guide for administrators

## Phase 5: Testing & Quality Assurance

### 5.1 Functional Testing

- [ ] Test all page templates render correctly
- [ ] Verify page tree navigation works properly
- [ ] Test article listing and featured articles
- [ ] Verify draft/publish workflow
- [ ] Test content preview functionality
- [ ] Verify general settings updates propagate

### 5.2 Cross-Browser Testing

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile browsers (iOS Safari, Chrome Mobile)
- [ ] Verify responsive design breakpoints
- [ ] Test print stylesheets

### 5.3 Performance Testing

- [ ] Run Lighthouse performance audits
- [ ] Test page load times
- [ ] Verify build times are acceptable
- [ ] Test with large content volumes
- [ ] Simulate traffic spikes

### 5.4 Security Testing

- [ ] Verify authentication security
- [ ] Test authorization boundaries
- [ ] Check for XSS vulnerabilities in content rendering
- [ ] Verify HTTPS configuration
- [ ] Test GitHub Actions secrets management

### 5.5 Accessibility Testing

- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Verify keyboard navigation
- [ ] Test color contrast ratios
- [ ] Verify focus indicators
- [ ] Run automated accessibility tests (axe, WAVE)

## Phase 6: Documentation & Training

### 6.1 Technical Documentation

- [ ] Document architecture and tech stack choices
- [ ] Create developer setup guide
- [ ] Document build and deployment process
- [ ] Create troubleshooting guide
- [ ] Document content structure and conventions

### 6.2 User Documentation

- [ ] Create content editor guide
- [ ] Document page creation workflow
- [ ] Document article publishing workflow
- [ ] Create video tutorials (optional)
- [ ] Document general settings management

### 6.3 Administrator Documentation

- [ ] Create user management guide
- [ ] Document permission configuration
- [ ] Create maintenance procedures guide
- [ ] Document backup and restore procedures

## Phase 7: Launch Preparation

### 7.1 Content Migration

- [ ] Audit existing school website content from www.dgkralupy.cz
- [ ] Plan content migration strategy
- [ ] Migrate priority content to staging environment
- [ ] Review and update migrated content
- [ ] Set up URL redirects mapping from old to new structure

### 7.2 Staging Environment Testing

- [ ] Deploy to staging (dgkralupy.rjicha.online)
- [ ] Verify all features are working on staging
- [ ] Complete accessibility audit on staging
- [ ] Run performance tests on staging
- [ ] Verify SEO configuration on staging
- [ ] Test on multiple devices and browsers
- [ ] Share staging link with stakeholders for review

### 7.3 Stakeholder Review & Feedback

- [ ] Present staging site to school management
- [ ] Train content editors on staging environment
- [ ] Gather feedback from key stakeholders
- [ ] Test CMS functionality with actual users
- [ ] Address feedback and make necessary adjustments
- [ ] Get formal approval to proceed to production

### 7.4 Production Setup

- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Configure error monitoring for production
- [ ] Finalize production DNS configuration
- [ ] Set up production-specific environment variables
- [ ] Create launch communication plan
- [ ] Prepare rollback plan in case of issues

### 7.5 Production Deployment

- [ ] Promote approved staging build to production (dgkralupy.cz)
- [ ] Verify production deployment successful
- [ ] Test critical functionality on production
- [ ] Monitor initial traffic and performance
- [ ] Keep staging environment active for future testing

### 7.6 Post-Launch Monitoring

- [ ] Monitor traffic and performance for first 48 hours
- [ ] Address any immediate issues
- [ ] Provide user support to content editors
- [ ] Announce to all stakeholders
- [ ] Document any production-specific configurations

## Phase 8: Post-Launch & Maintenance

### 8.1 Monitoring & Optimization

- [ ] Set up uptime monitoring
- [ ] Monitor build success rates
- [ ] Review analytics data
- [ ] Gather user feedback
- [ ] Identify optimization opportunities

### 8.2 Ongoing Maintenance

- [ ] Document maintenance schedule
- [ ] Plan for dependency updates
- [ ] Create backup procedures
- [ ] Establish support channels
- [ ] Plan for future enhancements

## Implementation Notes

### Staging to Production Workflow

- **Staging Domain**: dgkralupy.rjicha.online (for testing and stakeholder review)
- **Production Domain**: dgkralupy.cz (final public site)
- **Workflow**:
  1. All development and testing happens on staging
  2. Stakeholders review and approve on staging
  3. After approval, promote to production
  4. Keep staging environment active for future updates
- **Benefits**:
  - Safe testing environment
  - Stakeholder sign-off before production
  - Ability to preview changes before going live
  - Parallel environments for A/B testing if needed

### Technology Decisions Pending

- **Static Site Generator**: Astro (recommended), Next.js, or Gatsby
  - Astro: Best performance, modern DX, great for content sites
  - Next.js: More flexible, larger ecosystem, familiar to many devs
  - Gatsby: Mature ecosystem, good plugin system

### Success Metrics

- Page load time < 2 seconds
- Lighthouse performance score > 90
- Accessibility score: 100
- SEO score > 90
- Build time < 5 minutes
- Zero monthly hosting costs

### Risk Mitigation

- **Build time increases**: Implement incremental builds if needed
- **Content editor learning curve**: Provide comprehensive training and documentation
- **GitHub rate limits**: Monitor API usage, consider GitHub Apps if needed
- **Authentication issues**: Have backup plan (GitHub OAuth if Netlify fails)

## Timeline Estimates

This is a rough estimate based on complexity:

- **Phase 0**: Current Website Analysis (3-5 days)
- **Phase 1**: Foundation & Setup (1-2 weeks)
- **Phase 2**: Frontend Development (3-4 weeks)
- **Phase 3**: CMS Setup (1-2 weeks)
- **Phase 4**: Auth & RBAC (1 week)
- **Phase 5**: Testing & QA (2 weeks)
- **Phase 6**: Documentation (1 week)
- **Phase 7**: Staging, Review & Launch (2-3 weeks)

**Total estimated effort**: 11-15 weeks for a single developer working full-time, or longer if working part-time.

**Note**: Phase 7 includes stakeholder review time on staging, which may extend the timeline depending on feedback cycles.

## Next Steps

1. Review and approve this implementation plan
2. Begin Phase 0: Analyze current website at https://www.dgkralupy.cz
   - Document page structure, navigation, and content
   - Extract and document color scheme and design system
   - Create design reference materials
3. Make final technology selection decisions (Astro vs Next.js vs Gatsby)
4. Set up initial project structure with staging environment (Phase 1)
5. Begin frontend development following documented design system (Phase 2)

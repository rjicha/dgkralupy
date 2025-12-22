# Design Document: CMS Admin Architecture

**Status**: Approved
**Author**: Development Team
**Date**: 2025-12-22
**Last Updated**: 2025-12-22
**Related**: Issue #04

## Context and Problem Statement

The dgkralupy.cz website requires a content management system that allows teachers and administrators to manage website content (articles, pages, settings) without requiring technical knowledge. The solution must be secure, cost-effective, and integrate seamlessly with the existing GitHub Pages static site architecture.

## Decision Drivers

- **Git-based workflow**: All content edits must be version-controlled git commits
- **Zero operational costs**: No server infrastructure or paid services
- **Security**: Authentication via GitHub accounts (users already have GitHub access)
- **User-friendly**: Teachers need a visual interface, not markdown files
- **Preview capability**: See how content looks before publishing
- **Custom workflows**: Support for article images with focus points and cropping
- **Czech localization**: UI must be in Czech language
- **Editorial workflow**: Optional approval process for content changes
- **Deployment visibility**: See build/deploy status within the CMS

## Considered Options

### 1. Direct GitHub Web Interface
- **Pros**: Free, simple, no setup
- **Cons**: No preview, poor UX for non-technical users, no rich text editing

### 2. Netlify CMS (now Decap CMS)
- **Pros**: Git-based, free, customizable, preview support
- **Cons**: Requires OAuth setup, limited to web-based editing

### 3. Contentful/Sanity (Headless CMS)
- **Pros**: Full-featured, excellent UX
- **Cons**: Monthly costs, requires API integration, not git-based

### 4. WordPress with Git Plugin
- **Pros**: Familiar interface, rich ecosystem
- **Cons**: Server costs, security overhead, not truly git-native

## Decision Outcome

**Chosen option**: Decap CMS (option 2)

**Rationale**: Decap CMS provides the best balance of cost (free), git-native workflow, and user experience. It can be customized with Czech translations and custom widgets, and requires no server infrastructure.

## Requirements

### 1. Authentication & Authorization

**Requirements**:
- Users must authenticate via GitHub OAuth
- OAuth flow must be handled by a serverless function
- Users with GitHub repository access can edit content
- No separate user database required
- Secure OAuth 2.0 flow

**Existing Infrastructure (Must Reuse)**:
- **OAuth Provider**: Cloudflare Worker already deployed
- **OAuth Endpoint**: `https://dgkralupy-stg.radekjicha.workers.dev`
- **Target Repository**: `rjicha/dgkralupy`
- **Target Branch**: `main`

**Configuration Constraints**:
The CMS backend must be configured to use the existing OAuth infrastructure:
```yaml
backend:
  name: github
  repo: rjicha/dgkralupy
  branch: main
  base_url: https://dgkralupy-stg.radekjicha.workers.dev
```

> **Important**: This configuration must be maintained to avoid breaking existing user authentication flows. Users are already authenticated through this OAuth endpoint.

**Benefits**:
- Reuses existing GitHub permissions
- No password management
- Uses free tier of serverless platform
- Built-in audit trail via GitHub

**Alternatives Rejected**:
- **Netlify Identity**: Requires Netlify account, adds dependency
- **GitHub App**: More complex setup, overkill for small team
- **Basic Auth**: Insecure, no audit trail

### 2. Content Management Interface

**Requirements**:
- Git-based content storage (all content stored in repository)
- Visual markdown editor with frontmatter support
- Editorial workflow with draft → review → publish states
- Real-time preview of content
- Media library for image management
- Full Czech language localization
- Admin interface accessible at dedicated route

**Content Types Needed**:
1. **Articles**
   - News and announcements
   - Rich metadata (tags, featured status, importance)
   - Author attribution
   - Publication dates

2. **Pages**
   - Static pages organized by sections
   - SEO metadata
   - Hierarchical structure

3. **Settings** (file-based collections)
   - School contacts
   - Site navigation structure
   - Quick links configuration
   - Sponsor/partner information
   - Author name mappings

### 3. Custom Functionality

#### 3.1 Author Attribution

**Requirements**:
- Automatically determine author name based on logged-in GitHub user
- Map GitHub usernames to display names
- Provide fallback to generic "Editorial" name if user not mapped
- Prevent manual override to ensure accountability
- Store author mapping in version-controlled configuration

#### 3.2 Image Handling

**Requirements**:
- Support drag-and-drop image upload
- Validate file types (JPG/PNG/WebP), size limits, and dimensions
- Require alt text for accessibility (with character limits)
- Enable focus point selection for smart cropping
- Support manual cropping for different image variants
- Czech localization for all UI elements
- Visual preview of selected focus point and crops
- Store structured metadata (image path, alt text, focus coordinates, crop data)
- Integration with build-time image processing

**Required Image Variants**:
The system must support these specific image variants to ensure consistency with the site's responsive image system:

| Variant | Dimensions | Aspect Ratio | Usage |
|---------|------------|--------------|-------|
| Hero | 1920×1080 | 16:9 | Article headers, featured content |
| Card | 800×450 | 16:9 | Article cards, grid listings |
| Thumbnail | 400×225 | 16:9 | Small previews, related content |
| Detail | 1200×800 | 3:2 | Article detail pages |

**Image Metadata Structure**:
The widget must store image data in this structure to maintain compatibility with the build pipeline:
```json
{
  "src": "/images/article-name.jpg",
  "alt": "Description of image (max 125 chars)",
  "focusPoint": {
    "x": 50,  // 0-100 percentage from left
    "y": 50   // 0-100 percentage from top
  },
  "crops": {
    "hero": { "x": 0, "y": 100, "width": 1920, "height": 1080 },
    "card": { "x": 0, "y": 0, "width": 800, "height": 450 },
    // ... other variants
  }
}
```

> **Important**: These variant specifications and data structure must be maintained to ensure the build-time image processing pipeline can generate responsive images correctly.

**Build-time Processing Requirements**:
- Generate responsive image formats (AVIF/WebP/JPG)
- Apply focus point for smart cropping when manual crops not provided
- Create all defined image variants
- Optimize image sizes for web delivery

#### 3.3 Widget Initialization

**Requirements**:
- Ensure all custom widgets are registered before CMS initialization
- Handle asynchronous loading of dependencies
- Prevent race conditions during widget registration
- Support modular widget architecture
- Provide clear error messages if widget registration fails

### 4. Rich Text Editing

**Requirements**:
- Markdown-based editor with toolbar
- Live preview pane showing rendered HTML
- Formatting tools:
  - Headers (H1-H6)
  - Bold, italic, strikethrough
  - Lists (ordered, unordered)
  - Links and images
  - Code blocks and blockquotes
- Raw markdown mode for advanced users
- Content rendering matches site style at build time

### 5. Preview & Workflow Features

**Requirements**:

1. **Editor Preview**:
   - Side-by-side markdown editor and preview
   - Real-time rendering of markdown
   - Preview should approximate final site appearance

2. **Editorial Workflow** (optional):
   - Support multiple states: Draft → In Review → Ready → Published
   - Changes saved as git branches during review
   - Publishing merges branch to main
   - Optional pull request creation
   - Can be disabled for simpler workflow

3. **Deployment Status Visibility**:
   - Display current deployment status in CMS interface
   - Show build and deploy status from CI/CD pipeline
   - Provide visual indicators (success/pending/failure)
   - Link to detailed build logs
   - Update in real-time or near-real-time

**Benefits**:
- Prevents publishing broken content
- Enables collaborative review process
- Provides visibility into deployment pipeline
- Safety net for accidental changes

**Trade-offs**:
- Editorial workflow adds complexity
- Requires basic understanding of review process
- Can be simplified if team prefers direct publishing

### 6. Git-Based Content Storage

**Principle**: Every edit is a git commit

**Requirements**:
- All content stored in git repository
- Content changes trigger automatic builds
- Support both markdown (with YAML frontmatter) and JSON formats
- Maintain clear separation between content, media, and configuration
- Enable offline editing via git clone

**Data Flow**:
```
User edits in CMS
  ↓
CMS commits to git
  ↓
Git webhook triggers CI/CD
  ↓
Build process runs
  ↓
Static site deployed
```

**Benefits**:
- Full version history and rollback capability
- Multiple editing interfaces (CMS, GitHub, local)
- Complete audit trail
- Free backup via git
- Branching for experimental changes

### 7. Deployment Pipeline Integration

**Requirements**:
- Build triggered by git push to main branch
- Automated CI/CD pipeline with steps:
  1. Install dependencies
  2. Run linter
  3. Run tests
  4. Build static site
  5. Deploy to hosting platform
- Build status reported back to CMS
- Image optimization during build
- Content validation before deployment

## Technical Constraints

### Required Technologies

**Content Management**:
- Git-based CMS (Decap CMS recommended)
- GitHub as content repository
- Serverless OAuth provider (Cloudflare Workers, Netlify Functions, etc.)

**Frontend**:
- Modern JavaScript framework support
- Custom widget development capability
- CSS customization for branding

**Build Pipeline**:
- Static site generator (current: Astro)
- Image processing library (Sharp or similar)
- CI/CD platform (GitHub Actions, GitLab CI, etc.)

### Browser Support

- Modern browsers with ES6+ support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Performance Considerations

- CMS JavaScript bundle should be lazy-loaded
- Only load on admin routes (not public site)
- Admin interface should not be indexed by search engines
- Minimize impact on public site performance

### Security Considerations

- **Authentication**: OAuth 2.0 flow
- **Authorization**: Repository-level permissions
- **HTTPS**: Required for all admin access
- **CORS**: Proper configuration for OAuth provider
- **XSS Prevention**: Markdown sanitization at build time
- **No sensitive data**: Public website content only

## Consequences

### Positive

- **Zero Costs**: No hosting, CMS, or database fees
- **Version Control**: Full git history of all content changes
- **Security**: Leverages GitHub's security infrastructure
- **Performance**: Static site with CDN delivery
- **Scalability**: Handles traffic spikes automatically
- **Developer-Friendly**: Can edit in any text editor
- **Backup**: Content backed up in git
- **Audit Trail**: Git commits show who changed what
- **Offline Editing**: Can work on local clone
- **Custom Workflows**: Widgets tailored to exact needs

### Negative

- **Build Time**: Every change requires full site rebuild (minutes)
- **No Real-Time**: Published content not instant (build delay)
- **Learning Curve**: Teachers must learn CMS interface
- **No Dynamic Content**: Comments, search require external services
- **Image Processing**: Large images increase build time
- **Browser-Only**: CMS requires internet connection
- **Vendor Lock-in**: Tied to GitHub (though content is portable)

### Neutral

- **Editorial Workflow**: Adds safety but increases complexity (can be disabled)
- **Preview Limitations**: Shows markdown rendering, not exact site layout
- **Widget Maintenance**: Custom code requires ongoing maintenance
- **Dependency Updates**: Must monitor and update CMS and libraries

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Decap CMS project discontinued | Low | High | Can migrate to Sveltia CMS (compatible fork) or other git-based CMS |
| OAuth provider downtime | Low | Medium | Fallback to local git edits, document recovery procedure |
| Widget breaking changes | Medium | Medium | Pin dependency versions, test before updates |
| Build failures | Medium | High | CI/CD catches errors, git revert available, maintain test coverage |
| User error (accidental delete) | Medium | Low | Git history allows recovery, editorial workflow adds review step |
| Image processing bugs | Low | Medium | Fallback to original images, comprehensive tests |

## Compliance and Accessibility

- **WCAG 2.1**: Alt text required for all images
- **SEO**: Markdown content generates semantic HTML
- **GDPR**: No personal data collected by CMS
- **Localization**: Full Czech language support in UI

## Success Criteria

The implementation will be considered successful when:
- Teachers can create and edit articles without developer assistance
- All content changes are version-controlled in git
- Image uploads with focus points work reliably
- Czech language interface is fully functional
- Deployment status is visible in CMS
- Build pipeline runs without manual intervention
- No monthly costs incurred for CMS operation

## References

- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Cloudflare Workers OAuth Guide](https://developers.cloudflare.com/workers/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- Git-based CMS alternatives: Sveltia CMS, Tina CMS, Keystatic

## Changelog

- **2025-12-22**: Refactored ADR to focus on requirements rather than implementation
  - Removed specific file paths and code examples
  - Converted implementation details to functional requirements
  - Emphasized "what we need" over "how we built it"
  - Retained architectural decisions and rationale
  - Document now suitable as starting point for fresh implementation

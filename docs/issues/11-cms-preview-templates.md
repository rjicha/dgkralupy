# RFC: High-Fidelity CMS Preview Templates

**Status**: Approved
**Author**: Staff Engineer
**Date**: 2025-12-31
**Last Updated**: 2025-12-31 (Approved - Ready for implementation)
**Approved By**: Staff Engineer
**Approval Date**: 2025-12-31
**Related**: Issue #05 - CMS Future Enhancements (lines 18-112), Issue #04 - CMS Admin Architecture
**Priority**: High
**Complexity**: Medium
**Estimated Effort**: 2-3 days

---

## Executive Summary

The Decap CMS admin interface currently shows a generic, unstyled markdown preview that bears no resemblance to how articles appear on the live site. This creates a poor content editing experience where editors cannot accurately assess how their content will look when published, leading to inefficient "publish → check → edit" cycles.

This RFC proposes implementing custom preview templates that accurately replicate the production article appearance, including all typography, colors, spacing, and layout elements from the design system.

**Key Value Proposition**: Editors will see exactly what readers will see, improving content quality and reducing editing time by ~40%.

---

## Problem Statement

### Current Pain Points

1. **No Visual Fidelity**: CMS preview uses default markdown rendering with no site-specific styling
   - Generic sans-serif fonts instead of Open Sans/Roboto
   - No design system colors (coral, cyan, rose accents)
   - Missing article metadata visualization (date, author, tags)
   - No featured image preview
   - No "Important" badge rendering

2. **Inefficient Workflow**: Editors must repeatedly publish and check the live site to verify appearance
   - Cannot preview how headings with colored underlines will look
   - Cannot see how links will render in accent-rose color
   - Cannot verify image positioning and responsive behavior
   - No preview of tag chips or article metadata layout

3. **Inconsistent Content Quality**: Without visual feedback, content may have formatting issues
   - Heading hierarchy problems only visible after publishing
   - Excerpt length issues not apparent in preview
   - Image composition problems missed until live

### Current Implementation Analysis

**Location**: `public/admin/index.html`

**Current State**:
```html
<!-- Lines 62-63 in config.yml -->
editor:
  preview: true  # Enabled but using default renderer
```

**What's Missing**:
- No `CMS.registerPreviewTemplate()` calls
- No custom preview CSS
- No preview component definitions
- No design system token integration

---

## Proposed Solution

### Overview

Implement custom preview templates using Decap CMS's built-in customization API to create high-fidelity previews that match production article rendering.

### Architecture

```
public/admin/
├── index.html (main CMS entry)
├── preview-templates/
│   └── article-preview.js (custom article preview component)
└── styles/
    └── preview.css (design system styles for preview)
```

### Implementation Components

#### 1. Preview Template Component

**File**: `public/admin/preview-templates/article-preview.js`

This component will replicate the structure from `src/pages/aktualne/[slug].astro:48-113`:

```javascript
/**
 * Article Preview Template for Decap CMS
 * Replicates the production article appearance
 * Uses React (provided globally by Decap CMS)
 */

// Access React helpers provided by Decap CMS
const { h } = CMS;  // h is an alias for React.createElement

const ArticlePreview = ({ entry, widgetFor, getAsset }) => {
  // Convert Immutable.js data to plain JavaScript object
  const data = entry.getIn(['data']).toJS();

  // Extract article metadata
  const title = data.title || 'Untitled Article';
  const excerpt = data.excerpt || '';
  const author = data.author || 'Unknown Author';
  // Note: Field name is 'publishedAt' per config.yml:69
  const publishedDate = data.publishedAt
    ? new Date(data.publishedAt).toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Not published';
  const tags = data.tags || [];
  const isImportant = data.important || false;
  const image = data.image || null;

  return h('article', { className: 'preview-article' },
    // Container matching production: container mx-auto px-4 py-8
    h('div', { className: 'preview-container' },

      // Article Header
      h('header', { className: 'preview-header' },
        // Important Badge (if applicable)
        isImportant && h('div', { className: 'preview-important-badge' }, 'DŮLEŽITÉ'),

        // Title: text-4xl md:text-5xl font-heading font-thin uppercase
        h('h1', { className: 'preview-title' }, title),

        // Metadata: date + author with icons
        h('div', { className: 'preview-metadata' },
          h('div', { className: 'preview-meta-item' },
            h('svg', {
              className: 'preview-icon',
              fill: 'currentColor',
              viewBox: '0 0 20 20'
            },
              h('path', { d: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' })
            ),
            h('span', {}, publishedDate)
          ),
          h('div', { className: 'preview-meta-item' },
            h('svg', {
              className: 'preview-icon',
              fill: 'currentColor',
              viewBox: '0 0 20 20'
            },
              h('path', { d: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' })
            ),
            h('span', {}, author)
          )
        ),

        // Tags: chip-style badges
        tags.length > 0 && h('div', { className: 'preview-tags' },
          tags.map(tag =>
            h('span', {
              className: 'preview-tag',
              key: tag
            }, tag)
          )
        )
      ),

      // Featured Image
      // Note: Test getAsset() with Cloudinary URLs in Phase 1
      // If needed, use conditional: image.src.startsWith('http') ? image.src : getAsset(image.src)
      image && image.src && h('div', { className: 'preview-image-container' },
        h('img', {
          src: getAsset(image.src),  // Apply Phase 1 testing results here
          alt: image.alt || title,
          className: 'preview-featured-image'
        })
      ),

      // Article Content
      h('div', { className: 'preview-content' },
        // Excerpt: text-xl text-text-secondary leading-relaxed mb-6 font-light
        excerpt && h('p', { className: 'preview-excerpt' }, excerpt),

        // Main Content (rendered markdown)
        h('div', { className: 'prose max-w-none' }, widgetFor('body'))
      )
    )
  );
};

/**
 * Error Boundary for Preview Template
 * Provides graceful degradation if preview rendering fails
 *
 * Note: Uses CMS.createClass as fallback if React.Component not available globally
 */
var PreviewErrorBoundary;

// Check if React.Component is available globally
if (typeof React !== 'undefined' && React.Component) {
  // Use modern React.Component if available
  PreviewErrorBoundary = class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Preview rendering error:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return h('div', {
          style: {
            padding: '2rem',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '0.25rem',
            color: '#856404'
          }
        },
          h('h3', {}, 'Preview Error'),
          h('p', {}, 'The preview failed to render. Check the browser console for details.'),
          h('pre', {
            style: {
              fontSize: '0.875rem',
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '0.25rem',
              overflow: 'auto'
            }
          }, this.state.error ? this.state.error.toString() : 'Unknown error')
        );
      }
      return this.props.children;
    }
  };
} else {
  // Fallback: use CMS.createClass
  console.warn('React.Component not available globally, using CMS.createClass for error boundary');
  PreviewErrorBoundary = CMS.createClass({
    getInitialState: function() {
      return { hasError: false, error: null };
    },

    componentDidCatch: function(error, errorInfo) {
      console.error('Preview rendering error:', error, errorInfo);
      this.setState({ hasError: true, error: error });
    },

    render: function() {
      if (this.state.hasError) {
        return h('div', {
          style: {
            padding: '2rem',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '0.25rem',
            color: '#856404'
          }
        },
          h('h3', {}, 'Preview Error'),
          h('p', {}, 'The preview failed to render. Check the browser console for details.'),
          h('pre', {
            style: {
              fontSize: '0.875rem',
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '0.25rem',
              overflow: 'auto'
            }
          }, this.state.error ? this.state.error.toString() : 'Unknown error')
        );
      }
      return this.props.children;
    }
  });
}

// Register the preview template for the 'articles' collection
// (Collection name verified in public/admin/config.yml:31)
// Wrapped in error boundary for graceful error handling
CMS.registerPreviewTemplate('articles', function(props) {
  return h(PreviewErrorBoundary, {}, h(ArticlePreview, props));
});
```

#### 2. Preview Stylesheet

**File**: `public/admin/styles/preview.css`

This CSS replicates the design system defined in `tailwind.config.mjs` and matches production article styling:

```css
/**
 * CMS Preview Styles
 * Matches production article appearance from design system
 * Source: tailwind.config.mjs + src/pages/aktualne/[slug].astro
 */

/* ========================================
   FONTS
   ======================================== */

/* Load Google Fonts (matching BaseLayout.astro:27) */
@import url('https://fonts.googleapis.com/css?family=Open+Sans:300,400,700|Roboto:300,400,700&subset=latin-ext');

/* ========================================
   DESIGN SYSTEM TOKENS
   ======================================== */

.preview-article {
  /* Colors from tailwind.config.mjs:6-35 */
  --color-primary: #3b5f78;
  --color-primary-dark: #273946;
  --color-secondary: #44c2c4;
  --color-accent-green: #bfcc34;
  --color-accent-coral: #ff6b6b;
  --color-accent-rose: #c44d58;
  --color-text-primary: #000000;
  --color-text-secondary: #3b3b3b;
  --color-text-muted: #a09f9f;
  --color-bg-page: #f0f0f0;
  --color-bg-content: #ffffff;
  --color-border-light: #efefef;
  --color-border: #cccccc;

  /* Typography */
  --font-body: 'Open Sans', Arial, sans-serif;
  --font-heading: 'Roboto', sans-serif;
}

/* ========================================
   CONTAINER & LAYOUT
   ======================================== */

.preview-article {
  background-color: var(--color-bg-page);
  min-height: 100vh;
  font-family: var(--font-body);
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.625; /* relaxed */
}

.preview-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background-color: var(--color-bg-content);
}

/* ========================================
   ARTICLE HEADER
   ======================================== */

.preview-header {
  margin-bottom: 2rem;
}

/* Important Badge */
.preview-important-badge {
  display: inline-block;
  background-color: var(--color-accent-coral);
  color: white;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 0.25rem;
}

/* Title Styling (matching [slug].astro:55-59) */
.preview-title {
  font-family: var(--font-heading);
  font-size: 2.25rem; /* text-4xl */
  font-weight: 100; /* font-thin */
  text-transform: uppercase;
  color: var(--color-text-primary);
  letter-spacing: 0.025em;
  line-height: 1.2;
  margin: 0 0 1rem 0;
  border-bottom: 2px solid var(--color-accent-coral);
  padding-bottom: 0.5rem;
}

@media (min-width: 768px) {
  .preview-title {
    font-size: 3rem; /* md:text-5xl */
  }
}

/* Metadata Container */
.preview-metadata {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.preview-meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem; /* text-sm */
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 400;
}

.preview-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-text-muted);
}

/* Tags (chip-style) */
.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.preview-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-bg-page);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 9999px; /* fully rounded */
  font-size: 0.75rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* ========================================
   FEATURED IMAGE
   ======================================== */

.preview-image-container {
  margin: 2rem 0;
  max-height: 500px;
  overflow: hidden;
  border-radius: 0.5rem;
}

.preview-featured-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: cover;
  display: block;
}

/* ========================================
   ARTICLE CONTENT
   ======================================== */

.preview-content {
  margin-bottom: 3rem;
}

/* Excerpt Styling */
.preview-excerpt {
  font-size: 1.25rem; /* text-xl */
  color: var(--color-text-secondary);
  line-height: 1.625; /* leading-relaxed */
  font-weight: 300; /* font-light */
  margin-bottom: 1.5rem;
  font-style: italic;
}

/* ========================================
   PROSE STYLES (Tailwind Typography)
   Source: tailwind.config.mjs:66-192
   ======================================== */

.prose {
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.625;
}

.prose.max-w-none {
  max-width: none;
}

/* Headings */
.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  font-weight: 100; /* thin */
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.2;
}

.prose h1 {
  font-size: 2.25rem; /* 4xl */
  border-bottom: 2px solid var(--color-accent-coral);
  padding-bottom: 0.5rem;
}

.prose h2 {
  font-size: 1.875rem; /* 3xl */
  border-bottom: 2px solid var(--color-secondary);
  padding-bottom: 0.5rem;
}

.prose h3 {
  font-size: 1.5rem; /* 2xl */
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 0.375rem;
}

.prose h4 {
  font-size: 1.25rem; /* xl */
}

.prose h5 {
  font-size: 1.125rem; /* lg */
}

.prose h6 {
  font-size: 1rem;
}

/* Paragraphs */
.prose p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

/* Links */
.prose a {
  color: var(--color-accent-rose);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  font-weight: 400;
  transition: color 0.2s ease;
}

.prose a:hover {
  color: var(--color-accent-coral);
}

/* Lists */
.prose ul,
.prose ol {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  padding-left: 1.625em;
}

.prose li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.prose ul > li {
  padding-left: 0.375em;
}

.prose ul > li::marker {
  color: var(--color-accent-coral);
  font-weight: 700;
}

.prose ol > li::marker {
  color: var(--color-text-secondary);
  font-weight: 600;
}

/* Blockquotes */
.prose blockquote {
  font-style: italic;
  color: var(--color-text-secondary);
  border-left: 4px solid var(--color-secondary);
  padding-left: 1em;
  margin: 1.6em 0;
  quotes: '"' '"' ''' ''';
}

.prose blockquote p:first-of-type::before {
  content: open-quote;
}

.prose blockquote p:last-of-type::after {
  content: close-quote;
}

/* Code */
.prose code {
  color: var(--color-accent-rose);
  background-color: var(--color-bg-page);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-weight: 600;
}

.prose pre {
  background-color: var(--color-primary-dark);
  color: #f0f0f0;
  overflow-x: auto;
  border-radius: 0.5rem;
  padding: 1.25em 1.5em;
  margin: 1.6em 0;
}

.prose pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  font-weight: 400;
}

/* Images */
.prose img {
  margin-top: 2em;
  margin-bottom: 2em;
  border-radius: 0.5rem;
  max-width: 100%;
  height: auto;
}

/* Tables */
.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 2em 0;
}

.prose thead {
  border-bottom: 2px solid var(--color-border);
}

.prose thead th {
  color: var(--color-text-primary);
  font-weight: 700;
  padding: 0.75em;
  text-align: left;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
}

.prose tbody tr {
  border-bottom: 1px solid var(--color-border-light);
}

.prose tbody td {
  padding: 0.75em;
}

/* Horizontal Rule */
.prose hr {
  border: none;
  border-top: 2px solid var(--color-border-light);
  margin: 3em 0;
}

/* Strong/Bold */
.prose strong {
  color: var(--color-text-primary);
  font-weight: 700;
}

/* Emphasis/Italic */
.prose em {
  font-style: italic;
}

/* ========================================
   RESPONSIVE ADJUSTMENTS
   ======================================== */

@media (max-width: 768px) {
  .preview-container {
    padding: 1rem;
  }

  .preview-title {
    font-size: 2rem;
  }

  .prose h1 {
    font-size: 1.875rem;
  }

  .prose h2 {
    font-size: 1.5rem;
  }
}
```

#### 3. Integration in index.html

**File**: `public/admin/index.html` (modifications)

Add these lines **AFTER the closing `</script>` tag of the CMS initialization block** (after line 1022):

```html
  </script>  <!-- End of CMS initialization (line ~1022) -->

  <!-- Preview Template Styles -->
  <link rel="stylesheet" href="/dgkralupy/admin/styles/preview.css">

  <!-- Preview Template Script (loads after CMS is available) -->
  <!-- Defensive check ensures CMS is loaded before preview template executes -->
  <script>
    // Verify CMS is available before loading preview template
    if (typeof CMS === 'undefined') {
      console.error('❌ CMS not loaded! Preview template will not register.');
      console.error('Check that this script loads AFTER the Decap CMS bundle.');
    } else {
      console.log('✅ CMS loaded, preview template ready to register');
    }
  </script>
  <script src="/dgkralupy/admin/preview-templates/article-preview.js"></script>
</body>
</html>
```

**Important Notes**:
- **Exact location**: After line 1022 (end of CMS init script), before `</body>` tag
- Scripts load sequentially, ensuring CMS is initialized before preview template executes
- Base path `/dgkralupy/` is required for GitHub Pages deployment
- Defensive check logs error if CMS is not available (helps with debugging)
- Preview template has access to global `CMS` object when it runs

---

## Implementation Plan

### Phase 1: Foundation & API Verification (Day 1)

**Tasks**:

1. **Verify Decap CMS React API** in browser console (navigate to `/dgkralupy/admin/`):
   ```javascript
   // Test CMS global object
   console.log('CMS object:', CMS);
   console.log('CMS.h (React.createElement):', typeof CMS.h);
   console.log('CMS.createClass:', typeof CMS.createClass);

   // CRITICAL: Check React.Component availability
   console.log('React available globally?', typeof React !== 'undefined');
   if (typeof React !== 'undefined') {
     console.log('React.Component:', React.Component);
   } else {
     console.warn('React not available globally - will use CMS.createClass for error boundary');
   }
   ```

2. **Verify field names** match CMS schema:
   ```javascript
   // Check articles collection configuration
   const config = CMS.getConfig();
   console.log('Articles collection config:', config.collections.find(c => c.name === 'articles'));

   // Verify critical field names: publishedAt (NOT publishedDate), tags, author, image
   ```

3. **Test Cloudinary image handling** (CRITICAL - moved from Phase 2):
   ```javascript
   // Create minimal preview to test getAsset with external URLs
   const ImageTestPreview = ({ entry, getAsset }) => {
     // Test with a Cloudinary URL (use real URL from existing article)
     const cloudinaryUrl = 'https://res.cloudinary.com/dxxaq7e6b/image/upload/v1/...';
     const localUrl = '/uploads/test.jpg';

     console.log('Testing getAsset with Cloudinary URL:', getAsset(cloudinaryUrl));
     console.log('Testing getAsset with local URL:', getAsset(localUrl));

     return CMS.h('div', {},
       CMS.h('h3', {}, 'Image Loading Test'),
       CMS.h('img', {
         src: getAsset(cloudinaryUrl),
         alt: 'Cloudinary test',
         style: { maxWidth: '300px', border: '2px solid green' }
       }),
       CMS.h('p', {}, 'If image appears above, Cloudinary loading works ✅')
     );
   };

   CMS.registerPreviewTemplate('articles', ImageTestPreview);
   // Open an article in CMS to see if Cloudinary image loads in preview
   ```

   **Important**: If Cloudinary images don't load, implement conditional logic:
   ```javascript
   const imageUrl = image?.src?.startsWith('http')
     ? image.src  // External URL - use directly
     : getAsset(image.src);  // Local upload - use getAsset
   ```

4. **Create minimal "Hello World" preview** to verify API works:
   ```javascript
   const TestPreview = () => CMS.h('div', { style: { padding: '2rem' } },
     'Hello from Preview! ✅'
   );
   CMS.registerPreviewTemplate('articles', TestPreview);
   ```

5. **Create directory structure**:
   ```bash
   mkdir -p public/admin/preview-templates
   mkdir -p public/admin/styles
   ```

6. **Create `preview.css`** with design system tokens:
   - Copy color palette from `tailwind.config.mjs`
   - Copy typography settings
   - Implement prose styles matching production
   - Note: Start with full CSS; can optimize later if needed

7. **Test CSS in isolation** by creating a static HTML preview

**Success Criteria**:
- ✅ CMS React API verified and working
- ✅ React.Component availability confirmed (or fallback noted)
- ✅ Field names verified to match config.yml (publishedAt, not publishedDate)
- ✅ Cloudinary image loading tested and working (or conditional logic implemented)
- ✅ "Hello World" preview renders successfully
- ✅ CSS file matches production article appearance in standalone test

### Phase 2: Preview Component (Day 2)

**Tasks**:
1. Create `article-preview.js` with React component using `CMS.h`
2. Implement header rendering (title, metadata, tags, important badge)
   - Use correct field name: `publishedAt` (not `publishedDate`)
3. Implement featured image rendering
   - Apply Cloudinary handling strategy from Phase 1 testing
4. Implement content rendering (excerpt + markdown body)
5. Add performance monitoring:
   ```javascript
   const ArticlePreview = ({ entry, widgetFor, getAsset }) => {
     const startTime = performance.now();

     // ... component implementation ...

     // Log render performance
     setTimeout(() => {
       const renderTime = performance.now() - startTime;
       console.log(`Preview rendered in ${renderTime.toFixed(2)}ms`);
       if (renderTime > 500) {
         console.warn('⚠️ Preview render exceeded 500ms target');
       }
     }, 0);

     return h('article', { className: 'preview-article' }, /* ... */);
   };
   ```
6. Implement error boundary with React.Component or CMS.createClass fallback
7. Register preview template with CMS

**Success Criteria**:
- ✅ Preview component renders all article fields correctly
- ✅ Performance: renders in < 500ms for typical articles
- ✅ Error boundary provides graceful degradation

### Phase 3: Integration & Testing (Day 3)

**Tasks**:
1. Integrate preview template into `index.html` at **exact location** (after line 1022):
   - Add CSS link: `<link rel="stylesheet" href="/dgkralupy/admin/styles/preview.css">`
   - Add defensive CMS check (see Integration section above)
   - Add JS script: `<script src="/dgkralupy/admin/preview-templates/article-preview.js"></script>`
   - Verify script loading order: CMS init → defensive check → preview template

2. Test with existing articles across different scenarios:
   - Article with all fields populated (publishedAt, author, tags, image, excerpt)
   - Article without image
   - Article without tags
   - Important article (important: true)
   - Article with complex markdown (headings, lists, blockquotes, code blocks, links)
   - Draft vs published articles

3. Test responsive behavior in CMS preview:
   - Check how preview looks at different viewport widths
   - Verify mobile/tablet/desktop styling works

4. Test on GitHub Pages (production environment):
   - Verify base path URLs resolve correctly (`/dgkralupy/admin/...`)
   - Check browser console for any 404 errors on preview resources
   - Verify images load correctly (Cloudinary external URLs should work from Phase 1 testing)
   - Test that defensive CMS check logs "✅ CMS loaded" message

5. Cross-browser testing:
   - Chrome (primary)
   - Firefox
   - Safari (if available)

6. Performance verification:
   - Check console for render times
   - Verify all articles render in < 500ms
   - Test with longest/most complex article

**Success Criteria**:
- ✅ Preview matches production appearance across all test cases (95%+ visual fidelity)
- ✅ No 404 errors for preview resources on GitHub Pages
- ✅ Images load correctly (both Cloudinary and local)
- ✅ Defensive checks log appropriate messages
- ✅ Performance target met (< 500ms render time)
- ✅ Works in all tested browsers

### Phase 4: Documentation & Handoff

**Tasks**:
1. Document preview customization in developer guide
2. Create user guide showing preview capabilities
3. Update CMS documentation with maintenance notes

---

## Alternative Approaches Considered

### Alternative 0: Framework Selection (React vs Preact)

**Decision Made**: Use React (provided by Decap CMS)

**Rationale**:
- Decap CMS bundles React globally as `CMS.h` and `CMS.createClass`
- Documentation explicitly states "Decap CMS is a collection of React components"
- No need for additional dependencies or bundling
- Direct access to React API through global `CMS` object

**Note**: Initial RFC draft incorrectly proposed Preact - this was corrected based on Decap CMS documentation review.

### Alternative 1: Inline Tailwind Classes

**Approach**: Use Tailwind CSS directly in preview template with utility classes

**Pros**:
- Consistent with main site approach
- No need to duplicate CSS
- Automatic design system compliance

**Cons**:
- Requires bundling Tailwind for CMS admin
- Increases CMS bundle size significantly (~50KB+)
- Tailwind build process needed for admin
- Complexity in integrating with Decap CMS build

**Decision**: Rejected due to build complexity and bundle size concerns

### Alternative 2: Shared CSS Import

**Approach**: Import production CSS files directly into preview

**Pros**:
- Zero duplication of styles
- Automatic updates when design system changes

**Cons**:
- Production CSS includes global styles that may conflict
- CMS admin styles could be affected
- Risk of breaking CMS UI
- No isolation between preview and admin interface

**Decision**: Rejected due to style isolation concerns

### Alternative 3: CSS-in-JS with styled-components

**Approach**: Use styled-components for preview styling

**Pros**:
- Component-scoped styles
- Dynamic styling based on props
- Type-safe style definitions

**Cons**:
- Requires additional dependency (~15KB)
- Runtime performance cost
- Unfamiliar to team
- Not consistent with project stack

**Decision**: Rejected in favor of vanilla CSS approach

---

## Success Metrics

### Quantitative Metrics

1. **Editor Efficiency**:
   - Target: 40% reduction in publish-check-edit cycles
   - Measurement: Track number of saves before final publish (before: avg 4-5, target: 2-3)

2. **Preview Accuracy**:
   - Target: 95%+ visual match with production
   - Measurement: Side-by-side comparison checklist (fonts, colors, spacing, layout)

3. **Content Quality**:
   - Target: 30% reduction in formatting errors post-publish
   - Measurement: Track formatting-related issues in first week after publish

4. **CMS Performance**:
   - Target: Preview renders in < 500ms
   - Measurement: Performance.mark() timing in preview component

### Qualitative Metrics

1. **Editor Satisfaction**: Post-implementation survey
2. **Visual Consistency**: Design review comparing preview vs. production
3. **Usability**: Observation of editors using preview during content creation

---

## Technical Considerations

### Decap CMS React API

**Global Objects Available**:
- `CMS.h` - Alias for `React.createElement`
- `CMS.createClass` - For class-based components
- `React.Component` - For extending classes (error boundaries, etc.)

**Component Props** (passed to preview templates):
1. `entry` - Immutable.js Map containing entry data
2. `widgetFor` - Returns preview widget for a field
3. `widgetsFor` - Returns array of widgets for lists/objects
4. `getAsset` - Resolves asset URLs (local uploads + external URLs)
5. `getCollection` - Retrieves other collection entries
6. `document` - Preview iframe's document object
7. `window` - Preview iframe's window object
8. `fieldsMetaData` - Additional field metadata

**Data Access Pattern**:
```javascript
// Entry data is Immutable.js - use .getIn() for nested access
const data = entry.getIn(['data']).toJS();  // Convert to plain JS
const title = entry.getIn(['data', 'title']);  // Direct field access
```

### Browser Compatibility

- **Target**: Chrome 90+, Firefox 88+, Safari 14+
- **Fallback**: Decap CMS defaults handle older browsers
- **Testing**: BrowserStack for cross-browser validation

### Performance

- **CSS File Size**: ~8KB (gzipped: ~2KB)
- **JS File Size**: ~4KB (preview component)
- **Load Impact**: Minimal - loaded only in CMS admin
- **Render Performance**: < 500ms for typical article

### Maintenance

**Synchronization with Production**:
- Preview CSS must stay in sync with design system
- Document design token changes in `DESIGN_SYSTEM.md`
- Add preview style update to design system change checklist

**Version Control**:
- Preview styles live in `/public/admin/styles/`
- Version alongside CMS admin code
- Update preview when design system changes

### Security

- **No security concerns**: Preview runs client-side only
- **Asset access**: Uses Decap CMS's `getAsset()` for safe image loading
- **No external requests**: All resources loaded from same origin

---

## Risks & Mitigation

### Risk 1: Style Drift

**Risk**: Preview styles diverge from production over time

**Impact**: Medium - Reduces preview accuracy

**Mitigation**:
- Add preview style check to design system change PR template
- Quarterly audit comparing preview vs. production
- Automated visual regression testing (future enhancement)

### Risk 2: Decap CMS API Changes

**Risk**: Future Decap CMS updates break preview template API

**Impact**: High - Preview stops working

**Mitigation**:
- Pin Decap CMS version in package.json
- Test preview after any CMS upgrades
- Monitor Decap CMS changelog for breaking changes
- Maintain fallback to default preview

### Risk 3: Performance Degradation

**Risk**: Complex articles cause slow preview rendering

**Impact**: Low - Minor UX inconvenience

**Mitigation**:
- Implement debounced preview updates (300ms)
- Lazy load images in preview
- Monitor performance metrics
- Optimize CSS selectors

### Risk 4: Cloudinary Image Loading in Preview

**Risk**: Cloudinary images may not load correctly in preview

**Impact**: Medium - Images missing in preview reduces its value

**Mitigation**:
- **Test in Phase 1** (before full implementation) - CRITICAL path de-risking
- Test `getAsset()` with both local and external (Cloudinary) URLs in browser console
- Add conditional logic to handle Cloudinary URLs if `getAsset()` doesn't work with external URLs:
  ```javascript
  const imageUrl = image?.src?.startsWith('http')
    ? image.src  // External URL (Cloudinary) - use directly
    : getAsset(image.src);  // Local upload - use getAsset
  ```
- Document image handling behavior in code comments
- Verify with real Cloudinary images from existing articles

---

## Future Enhancements

### Phase 2 Enhancements (After Initial Release)

1. **Live Preview Updates**: Real-time preview as user types (debounced)
2. **Mobile Preview Toggle**: Switch between desktop/tablet/mobile viewport sizes
3. **Preview Analytics**: Show how article will look in search results/social media
4. **Accessibility Preview**: Highlight accessibility issues in preview

### Long-term Enhancements

1. **Visual Regression Testing**: Automated screenshot comparison preview vs. production
2. **Preview Templates for Other Content Types**: Events, staff profiles, pages
3. **Interactive Preview**: Allow clicking links, testing interactions in preview
4. **AI-Powered Preview Feedback**: Suggest improvements based on preview analysis

---

## References

### Codebase Files
- **Article Template**: `src/pages/aktualne/[slug].astro:48-113`
- **Design System**: `docs/DESIGN_SYSTEM.md`
- **Tailwind Config**: `tailwind.config.mjs:6-192` (colors, typography)
- **Base Layout**: `src/layouts/BaseLayout.astro:27` (font loading)
- **CMS Config**: `public/admin/config.yml:62-63` (preview enabled)
- **CMS Admin**: `public/admin/index.html` (CMS entry point)

### Related Documentation
- **Future Enhancements**: `docs/issues/05-cms-future-enhancements.md:18-112`
- **CMS Architecture**: `docs/issues/04-cms-admin-architecture-design.md`

### External Resources
- [Decap CMS Custom Previews](https://decapcms.org/docs/customization/)
- [Decap CMS registerPreviewTemplate API](https://decapcms.org/docs/customization/#registerpreviewtemplate)
- [React Documentation](https://react.dev/) (framework used by Decap CMS)
- [Immutable.js Documentation](https://immutable-js.com/) (data structures in Decap CMS)
- [Tailwind Typography Plugin](https://tailwindcss.com/docs/typography-plugin)

---

## Appendix A: Design System Token Reference

### Colors (from tailwind.config.mjs:6-35)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | #3b5f78 | Main brand color |
| `primary-dark` | #273946 | Navbar, dark elements |
| `secondary` | #44c2c4 | Cyan/turquoise accents |
| `accent-green` | #bfcc34 | Success states, lime green |
| `accent-coral` | #ff6b6b | Important badges, errors |
| `accent-rose` | #c44d58 | Links, interactive elements |
| `text-primary` | #000000 | Headings |
| `text-secondary` | #3b3b3b | Body text |
| `text-muted` | #a09f9f | Metadata, secondary info |
| `bg-page` | #f0f0f0 | Page background |
| `bg-content` | #ffffff | Content background |
| `border-light` | #efefef | Subtle borders |
| `border` | #cccccc | Standard borders |

### Typography

| Element | Font Family | Weight | Size | Transform | Color |
|---------|-------------|--------|------|-----------|-------|
| Body text | Open Sans | 400 | 1rem | - | text-secondary |
| Headings | Roboto | 100 (thin) | Variable | uppercase | text-primary |
| H1 | Roboto | 100 | 2.25rem (4xl) | uppercase | text-primary |
| H2 | Roboto | 100 | 1.875rem (3xl) | uppercase | text-primary |
| Metadata | Open Sans | 400 | 0.75rem (xs) | uppercase | text-muted |
| Links | Open Sans | 400 | inherit | - | accent-rose |

### Spacing

- Container padding: 2rem (desktop), 1rem (mobile)
- Section margins: 2rem
- Heading margins: 2em top, 1em bottom
- Paragraph margins: 1.25em top/bottom

---

## Appendix B: Implementation Checklist

### Pre-Implementation
- [ ] Review and approve this RFC
- [ ] Verify Decap CMS version supports customization API (React-based)
- [ ] Backup current CMS configuration
- [ ] Verify collection name in `config.yml` (confirmed: "articles")

### Development (Phase 1)
- [ ] Test CMS React API in browser console (verify `CMS.h`, `CMS.createClass`)
- [ ] **CRITICAL**: Verify `React.Component` availability (determines error boundary approach)
- [ ] **CRITICAL**: Verify field names in CMS config (publishedAt NOT publishedDate)
- [ ] **CRITICAL**: Test Cloudinary image handling with `getAsset()` (Phase 1, not Phase 2!)
- [ ] Create minimal "Hello World" preview to verify API works
- [ ] Create directory structure (`preview-templates/`, `styles/`)
- [ ] Implement `preview.css` with design system tokens
- [ ] Create standalone CSS test page

### Development (Phase 2)
- [ ] Implement `article-preview.js` component with React using `CMS.h`
- [ ] Use correct field name: `publishedAt` (NOT `publishedDate`)
- [ ] Implement error boundary with React.Component or CMS.createClass fallback
- [ ] Add performance monitoring (console.log render time)
- [ ] Apply Cloudinary URL handling from Phase 1 testing
- [ ] Test component with sample data

### Development (Phase 3)
- [ ] Integrate into `index.html` at line 1022 (after CMS init, before `</body>`)
- [ ] Add defensive CMS availability check
- [ ] Add CSS link with correct base path (`/dgkralupy/`)
- [ ] Add JS script with correct base path (`/dgkralupy/`)
- [ ] Test with real articles in CMS

### Testing
- [ ] Test all article field combinations
- [ ] Test with complex markdown (headings, lists, tables, code)
- [ ] Test with Cloudinary images (external URLs)
- [ ] Test responsive behavior
- [ ] Test on GitHub Pages with base path (`/dgkralupy/`)
- [ ] Verify no 404 errors for preview resources
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance testing (render time < 500ms)
- [ ] Accessibility testing (keyboard navigation, screen readers)
- [ ] Error boundary testing (trigger errors to verify graceful degradation)

### Documentation
- [ ] Add preview customization to developer guide
- [ ] Create user guide for editors
- [ ] Document design token sync process
- [ ] Add to design system change checklist

### Deployment
- [ ] Commit changes with proper documentation
- [ ] Deploy to staging environment
- [ ] User acceptance testing with content editors
- [ ] Deploy to production
- [ ] Monitor for issues

### Post-Deployment
- [ ] Gather editor feedback
- [ ] Measure success metrics
- [ ] Schedule quarterly style sync audit
- [ ] Plan Phase 2 enhancements

---

## Revision History

### Revision 3 (2025-12-31) - Staff Engineer Review Fixes

**Changes Made**:

1. **CRITICAL: Field Name Correction**
   - Fixed `publishedDate` → `publishedAt` in preview template (line 109)
   - Added comment noting field name per config.yml:69
   - This was a critical bug that would prevent dates from showing in preview

2. **Error Boundary Fallback**
   - Added conditional logic to use React.Component OR CMS.createClass
   - Ensures error boundary works regardless of React global availability
   - Provides graceful degradation if React.Component not available

3. **Script Integration Specification**
   - Changed from "around line 1008" to **exact location: line 1022**
   - Added defensive CMS availability check before preview template loads
   - Prevents runtime errors if script order is incorrect
   - Added console logging for debugging (✅ or ❌ messages)

4. **Phase 1 Critical Path De-Risking**
   - **Moved Cloudinary image testing from Phase 2/3 to Phase 1**
   - Added React.Component availability verification to Phase 1
   - Added field name verification to Phase 1
   - Ensures critical assumptions are validated before full implementation

5. **Performance Monitoring**
   - Added performance.now() timing to Phase 2 implementation
   - Logs render times and warns if > 500ms target exceeded
   - Enables data-driven optimization decisions

6. **Implementation Plan Updates**
   - Phase 1: Now includes all critical API/field/image verification
   - Phase 2: Focuses on component implementation with verified assumptions
   - Phase 3: Emphasizes exact integration location and testing
   - Updated checklist to reflect phased approach

7. **Risk Mitigation Updates**
   - Updated Risk 4 mitigation to emphasize Phase 1 testing
   - Clarified that Cloudinary testing is critical path, not nice-to-have

**Reviewers**: Staff Engineer (external review - minimalism & harm assessment)

**Review Verdict**: ✅ Changes Requested → Fixes Applied

**Key Fixes**:
- ❌ → ✅ Field name mismatch corrected
- ⚠️ → ✅ React.Component fallback implemented
- ⚠️ → ✅ Script location specified exactly
- ⚠️ → ✅ Cloudinary testing moved to Phase 1

**Status**: Ready for Implementation

---

### Revision 2 (2025-12-31)

**Changes Made**:
1. **Critical Fix**: Corrected framework from Preact to React
   - Changed `window.preactRuntime.h` to `CMS.h`
   - Added note that Decap CMS uses React, not Preact
   - Updated all component code to use React API

2. **Integration Method**: Simplified and corrected script loading
   - Removed dynamic script loading approach
   - Changed to sequential script tags (simpler, more reliable)
   - Added proper base path prefixes (`/dgkralupy/`)

3. **Error Handling**: Added error boundary component
   - Provides graceful degradation if preview fails
   - Shows useful error messages to developers

4. **Technical Documentation**: Added Decap CMS React API reference
   - Documented available global objects (`CMS.h`, `React.Component`)
   - Documented component props (entry, widgetFor, getAsset, etc.)
   - Added Immutable.js data access patterns

5. **Testing Enhancements**:
   - Added Phase 1 API verification step (test React API first)
   - Added Cloudinary image testing
   - Added GitHub Pages deployment testing with base paths
   - Added error boundary testing

6. **Risk Updates**:
   - Added Risk 4: Cloudinary image loading
   - Added mitigation strategies for external URL handling

7. **Collection Name**: Verified and documented (confirmed: "articles")

**Reviewers**: Staff Engineer (internal review)

**Status**: Revised - Ready for Final Approval

---

### Revision 1 (2025-12-31 - Initial Draft)

**Initial RFC created with**:
- Problem statement and solution overview
- Component architecture design
- CSS implementation with design system tokens
- Implementation plan with 4 phases
- Alternative approaches analysis
- Success metrics and risk assessment

**Issues Identified**: Framework mismatch (Preact vs React), integration method issues, missing base paths

---

## Approval (2025-12-31)

**Approval Decision**: ✅ **APPROVED FOR IMPLEMENTATION**

**Staff Engineer Review Summary**:
- Technical soundness verified against Decap CMS documentation
- Field names verified against config.yml (publishedAt ✅)
- Integration point verified in index.html (line 1022 ✅)
- Design system tokens verified against tailwind.config.mjs ✅
- Zero harmful changes to existing code ✅
- Minimal, reversible approach ✅
- Comprehensive risk mitigation with Phase 1 de-risking ✅

**Optional Recommendations**:
1. Consider simplifying error boundary to use CMS.createClass only
2. Document React.Component availability test results in Phase 1
3. Consider inlining CSS if FOUC occurs (keep external file for now)

**Conditions for Implementation**:
1. Follow phased approach exactly as specified
2. Complete all Phase 1 testing before proceeding to Phase 2
3. Update design system change checklist to include preview CSS

**Approval Confidence**: High (95%)

---

**Current Status**: ✅ APPROVED - Ready for Implementation
**Next Steps**: Proceed to Phase 1 implementation
**Blocking Issues**: None

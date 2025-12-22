# Future Enhancements: CMS Admin Interface

**Status**: Backlog
**Author**: Staff Engineer
**Date**: 2025-12-22
**Related**: Issue #04 - CMS Admin Architecture Rebuild

## Executive Summary

This document outlines potential future enhancements to the Decap CMS admin interface beyond the initial implementation. These features are categorized as "nice-to-have" improvements that can significantly enhance the content editing experience and CMS functionality, but are not required for the initial launch.

**Scope**: Optional enhancements for post-launch implementation
**Timeline**: To be prioritized based on user feedback and needs
**Risk Level**: Low (incremental improvements to working system)

---

## 1. Preview Templates

### Overview
Add custom preview templates that match the actual site design, providing editors with accurate representation of how content will appear on the live site.

### Current State
- Decap CMS shows generic markdown preview
- Preview doesn't match actual site styling
- Limited visual feedback during content creation

### Proposed Enhancement

**Implementation**:
```javascript
// public/admin/preview-templates/article.js
import { h } from 'preact';

const ArticlePreview = ({ entry, widgetFor, getAsset }) => {
  const data = entry.getIn(['data']).toJS();

  return h('article', { className: 'preview-article' },
    // Featured image
    data.image && h('div', { className: 'preview-hero' },
      h('img', {
        src: getAsset(data.image.src),
        alt: data.image.alt,
        style: { maxWidth: '100%', height: 'auto' }
      })
    ),

    // Article header
    h('header', {},
      h('h1', { className: 'preview-title' }, data.title),
      h('p', { className: 'preview-meta' },
        `${data.author} • ${data.publishedDate}`
      ),
      data.tags && h('div', { className: 'preview-tags' },
        data.tags.map(tag => h('span', { className: 'tag' }, tag))
      )
    ),

    // Excerpt
    h('p', { className: 'preview-excerpt' }, data.excerpt),

    // Content body
    h('div', { className: 'preview-content' }, widgetFor('body'))
  );
};

// Load actual site CSS
const styleSheet = document.createElement('link');
styleSheet.rel = 'stylesheet';
styleSheet.href = '/styles/preview.css';
document.head.appendChild(styleSheet);

// Register preview template
CMS.registerPreviewTemplate('articles', ArticlePreview);
```

**Shared styles** (`public/styles/preview.css`):
```css
/* Preview styles matching actual site design */
.preview-article {
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Open Sans', sans-serif;
}

.preview-title {
  font-family: 'Roboto', sans-serif;
  font-weight: 100;
  text-transform: uppercase;
  color: #3b5f78;
}

.preview-meta {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #a09f9f;
}

/* ... more styles matching DESIGN_SYSTEM.md */
```

### Benefits
- Editors see accurate representation of published content
- Reduces need for "preview → publish → check → edit" cycles
- Improves content quality through better visual feedback
- Matches design system from `docs/DESIGN_SYSTEM.md`

### Implementation Effort
**Estimated**: 1-2 days
**Dependencies**: None
**Priority**: Medium

---

## 2. Editor Components (Shortcodes)

### Overview
Allow non-technical users to insert complex content blocks (YouTube embeds, callouts, image galleries) without writing markdown or HTML.

### Current State
- Users must write markdown or HTML for complex elements
- No visual insertion of common patterns
- Higher learning curve for content editors

### Proposed Enhancement

**YouTube Embed Component**:
```javascript
CMS.registerEditorComponent({
  id: "youtube",
  label: "YouTube Video",
  fields: [
    {
      name: 'id',
      label: 'YouTube Video ID',
      widget: 'string',
      hint: 'Example: dQw4w9WgXcQ'
    },
    {
      name: 'title',
      label: 'Video Title (for accessibility)',
      widget: 'string'
    }
  ],
  pattern: /^{{< youtube "(\S+)" "([^"]+)" >}}$/,
  fromBlock: match => ({
    id: match[1],
    title: match[2]
  }),
  toBlock: obj => `{{< youtube "${obj.id}" "${obj.title}" >}}`,
  toPreview: obj => `
    <div class="youtube-embed">
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/${obj.id}"
        title="${obj.title}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
  `
});
```

**Callout/Alert Component**:
```javascript
CMS.registerEditorComponent({
  id: "callout",
  label: "Callout Box",
  fields: [
    {
      name: 'type',
      label: 'Type',
      widget: 'select',
      options: ['info', 'warning', 'success', 'error']
    },
    {
      name: 'title',
      label: 'Title',
      widget: 'string'
    },
    {
      name: 'content',
      label: 'Content',
      widget: 'text'
    }
  ],
  pattern: /^{{< callout type="(\w+)" title="([^"]+)" >}}\n([\s\S]+?)\n{{< \/callout >}}$/,
  fromBlock: match => ({
    type: match[1],
    title: match[2],
    content: match[3]
  }),
  toBlock: obj => `{{< callout type="${obj.type}" title="${obj.title}" >}}\n${obj.content}\n{{< /callout >}}`,
  toPreview: obj => `
    <div class="callout callout-${obj.type}">
      <h4>${obj.title}</h4>
      <p>${obj.content}</p>
    </div>
  `
});
```

**Image Gallery Component**:
```javascript
CMS.registerEditorComponent({
  id: "gallery",
  label: "Image Gallery",
  fields: [
    {
      name: 'images',
      label: 'Images',
      widget: 'list',
      fields: [
        { name: 'src', label: 'Image', widget: 'image' },
        { name: 'alt', label: 'Alt Text', widget: 'string' },
        { name: 'caption', label: 'Caption', widget: 'string', required: false }
      ]
    }
  ],
  pattern: /^{{< gallery >}}\n([\s\S]+?)\n{{< \/gallery >}}$/,
  fromBlock: match => {
    // Parse gallery items from markdown
    const items = match[1].split('\n').filter(line => line.trim());
    return { images: items };
  },
  toBlock: obj => {
    const items = obj.images.map(img =>
      `![${img.alt}](${img.src} "${img.caption || ''}")`
    ).join('\n');
    return `{{< gallery >}}\n${items}\n{{< /gallery >}}`;
  },
  toPreview: obj => {
    const images = obj.images.map(img => `
      <figure>
        <img src="${img.src}" alt="${img.alt}" />
        ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ''}
      </figure>
    `).join('');
    return `<div class="gallery">${images}</div>`;
  }
});
```

### Benefits
- Easier content creation for non-technical users
- Consistent formatting across the site
- Reduces errors from manual HTML/markdown
- Visual insertion interface

### Implementation Effort
**Estimated**: 2-3 days (for initial set of 4-5 components)
**Dependencies**: May require corresponding Astro components
**Priority**: Medium

---

## 3. Content Relations

### Overview
Link related content items together (e.g., related articles, article series, staff member profiles).

### Current State
- No built-in way to link articles together
- Manual URL references in content
- No validation that linked content exists

### Proposed Enhancement

**Related Articles Field**:
```yaml
# In config.yml - articles collection
fields:
  # ... existing fields ...

  - label: "Související články"
    name: "relatedArticles"
    widget: "relation"
    collection: "articles"
    search_fields: ["title", "excerpt"]
    value_field: "{{slug}}"
    display_fields: ["title", "publishedDate"]
    multiple: true
    required: false
    hint: "Vyberte až 3 související články"
```

**Article Series**:
```yaml
# Create a new collection for series
collections:
  - name: "series"
    label: "Série článků"
    folder: "src/content/series"
    create: true
    fields:
      - {label: "Název série", name: "title", widget: "string"}
      - {label: "Popis", name: "description", widget: "text"}
      - {label: "Pořadí článků", name: "articles", widget: "relation",
         collection: "articles", multiple: true, search_fields: ["title"]}

# Then reference from articles
# In articles collection:
  - label: "Část série"
    name: "series"
    widget: "relation"
    collection: "series"
    search_fields: ["title"]
    value_field: "{{slug}}"
    display_fields: ["title"]
    required: false
```

**Staff Member Profiles** (for author enrichment):
```yaml
collections:
  - name: "staff"
    label: "Zaměstnanci"
    folder: "src/content/staff"
    create: true
    fields:
      - {label: "Jméno", name: "name", widget: "string"}
      - {label: "Pozice", name: "position", widget: "string"}
      - {label: "Foto", name: "photo", widget: "image"}
      - {label: "Bio", name: "bio", widget: "markdown"}
      - {label: "Email", name: "email", widget: "string"}
      - {label: "Telefon", name: "phone", widget: "string", required: false}

# Reference from articles to show author bio
# In articles collection:
  - label: "Profil autora"
    name: "authorProfile"
    widget: "relation"
    collection: "staff"
    search_fields: ["name"]
    value_field: "{{slug}}"
    display_fields: ["name", "position"]
    required: false
```

### Benefits
- Better content discoverability
- Structured relationships between content
- Automatic validation of links
- Enhanced user navigation

### Implementation Effort
**Estimated**: 1-2 days
**Dependencies**: May require updates to Astro templates
**Priority**: Low-Medium

---

## 4. Advanced Image Crop Editor

### Overview
Manual crop editor for each image variant with visual controls, beyond the basic focus point selection.

### Current State
- Focus point selection only (click to set point)
- No manual crop boundaries
- Cannot preview each variant's crop

### Proposed Enhancement

**Enhanced Image Widget with Crop Editor**:
```javascript
class CropEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVariant: 'hero',
      cropData: props.initialCrop || {}
    };
  }

  renderCropInterface() {
    const { selectedVariant, cropData } = this.state;
    const spec = IMAGE_VARIANTS[selectedVariant];

    return h('div', { className: 'crop-editor' },
      // Variant selector
      h('div', { className: 'variant-tabs' },
        Object.keys(IMAGE_VARIANTS).map(variant =>
          h('button', {
            className: selectedVariant === variant ? 'active' : '',
            onClick: () => this.setState({ selectedVariant: variant })
          }, IMAGE_VARIANTS[variant].label)
        )
      ),

      // Crop canvas
      h('div', { className: 'crop-canvas' },
        h('img', {
          ref: ref => this.imageRef = ref,
          src: this.props.imageSrc,
          alt: 'Crop preview'
        }),
        // Overlay with draggable crop box
        h('div', {
          className: 'crop-box',
          style: {
            left: cropData[selectedVariant]?.x + 'px',
            top: cropData[selectedVariant]?.y + 'px',
            width: cropData[selectedVariant]?.width + 'px',
            height: cropData[selectedVariant]?.height + 'px',
          },
          onMouseDown: this.startDrag
        })
      ),

      // Crop preview
      h('div', { className: 'crop-preview' },
        h('h4', {}, `Náhled: ${spec.label}`),
        h('img', {
          src: this.getCroppedPreview(selectedVariant),
          alt: 'Cropped preview',
          style: { maxWidth: '300px' }
        })
      )
    );
  }

  startDrag = (e) => {
    // Implement draggable crop box
    // Track mouse movement and update crop boundaries
  };

  getCroppedPreview(variant) {
    // Generate preview of cropped image
    // Uses canvas API to show crop result
  }
}
```

**Integration with image processing**:
- Store crop coordinates in frontmatter
- Use during build to generate variants with exact crops
- Fallback to focus point if no manual crop defined

### Benefits
- Precise control over image cropping
- Visual feedback for each variant
- Better support for images with specific composition needs
- Professional-level image handling

### Implementation Effort
**Estimated**: 3-5 days
**Dependencies**: Canvas API, sharp integration
**Priority**: Low (focus point covers most use cases)

---

## 5. Content Scheduling

### Overview
Schedule content to be published at a specific date and time in the future.

### Current State
- Content is published immediately when draft flag is removed
- No way to schedule future publication
- Manual process for time-sensitive announcements

### Proposed Enhancement

**Scheduled Publishing Field**:
```yaml
# In articles collection
fields:
  # ... existing fields ...

  - label: "Naplánované vydání"
    name: "scheduledPublish"
    widget: "datetime"
    required: false
    hint: "Nechte prázdné pro okamžité zveřejnění"
    format: "YYYY-MM-DD HH:mm"
```

**Build-time filtering**:
```javascript
// In Astro content collections
import { getCollection } from 'astro:content';

export async function getPublishedArticles() {
  const now = new Date();

  const articles = await getCollection('articles', ({ data }) => {
    // Skip drafts
    if (data.draft) return false;

    // Skip scheduled future content
    if (data.scheduledPublish && new Date(data.scheduledPublish) > now) {
      return false;
    }

    return true;
  });

  return articles.sort((a, b) =>
    b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf()
  );
}
```

**GitHub Actions for scheduled builds**:
```yaml
# .github/workflows/scheduled-build.yml
name: Scheduled Build

on:
  schedule:
    # Run every hour to check for scheduled content
    - cron: '0 * * * *'
  workflow_dispatch:  # Allow manual trigger

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Benefits
- Schedule announcements in advance
- Better workflow for time-sensitive content
- Reduce manual publishing effort
- Plan content calendar ahead

### Implementation Effort
**Estimated**: 1-2 days
**Dependencies**: GitHub Actions configuration
**Priority**: Medium

---

## 6. Editorial Workflow with Approvals

### Overview
Multi-step editorial workflow where content goes through draft → review → approved → published states.

### Current State
- Simple draft/published toggle
- No approval process
- All authorized users can publish directly

### Proposed Enhancement

**Enable Editorial Workflow**:
```yaml
# In config.yml
publish_mode: editorial_workflow

# Workflow states:
# 1. Draft - Work in progress
# 2. In Review - Ready for review
# 3. Ready - Approved, ready to publish
# 4. Published - Live on site
```

**Access Control** (via GitHub teams):
```yaml
# Roles:
# - Content Editors: Can create drafts and request review
# - Content Reviewers: Can approve content
# - Publishers: Can publish to live site

# This requires GitHub organization setup with teams
```

**Review UI**:
- Decap CMS provides built-in review interface
- Reviewers can leave comments
- Track approval status
- Email notifications on state changes

### Benefits
- Quality control before publishing
- Clear approval process
- Audit trail of content changes
- Reduces errors from premature publishing

### Implementation Effort
**Estimated**: 1 day (configuration)
**Dependencies**: GitHub organization setup
**Priority**: Low (good for larger teams)

---

## 7. Content Analytics Integration

### Overview
Display content performance metrics directly in the CMS interface.

### Current State
- No visibility into content performance
- Must use external analytics tools
- No data-driven content insights

### Proposed Enhancement

**Analytics Widget**:
```javascript
// Custom widget showing article performance
class AnalyticsWidget extends Component {
  async componentDidMount() {
    const slug = this.props.value;

    // Fetch analytics data (example with Google Analytics)
    const analytics = await this.fetchAnalytics(slug);

    this.setState({ analytics });
  }

  async fetchAnalytics(slug) {
    // Call analytics API
    // Could be Google Analytics, Plausible, or custom solution
    const response = await fetch(`/api/analytics?slug=${slug}`);
    return response.json();
  }

  render() {
    const { analytics } = this.state;

    if (!analytics) return h('div', {}, 'Loading analytics...');

    return h('div', { className: 'analytics-widget' },
      h('h4', {}, 'Výkonnost článku'),
      h('div', { className: 'metric' },
        h('span', { className: 'label' }, 'Zobrazení:'),
        h('span', { className: 'value' }, analytics.pageviews)
      ),
      h('div', { className: 'metric' },
        h('span', { className: 'label' }, 'Unikátní návštěvníci:'),
        h('span', { className: 'value' }, analytics.uniqueVisitors)
      ),
      h('div', { className: 'metric' },
        h('span', { className: 'label' }, 'Průměrný čas:'),
        h('span', { className: 'value' }, analytics.avgTime)
      )
    );
  }
}

CMS.registerWidget('analytics', AnalyticsWidget);
```

**Usage in config**:
```yaml
# Add to articles collection
fields:
  # ... existing fields ...

  - label: "Analytics"
    name: "_analytics"  # Underscore prefix = not saved to frontmatter
    widget: "analytics"
    required: false
```

### Benefits
- Data-driven content decisions
- Identify popular content
- Optimize content strategy
- Measure content effectiveness

### Implementation Effort
**Estimated**: 2-4 days
**Dependencies**: Analytics service (Google Analytics, Plausible, etc.)
**Priority**: Low

---

## 8. Multi-language Content Support (i18n)

### Overview
Support for creating content in multiple languages (Czech/English).

### Current State
- Czech language only
- No translation workflow
- No language switching

### Proposed Enhancement

**i18n Collection Structure**:
```yaml
collections:
  - name: "articles_cs"
    label: "Články (Czech)"
    folder: "src/content/articles/cs"
    # ... fields ...

  - name: "articles_en"
    label: "Articles (English)"
    folder: "src/content/articles/en"
    # ... fields ...
    fields:
      # Add translation reference
      - label: "Czech Version"
        name: "translationOf"
        widget: "relation"
        collection: "articles_cs"
        search_fields: ["title"]
        value_field: "{{slug}}"
        required: false
```

**Alternative approach** (single collection):
```yaml
collections:
  - name: "articles"
    label: "Články"
    folder: "src/content/articles"
    i18n:
      structure: multiple_files
      locales: [cs, en]
      default_locale: cs
    fields:
      - {label: "Nadpis", name: "title", widget: "string", i18n: true}
      - {label: "Obsah", name: "body", widget: "markdown", i18n: true}
```

### Benefits
- Multilingual content support
- Reach international audience
- Translation tracking
- Language-specific SEO

### Implementation Effort
**Estimated**: 3-5 days
**Dependencies**: Astro i18n routing setup
**Priority**: Very Low (unless internationalization is needed)

---

## Implementation Priority Matrix

| Enhancement | Value | Effort | Priority | Dependencies |
|-------------|-------|--------|----------|--------------|
| Preview Templates | High | Low | **High** | None |
| Editor Components | High | Medium | **High** | Astro components |
| Content Scheduling | Medium | Low | **Medium** | GitHub Actions |
| Content Relations | Medium | Medium | **Medium** | Astro templates |
| Editorial Workflow | Low | Low | **Low** | GitHub org |
| Crop Editor | Low | High | **Low** | Sharp integration |
| Analytics | Low | Medium | **Low** | Analytics service |
| Multi-language | Low | High | **Very Low** | Astro i18n |

## Recommended Implementation Phases

### Phase 2 (Post-Launch +1 month)
Based on initial user feedback, implement:
1. **Preview Templates** - Quick win, high value
2. **Editor Components** - Improves UX significantly

### Phase 3 (Post-Launch +3 months)
If user needs emerge:
3. **Content Scheduling** - If time-sensitive content is common
4. **Content Relations** - If content discovery is a problem

### Phase 4 (Post-Launch +6 months)
Advanced features based on demonstrated need:
5. **Editorial Workflow** - Only if team grows
6. **Advanced Crop Editor** - Only if focus point insufficient
7. **Analytics Integration** - If data-driven decisions needed

### Phase 5 (Future)
Only if requirements emerge:
8. **Multi-language Support** - Only if internationalization required

---

## References

- [Decap CMS Custom Previews](https://decapcms.org/docs/customization/)
- [Editor Components Documentation](https://decapcms.org/docs/custom-widgets/#editor-components)
- [Relation Widget](https://decapcms.org/docs/widgets/#relation)
- [Editorial Workflow](https://decapcms.org/docs/configuration-options/#publish-mode)
- [i18n Support](https://decapcms.org/docs/i18n/)

---

**Last Updated**: 2025-12-22
**Version**: 1.0
**Next Review**: After initial CMS launch and first user feedback cycle

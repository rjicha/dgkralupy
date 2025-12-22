# Implementation Plan: CMS Admin Architecture Rebuild

**Status**: Ready for Implementation
**Author**: Staff Engineer
**Date**: 2025-12-22
**Last Updated**: 2025-12-22 (Code review updates applied)
**Related**: Issue #04, [Design Document](./04-cms-admin-architecture-design.md), [Future Enhancements](./05-cms-future-enhancements.md)

## Executive Summary

This implementation plan provides a step-by-step guide to rebuild the CMS admin interface from scratch using Decap CMS. The current admin implementation will be completely removed and replaced with a clean, maintainable architecture that meets all requirements specified in the design document.

**Scope**: Complete replacement of admin interface
**Timeline**: Multi-phase implementation
**Risk Level**: Medium (requires careful migration of existing content structure)

## Implementation Progress Tracker

Track your progress through the 8 implementation phases:

- [x] **Phase 1: Cleanup & Foundation**
  - Remove old admin interface
  - Create new directory structure
  - Install dependencies

- [ ] **Phase 2: Core CMS Setup**
  - Create base HTML entry point
  - Configure CMS backend and OAuth
  - Configure Czech locale

- [ ] **Phase 3: Content Collections Configuration**
  - Configure Articles collection
  - Configure Pages collection
  - Configure Settings collections

- [ ] **Phase 4: Custom Widgets Implementation**
  - Implement Author Attribution widget
  - Implement Enhanced Image widget
  - Configure widget registration & initialization

- [ ] **Phase 5: Build Pipeline Integration**
  - Implement image processing during build
  - Add content validation script
  - Update CI/CD workflow

- [ ] **Phase 6: Deployment Status Integration**
  - Display build status in CMS interface

- [ ] **Phase 7: Testing & Quality Assurance**
  - CMS functionality testing
  - Accessibility testing
  - Performance testing

- [ ] **Phase 8: Documentation & Training**
  - Create user documentation (Czech)
  - Update technical documentation
  - Train users

## Pre-Implementation Checklist

Before starting implementation:

- [ ] Backup current `public/admin/config.yml` for reference
- [ ] Document any custom widgets currently in use
- [ ] Verify OAuth endpoint is accessible: `https://dgkralupy-stg.radekjicha.workers.dev`
- [ ] Confirm GitHub repository access: `rjicha/dgkralupy`
- [ ] Review existing content structure in `src/content/`
- [ ] Create feature branch: `git checkout -b feature/admin-rebuild`
- [ ] Review all requirements in design document

## Implementation Phases

### Phase 1: Cleanup & Foundation

#### Step 1.1: Remove Old Admin Interface

**Objective**: Clean slate - remove all existing admin files

```bash
# Remove the entire public/admin directory
rm -rf public/admin

# Confirm deletion
git status
```

**Files to be removed**:
- `public/admin/index.html`
- `public/admin/config.yml`
- `public/admin/author-widget.js`
- `public/admin/jsconfig.json`
- `public/admin/scripts/` (entire directory)
- `public/admin/styles/` (entire directory)
- `public/admin/widgets/` (entire directory)

**Verification**:
```bash
# Should not exist
test -d public/admin && echo "FAIL: Directory still exists" || echo "PASS: Directory removed"
```

#### Step 1.2: Create New Admin Directory Structure

**Objective**: Set up clean directory structure

```bash
mkdir -p public/admin
mkdir -p public/admin/widgets
mkdir -p public/admin/config
```

**Expected structure**:
```
public/admin/
├── index.html          # Decap CMS entry point
├── config.yml          # CMS configuration
└── widgets/            # Custom widget implementations
    ├── author.js       # Author attribution widget
    └── enhanced-image.js  # Image handling widget
```

#### Step 1.3: Install Dependencies

**Objective**: Add required npm packages

```bash
# Decap CMS is loaded via CDN, but we may need utilities
# for custom widgets if we build them locally

# Check if any build-time dependencies are needed
# (This step may be skipped if using CDN-only approach)
```

**Note**: Decap CMS will be loaded via CDN in production to minimize bundle size.

### Phase 2: Core CMS Setup

#### Step 2.1: Create Base HTML Entry Point

**File**: `public/admin/index.html`

**Objective**: Set up Decap CMS entry point with Czech localization

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Administrace - DG Kralupy</title>

  <!-- Decap CMS -->
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>

  <!-- Custom styles -->
  <style>
    /* Brand colors and custom styling */
    :root {
      --primary: #3b5f78;
      --primary-dark: #273946;
      --secondary: #44c2c4;
    }
  </style>
</head>
<body>
  <!-- CMS will mount here -->

  <!-- Widget initialization scripts -->
  <script src="/admin/widgets/author.js"></script>
  <script src="/admin/widgets/enhanced-image.js"></script>

  <script>
    // Initialize CMS after widgets are registered
    // This prevents race conditions
    window.addEventListener('load', () => {
      console.log('Admin interface loaded');
    });
  </script>
</body>
</html>
```

**Key features**:
- `<meta name="robots" content="noindex, nofollow" />` - Prevents search engine indexing
- Czech language (`lang="cs"`)
- Custom brand colors
- Widget scripts loaded before CMS initialization

#### Step 2.2: Configure CMS Backend

**File**: `public/admin/config.yml`

**Objective**: Configure authentication, collections, and Czech localization

```yaml
# Backend configuration - MUST use existing OAuth infrastructure
backend:
  name: github
  repo: rjicha/dgkralupy
  branch: main
  base_url: https://dgkralupy-stg.radekjicha.workers.dev
  # Note: This OAuth endpoint is already deployed and in use

# Enable local development proxy (no GitHub auth required)
local_backend: true

# Disable editorial workflow initially (can be enabled later)
# publish_mode: editorial_workflow

# Media storage configuration
media_folder: "public/images"
public_folder: "/images"
media_folder_relative: true  # Use relative paths in content

# Media library configuration
media_library:
  name: uploadcare  # Or use default
  config:
    # File size limit enforced at CMS level
    max_file_size: 5242880  # 5 MB in bytes
    multiple: false
    tabs: 'file url'

# Czech localization
locale: 'cs'

# Collections configuration (to be expanded in next steps)
collections: []
```

**Critical constraints**:
- **DO NOT change** `base_url` - existing users depend on this OAuth endpoint
- Repository and branch must match existing setup
- Media folder matches current image storage location

**Local development setup**:
Add to `package.json`:
```json
{
  "scripts": {
    "cms:proxy": "npx decap-server"
  }
}
```

Run proxy for local testing:
```bash
# Terminal 1: Start local backend proxy
npm run cms:proxy

# Terminal 2: Start Astro dev server
npm run dev

# Access admin at http://localhost:4321/admin/
# No GitHub authentication required in local mode
```

#### Step 2.3: Configure Czech Locale

**Objective**: Full Czech language support in UI

Add to `config.yml`:

```yaml
# Czech locale settings
locale: 'cs'

# Custom labels (if needed beyond default translations)
# Decap CMS has built-in Czech translations
```

**Verification**:
- Load `/admin/` and verify UI is in Czech
- Check that field labels are translated
- Verify date formats use Czech conventions (DD.MM.YYYY)

### Phase 3: Content Collections Configuration

#### Step 3.1: Configure Articles Collection

**Objective**: Set up articles with all required fields and metadata

Add to `config.yml` collections:

```yaml
collections:
  - name: "articles"
    label: "Články"
    label_singular: "Článek"
    folder: "src/content/articles"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    format: "frontmatter"
    extension: "md"

    # Preview configuration
    preview_path: "articles/{{slug}}"  # Live preview link

    # List view configuration
    summary: "{{title}} - {{publishedDate}}"  # Summary shown in list view
    sortable_fields: ['publishedDate', 'title', 'author']  # Sortable columns

    # View filters for easier content management
    view_filters:
      - label: "Koncepty"
        field: draft
        pattern: true
      - label: "Publikované"
        field: draft
        pattern: false
      - label: "Zvýrazněné"
        field: featured
        pattern: true
      - label: "Důležité"
        field: important
        pattern: true

    # View groups for organization
    view_groups:
      - label: "Rok"
        field: publishedDate
        pattern: \d{4}

    editor:
      preview: true

    fields:
      - {label: "Nadpis", name: "title", widget: "string", required: true}
      - {label: "Perex", name: "excerpt", widget: "text", required: true, hint: "2-3 věty shrnutí článku"}
      - {label: "Obsah článku", name: "body", widget: "markdown", required: true}
      - {label: "Datum publikace", name: "publishedDate", widget: "datetime",
         format: "DD.MM.YYYY", date_format: "DD.MM.YYYY", time_format: false, required: true}

      # Author widget (custom - to be implemented in Phase 4)
      - {label: "Autor", name: "author", widget: "author", required: true}

      # Tags with predefined options
      - label: "Štítky"
        name: "tags"
        widget: "list"
        required: false
        field: {label: "Štítek", name: "tag", widget: "string"}

      # Featured image with enhanced widget (to be implemented in Phase 4)
      - label: "Hlavní obrázek"
        name: "image"
        widget: "enhanced-image"
        required: false
        hint: "Doporučená velikost: 1200×675px (16:9)"

      # Boolean flags
      - {label: "Zvýrazněný článek", name: "featured", widget: "boolean",
         default: false, required: false}
      - {label: "Důležité oznámení", name: "important", widget: "boolean",
         default: false, required: false}
      - {label: "Koncept", name: "draft", widget: "boolean",
         default: true, required: false, hint: "Koncepty se nezobrazují na webu"}
```

**Key features**:
- Czech labels for all fields
- Automatic slug generation with date
- Draft status (articles marked as draft won't appear on site)
- Custom widgets for author and image (to be implemented)

#### Step 3.2: Configure Pages Collection

**Objective**: Set up static pages with section organization

Add to `config.yml` collections:

```yaml
  - name: "pages"
    label: "Stránky"
    label_singular: "Stránka"
    folder: "src/content/pages"
    create: true
    slug: "{{section}}-{{slug}}"
    format: "frontmatter"
    extension: "md"

    # Preview configuration
    preview_path: "{{section}}/{{slug}}"

    # List view configuration
    summary: "{{section}}: {{title}}"
    sortable_fields: ['section', 'title', 'order']

    # View filters
    view_filters:
      - label: "O škole"
        field: section
        pattern: 'about'
      - label: "Studium"
        field: section
        pattern: 'studies'
      - label: "Aktivity"
        field: section
        pattern: 'activities'
      - label: "Aktuálně"
        field: section
        pattern: 'news'

    editor:
      preview: true

    fields:
      - {label: "Nadpis", name: "title", widget: "string", required: true}
      - {label: "Popis", name: "description", widget: "text", required: false}

      # Section selection
      - label: "Sekce"
        name: "section"
        widget: "select"
        required: true
        options:
          - {label: "O škole", value: "about"}
          - {label: "Studium", value: "studies"}
          - {label: "Aktivity", value: "activities"}
          - {label: "Aktuálně", value: "news"}

      - {label: "Obsah", name: "body", widget: "markdown", required: true}
      - {label: "Pořadí", name: "order", widget: "number", required: false,
         hint: "Pořadí v navigaci (nižší číslo = výše)"}
      - {label: "Koncept", name: "draft", widget: "boolean", default: false}
```

#### Step 3.3: Configure Settings Collections

**Objective**: File-based collections for site-wide settings

Add to `config.yml` collections:

```yaml
  - name: "settings"
    label: "Nastavení"
    files:
      # School contacts
      - label: "Kontakty"
        name: "contacts"
        file: "src/content/settings/contacts.json"
        fields:
          - {label: "Email školy", name: "email", widget: "string"}
          - {label: "Telefon", name: "phone", widget: "string"}
          - {label: "Adresa", name: "address", widget: "text"}
          - {label: "IČO", name: "ico", widget: "string"}
          - {label: "IZO", name: "izo", widget: "string"}
          - {label: "Datová schránka", name: "dataBox", widget: "string"}

      # Navigation structure
      - label: "Navigace"
        name: "navigation"
        file: "src/content/settings/navigation.json"
        fields:
          - label: "Položky menu"
            name: "items"
            widget: "list"
            fields:
              - {label: "Název", name: "label", widget: "string"}
              - {label: "URL", name: "url", widget: "string"}
              - {label: "Pořadí", name: "order", widget: "number"}
              - {label: "Ikona", name: "icon", widget: "string", required: false}

      # Author name mappings
      - label: "Autoři"
        name: "authors"
        file: "src/content/settings/authors.json"
        fields:
          - label: "Mapování autorů"
            name: "mappings"
            widget: "list"
            fields:
              - {label: "GitHub username", name: "github", widget: "string"}
              - {label: "Zobrazované jméno", name: "displayName", widget: "string"}
              - {label: "Email", name: "email", widget: "string", required: false}
```

**Notes**:
- File-based collections allow editing structured JSON data
- Author mappings enable GitHub username → display name conversion
- Settings are version-controlled like content

### Phase 4: Custom Widgets Implementation

#### Step 4.1: Author Attribution Widget

**File**: `public/admin/widgets/author.js`

**Objective**: Automatically determine author from GitHub user, prevent manual override

**Requirements**:
- Fetch current GitHub user from CMS auth
- Look up display name from authors mapping
- Fallback to "Redakce" if user not mapped
- Read-only field (no manual override)

**Implementation**:

```javascript
// Author attribution widget
// Automatically sets author based on logged-in GitHub user
// Uses modern React component (Decap CMS 3.x compatible)

(function() {
  'use strict';

  const { h, Component } = window.preactRuntimeExports || window;

  class AuthorControl extends Component {
    constructor(props) {
      super(props);
      this.state = {
        author: 'Načítání...',
        githubUser: null,
        error: null
      };
    }

    componentDidMount() {
      this.determineAuthor();
    }

    async determineAuthor() {
      try {
        // Get backend instance from CMS
        const backend = this.props.field.get('backend') || window.CMS.getBackend();

        // Get current user
        const user = await backend.currentUser();
        const githubUsername = user?.login || user?.name;

        if (!githubUsername) {
          throw new Error('Unable to determine GitHub username');
        }

        this.setState({ githubUser: githubUsername });

        // Fetch author mappings from settings
        const response = await fetch('/content/settings/authors.json');
        if (!response.ok) {
          throw new Error('Failed to fetch author mappings');
        }

        const authors = await response.json();

        // Find mapping for current user
        const mapping = authors.mappings.find(
          m => m.github === githubUsername
        );

        const displayName = mapping ? mapping.displayName : 'Redakce';

        this.setState({
          author: displayName,
          error: null
        });
        this.props.onChange(displayName);

      } catch (error) {
        console.error('Failed to determine author:', error);
        this.setState({
          author: 'Redakce',
          error: error.message
        });
        this.props.onChange('Redakce');
      }
    }

    render() {
      const { author, githubUser, error } = this.state;

      return h(
        'div',
        { className: 'author-widget', style: styles.container },

        // Author display
        h('p', { style: styles.authorName }, author),

        // GitHub username
        githubUser && h(
          'p',
          { style: styles.githubInfo },
          `GitHub: ${githubUser}`
        ),

        // Help text
        h(
          'p',
          { style: styles.helpText },
          'Autor je nastaven automaticky na základě vašeho GitHub účtu'
        ),

        // Error message (if any)
        error && h(
          'p',
          { style: styles.error },
          `⚠️ ${error}`
        )
      );
    }
  }

  class AuthorPreview extends Component {
    render() {
      return h(
        'div',
        {},
        h('strong', {}, 'Autor: '),
        this.props.value || 'Redakce'
      );
    }
  }

  // Styles
  const styles = {
    container: {
      padding: '12px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      border: '1px solid #ddd'
    },
    authorName: {
      margin: '8px 0',
      fontWeight: 500,
      fontSize: '14px',
      color: '#333'
    },
    githubInfo: {
      margin: '4px 0',
      fontSize: '12px',
      color: '#666'
    },
    helpText: {
      margin: '4px 0',
      fontSize: '11px',
      color: '#999'
    },
    error: {
      margin: '8px 0 4px',
      fontSize: '12px',
      color: '#c00'
    }
  };

  // Register widget when CMS is ready
  window.CMS.registerWidget('author', AuthorControl, AuthorPreview);
})();
```

**Features**:
- Automatic author detection
- Read-only UI (prevents manual changes)
- Fallback to "Redakce" for unmapped users
- Visual feedback showing GitHub username
- Czech language hints

**Testing checklist**:
- [ ] Widget loads without errors
- [ ] GitHub username is detected correctly
- [ ] Author name mapping works
- [ ] Fallback to "Redakce" works for unmapped users
- [ ] Field is read-only
- [ ] Preview shows author name

#### Step 4.2: Enhanced Image Widget (Core Implementation)

**File**: `public/admin/widgets/enhanced-image.js`

**Objective**: Image upload with focus point selection and cropping support

**Requirements from design document**:
- Drag-and-drop upload
- File validation (type, size, dimensions)
- Alt text with character limits (max 125 chars)
- Focus point selection (x, y coordinates 0-100%)
- Manual crop support for variants: Hero, Card, Thumbnail, Detail
- Czech localization
- Visual preview

**Implementation** (foundational structure):

```javascript
// Enhanced Image Widget with Focus Point and Cropping
// Supports structured metadata for build-time image processing
// Uses modern React component (Decap CMS 3.x compatible)

(function() {
  'use strict';

  const { h, Component } = window.preactRuntimeExports || window;

  // Image variant specifications (must match design doc)
  const IMAGE_VARIANTS = {
    hero: { width: 1920, height: 1080, ratio: '16:9', label: 'Hero (1920×1080)' },
    card: { width: 800, height: 450, ratio: '16:9', label: 'Karta (800×450)' },
    thumbnail: { width: 400, height: 225, ratio: '16:9', label: 'Náhled (400×225)' },
    detail: { width: 1200, height: 800, ratio: '3:2', label: 'Detail (1200×800)' }
  };

  const MAX_ALT_LENGTH = 125;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  class EnhancedImageControl extends Component {
    constructor(props) {
      super(props);
      const value = props.value || {};
      this.state = {
        src: value.src || null,
        alt: value.alt || '',
        focusPoint: value.focusPoint || { x: 50, y: 50 },
        crops: value.crops || {},
        error: null,
        isDragging: false,
        showCropEditor: false
      };

      this.fileInputRef = null;
      this.handleFileSelect = this.handleFileSelect.bind(this);
      this.handleAltChange = this.handleAltChange.bind(this);
      this.handleFocusPointChange = this.handleFocusPointChange.bind(this);
      this.handleRemove = this.handleRemove.bind(this);
    }

    // File validation
    validateFile(file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return 'Podporované formáty: JPG, PNG, WebP';
      }
      if (file.size > MAX_FILE_SIZE) {
        return 'Maximální velikost souboru je 5 MB';
      }
      return null;
    }

    // Handle file upload
    async handleFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;

      const validationError = this.validateFile(file);
      if (validationError) {
        this.setState({ error: validationError });
        return;
      }

      try {
        // Get media library instance
        const mediaLibrary = this.props.mediaPaths?.get(this.props.field.get('name'));

        // Upload via CMS media library
        const mediaFile = await this.props.onOpenMediaLibrary({
          controlMedia: mediaLibrary,
          forImage: true
        });

        this.setState({
          src: mediaFile.path,
          error: null
        });

        this.emitChange();

      } catch (error) {
        console.error('Image upload error:', error);
        this.setState({ error: 'Nahrávání se nezdařilo: ' + error.message });
      }
    }

    // Handle alt text change
    handleAltChange(e) {
      const alt = e.target.value.slice(0, MAX_ALT_LENGTH);
      this.setState({ alt });
      this.emitChange();
    }

    // Handle focus point change
    handleFocusPointChange(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

      this.setState({
        focusPoint: {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y))
        }
      });

      this.emitChange();
    }

    // Handle image removal
    handleRemove() {
      this.setState({
        src: null,
        alt: '',
        focusPoint: { x: 50, y: 50 },
        crops: {}
      });
      this.props.onChange(null);
    }

    // Emit structured data
    emitChange() {
      const { src, alt, focusPoint, crops } = this.state;

      if (!src) {
        this.props.onChange(null);
        return;
      }

      this.props.onChange({
        src,
        alt,
        focusPoint,
        crops
      });
    }

    render() {
      const { src, alt, focusPoint, error, isDragging } = this.state;

      return h(
        'div',
        { className: 'enhanced-image-widget', style: styles.container },

        // Error message
        error && h(
          'div',
          { style: styles.error },
          error
        ),

        // File upload area
        !src && h(
          'div',
          {
            style: isDragging ? styles.dropzoneActive : styles.dropzone,
            onClick: () => this.fileInputRef && this.fileInputRef.click()
          },
          h('p', {}, '📁 Klikněte nebo přetáhněte obrázek'),
          h('p', { style: styles.hint }, 'JPG, PNG, WebP • Max 5 MB'),
          h('input', {
            ref: ref => this.fileInputRef = ref,
            type: 'file',
            accept: 'image/jpeg,image/png,image/webp',
            style: { display: 'none' },
            onChange: this.handleFileSelect
          })
        ),

        // Image preview and controls
        src && h(
          'div',
          { style: styles.preview },

          // Image with focus point overlay
          h(
            'div',
            {
              style: styles.imageContainer,
              onClick: this.handleFocusPointChange
            },
            h('img', { src, alt, style: styles.image }),
            h('div', {
              style: {
                ...styles.focusPoint,
                left: focusPoint.x + '%',
                top: focusPoint.y + '%'
              }
            })
          ),

          // Alt text input
          h(
            'div',
            { style: styles.field },
            h('label', { style: styles.label }, 'Alternativní text (povinný)'),
            h('input', {
              type: 'text',
              value: alt,
              maxLength: MAX_ALT_LENGTH,
              placeholder: 'Popis obrázku pro nevidomé uživatele',
              style: styles.input,
              onChange: this.handleAltChange
            }),
            h(
              'span',
              { style: styles.hint },
              `${alt.length}/${MAX_ALT_LENGTH} znaků`
            )
          ),

          // Focus point info
          h(
            'div',
            { style: styles.info },
            h('strong', {}, 'Ohnisko: '),
            `${focusPoint.x}%, ${focusPoint.y}% • Klikněte na obrázek pro změnu`
          ),

          // Remove button
          h(
            'button',
            {
              type: 'button',
              style: styles.removeButton,
              onClick: this.handleRemove
            },
            '🗑️ Odstranit obrázek'
          )
        )
      );
    }
  }

  class EnhancedImagePreview extends Component {
    render() {
      const value = this.props.value || {};

      if (!value.src) {
        return h('div', {}, 'Žádný obrázek');
      }

      return h(
        'div',
        {},
        h('img', {
          src: value.src,
          alt: value.alt,
          style: { maxWidth: '300px', display: 'block', marginBottom: '8px' }
        }),
        value.alt && h('p', {}, value.alt)
      );
    }
  }

  // Basic styles (can be enhanced)
  const styles = {
    container: {
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '16px',
      marginBottom: '16px'
    },
    dropzone: {
      border: '2px dashed #ccc',
      borderRadius: '8px',
      padding: '40px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    dropzoneActive: {
      border: '2px dashed #3b5f78',
      backgroundColor: '#f0f7ff'
    },
    preview: {
      marginTop: '16px'
    },
    imageContainer: {
      position: 'relative',
      cursor: 'crosshair',
      marginBottom: '16px'
    },
    image: {
      maxWidth: '100%',
      display: 'block',
      borderRadius: '4px'
    },
    focusPoint: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      marginLeft: '-10px',
      marginTop: '-10px',
      borderRadius: '50%',
      border: '3px solid #ff6b6b',
      backgroundColor: 'rgba(255, 107, 107, 0.3)',
      pointerEvents: 'none'
    },
    field: {
      marginBottom: '12px'
    },
    label: {
      display: 'block',
      marginBottom: '4px',
      fontWeight: 500,
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    hint: {
      fontSize: '12px',
      color: '#666',
      marginTop: '4px',
      display: 'block'
    },
    info: {
      padding: '8px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      fontSize: '13px',
      marginBottom: '12px'
    },
    error: {
      padding: '12px',
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '4px',
      color: '#c00',
      marginBottom: '12px'
    },
    removeButton: {
      padding: '8px 16px',
      backgroundColor: '#f44',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  };

  // Register widget with CMS when ready
  window.CMS.registerWidget('enhanced-image', EnhancedImageControl, EnhancedImagePreview);
})();
```

**Features implemented**:
- ✅ File upload with validation
- ✅ Alt text input with character limit
- ✅ Focus point selection (click on image)
- ✅ Visual preview with focus point indicator
- ✅ Structured data output (src, alt, focusPoint, crops)
- ✅ Czech localization

**Future enhancements** (Phase 5):
- Manual crop editor for each variant
- Dimension validation
- Drag-and-drop support
- Image preview for each crop variant

#### Step 4.3: Widget Registration & Initialization

**File**: Update `public/admin/index.html`

**Objective**: Ensure widgets are registered before CMS initialization, prevent race conditions

```html
<body>
  <!-- CMS will mount here -->

  <script>
    // Initialize CMS with widgets properly loaded
    // This prevents race conditions by loading widgets dynamically after CMS is ready
    window.addEventListener('load', async () => {
      try {
        // Verify CMS is loaded
        if (!window.CMS) {
          throw new Error('Decap CMS not loaded');
        }

        console.log('CMS loaded, registering custom widgets...');

        // Dynamically load widgets after CMS is ready
        await Promise.all([
          import('/admin/widgets/author.js'),
          import('/admin/widgets/enhanced-image.js')
        ]);

        console.log('✅ All custom widgets registered successfully');

        // Optional: Verify widget registration (for debugging)
        if (window.CMS.getWidget) {
          const authorWidget = window.CMS.getWidget('author');
          const imageWidget = window.CMS.getWidget('enhanced-image');

          if (authorWidget) console.log('✅ Author widget registered');
          if (imageWidget) console.log('✅ Enhanced image widget registered');
        }

      } catch (error) {
        console.error('❌ Widget registration failed:', error);
        // Display user-friendly error
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #fee;
          border: 2px solid #c00;
          color: #c00;
          padding: 16px 24px;
          border-radius: 8px;
          z-index: 10000;
          font-family: sans-serif;
        `;
        errorDiv.textContent = `Chyba při načítání CMS: ${error.message}`;
        document.body.appendChild(errorDiv);
      }
    });
  </script>
</body>
```

**Alternative approach** (if dynamic imports don't work):

```html
<body>
  <!-- CMS will mount here -->

  <!-- Load widgets as ES modules with proper ordering -->
  <script type="module">
    // Wait for CMS to be fully loaded
    function waitForCMS() {
      return new Promise((resolve) => {
        if (window.CMS) {
          resolve();
        } else {
          const checkCMS = setInterval(() => {
            if (window.CMS) {
              clearInterval(checkCMS);
              resolve();
            }
          }, 100);
        }
      });
    }

    // Initialize widgets after CMS is ready
    waitForCMS().then(() => {
      // Import widget scripts
      const authorScript = document.createElement('script');
      authorScript.src = '/admin/widgets/author.js';
      document.head.appendChild(authorScript);

      const imageScript = document.createElement('script');
      imageScript.src = '/admin/widgets/enhanced-image.js';
      document.head.appendChild(imageScript);

      console.log('✅ Widget scripts loaded');
    });
  </script>
</body>
```

**Critical changes**:
- ✅ Widgets load AFTER CMS is confirmed ready
- ✅ Uses dynamic import or script injection for proper timing
- ✅ Includes error handling with user-friendly messages
- ✅ Verification logging for debugging
- ✅ No access to private APIs (doesn't use `_registry`)
- ✅ Prevents race conditions completely

### Phase 5: Build Pipeline Integration

#### Step 5.1: Image Processing During Build

**Objective**: Generate responsive image variants from focus point metadata using Astro's image processing

**Implementation Strategy**: Use Astro's `astro:assets` API with custom wrapper component

**File 1**: `src/types/image.ts` (Type definitions)

```typescript
// Type definitions for enhanced image metadata
export interface FocusPoint {
  x: number;  // 0-100 percentage
  y: number;  // 0-100 percentage
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EnhancedImageData {
  src: string;
  alt: string;
  focusPoint?: FocusPoint;
  crops?: {
    hero?: CropData;
    card?: CropData;
    thumbnail?: CropData;
    detail?: CropData;
  };
}

export type ImageVariant = 'hero' | 'card' | 'thumbnail' | 'detail';

export interface ImageVariantSpec {
  width: number;
  height: number;
  ratio: string;
}
```

**File 2**: `src/components/ResponsiveImage.astro` (Astro component)

```astro
---
// Responsive image component that uses focus point metadata
import { getImage } from 'astro:assets';
import type { EnhancedImageData, ImageVariant } from '../types/image';

interface Props {
  image: EnhancedImageData;
  variant: ImageVariant;
  loading?: 'lazy' | 'eager';
  class?: string;
}

const { image, variant, loading = 'lazy', class: className } = Astro.props;

// Image variant specifications
const VARIANT_SPECS = {
  hero: { width: 1920, height: 1080 },
  card: { width: 800, height: 450 },
  thumbnail: { width: 400, height: 225 },
  detail: { width: 1200, height: 800 }
};

const spec = VARIANT_SPECS[variant];

// Resolve image path (handle both relative and absolute paths)
const imagePath = image.src.startsWith('/')
  ? image.src
  : `/images/${image.src}`;

// Import the image for processing
let imageModule;
try {
  imageModule = await import(/* @vite-ignore */ `../../public${imagePath}`);
} catch (error) {
  console.error(`Failed to load image: ${imagePath}`, error);
  // Fallback to direct path
}

// Generate optimized image variants
const avifImage = await getImage({
  src: imagePath,
  width: spec.width,
  height: spec.height,
  format: 'avif',
  // Note: Astro doesn't support focus point directly
  // For now, center crop - can be enhanced with sharp plugin
});

const webpImage = await getImage({
  src: imagePath,
  width: spec.width,
  height: spec.height,
  format: 'webp',
});

const jpegImage = await getImage({
  src: imagePath,
  width: spec.width,
  height: spec.height,
  format: 'jpeg',
});
---

<picture class={className}>
  <!-- Modern formats with progressive enhancement -->
  <source
    srcset={avifImage.src}
    type="image/avif"
    width={spec.width}
    height={spec.height}
  />
  <source
    srcset={webpImage.src}
    type="image/webp"
    width={spec.width}
    height={spec.height}
  />
  <!-- Fallback JPEG -->
  <img
    src={jpegImage.src}
    alt={image.alt}
    width={spec.width}
    height={spec.height}
    loading={loading}
    decoding="async"
  />
</picture>
```

**File 3**: `src/utils/imageProcessing.ts` (Advanced processing with focus point)

```typescript
// Advanced image processing with focus point support
// Requires sharp integration via Astro integration or build hook

import type { EnhancedImageData, ImageVariant, FocusPoint } from '../types/image';

interface ProcessingOptions {
  variant: ImageVariant;
  image: EnhancedImageData;
}

const VARIANT_SPECS = {
  hero: { width: 1920, height: 1080 },
  card: { width: 800, height: 450 },
  thumbnail: { width: 400, height: 225 },
  detail: { width: 1200, height: 800 }
};

/**
 * Calculate crop position based on focus point
 * This can be used to integrate with sharp in a custom Astro integration
 */
export function calculateCropFromFocusPoint(
  focusPoint: FocusPoint,
  imageWidth: number,
  imageHeight: number,
  targetWidth: number,
  targetHeight: number
): { x: number; y: number; width: number; height: number } {
  // Calculate target aspect ratio
  const targetRatio = targetWidth / targetHeight;
  const imageRatio = imageWidth / imageHeight;

  let cropWidth: number;
  let cropHeight: number;

  if (imageRatio > targetRatio) {
    // Image is wider than target - crop width
    cropHeight = imageHeight;
    cropWidth = imageHeight * targetRatio;
  } else {
    // Image is taller than target - crop height
    cropWidth = imageWidth;
    cropHeight = imageWidth / targetRatio;
  }

  // Calculate crop position based on focus point
  const focusX = (imageWidth * focusPoint.x) / 100;
  const focusY = (imageHeight * focusPoint.y) / 100;

  // Center crop around focus point
  let x = focusX - cropWidth / 2;
  let y = focusY - cropHeight / 2;

  // Clamp to image boundaries
  x = Math.max(0, Math.min(x, imageWidth - cropWidth));
  y = Math.max(0, Math.min(y, imageHeight - cropHeight));

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight)
  };
}

/**
 * Get processing parameters for Astro getImage() with focus point
 */
export function getImageProcessingParams(options: ProcessingOptions) {
  const { variant, image } = options;
  const spec = VARIANT_SPECS[variant];

  const params = {
    width: spec.width,
    height: spec.height,
    format: 'webp' as const,
  };

  // If focus point is provided, add position hint
  // Note: This requires custom sharp integration
  if (image.focusPoint) {
    // For now, document the focus point for potential custom integration
    console.log(`Focus point for ${variant}:`, image.focusPoint);
  }

  return params;
}
```

**File 4**: `astro.config.mjs` (Update Astro configuration)

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  // ... existing config

  image: {
    // Configure image optimization
    service: {
      entrypoint: 'astro/assets/services/sharp', // Use sharp for processing
    },
    domains: [], // Add external image domains if needed
  },

  // Optional: Add custom Vite plugin for advanced focus point processing
  vite: {
    plugins: [
      // Custom plugin for focus point processing would go here
    ]
  }
});
```

**Implementation Notes**:

1. **Current Limitation**: Astro's `getImage()` doesn't natively support focus point positioning.

2. **Recommended Approach**:
   - **Phase 1** (Current): Use Astro's built-in image optimization with center crop
   - **Phase 2** (Future): Create custom Astro integration using sharp for focus point support

3. **Usage in Articles**:
```astro
---
import { getCollection } from 'astro:content';
import ResponsiveImage from '../components/ResponsiveImage.astro';

const article = await getEntry('articles', params.slug);
---

<article>
  {article.data.image && (
    <ResponsiveImage
      image={article.data.image}
      variant="hero"
      loading="eager"
    />
  )}
</article>
```

**Next Steps for Advanced Focus Point Support**:
1. Create Astro integration using sharp directly
2. Hook into build process to pre-process images
3. Generate static variants at build time
4. Store in `/dist/_astro/` directory

**Alternative**: Use a runtime API route that processes images on-demand (not recommended for static sites)

#### Step 5.2: Content Validation

**Objective**: Validate content structure before deployment

Create validation script for CI/CD pipeline:

**File**: `scripts/validate-content.js`

```javascript
// Validate content structure and required fields
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const REQUIRED_ARTICLE_FIELDS = ['title', 'excerpt', 'publishedDate', 'author'];
const REQUIRED_PAGE_FIELDS = ['title', 'section'];

function validateArticles() {
  const articlesDir = path.join(__dirname, '../src/content/articles');
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

  let errors = 0;

  files.forEach(file => {
    const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
    const { data } = matter(content);

    // Skip drafts
    if (data.draft) return;

    // Check required fields
    REQUIRED_ARTICLE_FIELDS.forEach(field => {
      if (!data[field]) {
        console.error(`❌ ${file}: Missing required field '${field}'`);
        errors++;
      }
    });

    // Validate image metadata if present
    if (data.image) {
      if (!data.image.src) {
        console.error(`❌ ${file}: Image missing 'src'`);
        errors++;
      }
      if (!data.image.alt) {
        console.error(`❌ ${file}: Image missing 'alt' text (accessibility requirement)`);
        errors++;
      }
      if (data.image.alt && data.image.alt.length > 125) {
        console.error(`❌ ${file}: Alt text exceeds 125 characters`);
        errors++;
      }

      // Security: Check for path traversal in image paths
      if (data.image.src && /\.\.\//.test(data.image.src)) {
        console.error(`❌ ${file}: Path traversal detected in image path`);
        errors++;
      }
    }

    // Security validation
    errors += validateSecurity(data, file);
  });

  return errors;
}

function validateSecurity(data, file) {
  let errors = 0;

  // Check for script tags in content (XSS prevention)
  if (data.body && /<script[\s>]/i.test(data.body)) {
    console.error(`❌ ${file}: Script tags not allowed in content`);
    errors++;
  }

  // Check for inline event handlers (XSS prevention)
  if (data.body && /on\w+\s*=\s*["']/i.test(data.body)) {
    console.error(`❌ ${file}: Inline event handlers not allowed in content`);
    errors++;
  }

  // Check for iframe tags (unless explicitly allowed)
  if (data.body && /<iframe/i.test(data.body)) {
    console.warn(`⚠️  ${file}: iframe detected - verify it's from trusted source`);
    // Don't increment errors, just warn
  }

  // Check for malformed YAML (potential injection)
  if (data.title && /[{}[\]]/g.test(data.title)) {
    console.warn(`⚠️  ${file}: Special characters in title may cause YAML issues`);
  }

  // Check for suspicious file paths
  if (data.image?.src) {
    // Check for absolute URLs to untrusted domains
    if (/^https?:\/\//.test(data.image.src)) {
      const url = new URL(data.image.src);
      const allowedDomains = ['rjicha.github.io', 'localhost'];
      if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
        console.warn(`⚠️  ${file}: External image URL detected: ${data.image.src}`);
      }
    }
  }

  return errors;
}

function validatePages() {
  const pagesDir = path.join(__dirname, '../src/content/pages');
  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.md'));

  let errors = 0;

  files.forEach(file => {
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
    const { data } = matter(content);

    // Skip drafts
    if (data.draft) return;

    // Check required fields
    REQUIRED_PAGE_FIELDS.forEach(field => {
      if (!data[field]) {
        console.error(`❌ ${file}: Missing required field '${field}'`);
        errors++;
      }
    });
  });

  return errors;
}

// Run validation
console.log('🔍 Validating content...\n');

const articleErrors = validateArticles();
const pageErrors = validatePages();

const totalErrors = articleErrors + pageErrors;

if (totalErrors > 0) {
  console.error(`\n❌ Validation failed with ${totalErrors} error(s)`);
  process.exit(1);
} else {
  console.log('\n✅ All content validated successfully');
}
```

Add to `package.json`:

```json
{
  "scripts": {
    "validate": "node scripts/validate-content.js"
  }
}
```

Update CI/CD workflow to run validation:

**File**: `.github/workflows/deploy.yml` (update)

```yaml
- name: Validate content
  run: npm run validate
```

### Phase 6: Deployment Status Integration

#### Step 6.1: Display Build Status in CMS

**Objective**: Show deployment status in admin interface

This requires integration with GitHub Actions API:

**File**: Update `public/admin/index.html`

Add deployment status widget:

```html
<script>
  // Fetch latest deployment status from GitHub Actions
  async function fetchDeploymentStatus() {
    try {
      const response = await fetch(
        'https://api.github.com/repos/rjicha/dgkralupy/actions/runs?per_page=1',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const data = await response.json();
      const latestRun = data.workflow_runs[0];

      return {
        status: latestRun.status,
        conclusion: latestRun.conclusion,
        url: latestRun.html_url,
        created_at: latestRun.created_at
      };
    } catch (error) {
      console.error('Failed to fetch deployment status:', error);
      return null;
    }
  }

  // Display status in UI
  window.addEventListener('DOMContentLoaded', async () => {
    const status = await fetchDeploymentStatus();

    if (status) {
      // Create status indicator
      const statusEl = document.createElement('div');
      statusEl.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 10000;
      `;

      const statusIcon = status.conclusion === 'success' ? '✅' :
                        status.status === 'in_progress' ? '⏳' : '❌';

      statusEl.innerHTML = `
        <strong>Stav buildu:</strong> ${statusIcon}
        <a href="${status.url}" target="_blank" style="margin-left: 8px;">Detail</a>
      `;

      document.body.appendChild(statusEl);
    }
  });
</script>
```

**Note**: This is a basic implementation - can be enhanced with:
- Auto-refresh every 30 seconds
- Toast notifications on deployment completion
- Detailed build logs

### Phase 7: Testing & Quality Assurance

#### Step 7.1: CMS Functionality Testing

**Manual testing checklist**:

**Authentication**:
- [ ] Can access `/admin/` route
- [ ] GitHub OAuth flow works correctly
- [ ] User is redirected to CMS after authentication
- [ ] OAuth endpoint (`https://dgkralupy-stg.radekjicha.workers.dev`) is used
- [ ] Unauthorized users cannot access admin interface

**Content Creation - Articles**:
- [ ] Can create new article
- [ ] All fields are labeled in Czech
- [ ] Title is required
- [ ] Excerpt is required
- [ ] Author is automatically set (read-only)
- [ ] Author maps to display name correctly
- [ ] Date picker uses DD.MM.YYYY format
- [ ] Markdown editor works
- [ ] Live preview renders correctly
- [ ] Can add tags
- [ ] Can upload image (enhanced-image widget)
- [ ] Image alt text is required
- [ ] Focus point can be set by clicking image
- [ ] Can mark article as featured
- [ ] Can mark article as important
- [ ] Can save as draft
- [ ] Draft articles don't appear on public site

**Content Creation - Pages**:
- [ ] Can create new page
- [ ] Section selection works
- [ ] All sections are available
- [ ] Can set page order
- [ ] Content renders correctly

**Content Editing**:
- [ ] Can edit existing articles
- [ ] Can edit existing pages
- [ ] Changes are saved correctly
- [ ] Can delete content
- [ ] Preview shows changes immediately

**Media Management**:
- [ ] Can upload images
- [ ] File type validation works (JPG, PNG, WebP)
- [ ] File size validation works (5 MB limit)
- [ ] Images are stored in `/public/images/`
- [ ] Can browse media library
- [ ] Can select existing images

**Settings**:
- [ ] Can edit contacts
- [ ] Can edit navigation structure
- [ ] Can edit author mappings
- [ ] Settings changes are saved to JSON files

**Git Integration**:
- [ ] Each save creates a git commit
- [ ] Commit messages are descriptive
- [ ] Author is set correctly in git
- [ ] Changes appear in repository

**Build & Deployment**:
- [ ] Content changes trigger CI/CD build
- [ ] Build completes successfully
- [ ] Changes appear on live site after deployment
- [ ] Build status is visible in CMS (if implemented)

#### Step 7.2: Accessibility Testing

Run accessibility audit on admin interface:

```bash
# Install axe-core if not already installed
npm install -D @axe-core/cli

# Run accessibility check on admin page
npx axe http://localhost:4321/admin/ --save admin-a11y-report.json
```

**Accessibility checklist**:
- [ ] Admin interface has proper ARIA labels
- [ ] Keyboard navigation works throughout CMS
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader can navigate CMS
- [ ] Form fields have proper labels

#### Step 7.3: Performance Testing

**Checklist**:
- [ ] Admin interface loads in < 3 seconds
- [ ] CMS JavaScript is not loaded on public pages
- [ ] `/admin/` route is excluded from sitemap
- [ ] Admin route has `noindex, nofollow` meta tags
- [ ] Bundle size is reasonable (< 500 KB for admin JS)

### Phase 8: Documentation & Training

#### Step 8.1: User Documentation

**File to create**: `docs/NAVOD_PRO_UCITELE.md` (Teacher's Guide)

**Content outline**:
1. How to access admin interface
2. How to log in (GitHub OAuth)
3. How to create an article
4. How to upload and manage images
5. How to set focus points
6. How to use markdown formatting
7. How to save drafts
8. How to publish content
9. How to edit existing content
10. Troubleshooting common issues

**Note**: Should be written in Czech with screenshots

#### Step 8.2: Technical Documentation

**File to update**: `README.md`

Add section on admin interface:

```markdown
## Admin Interface

The website uses [Decap CMS](https://decapcms.org/) for content management.

### Access

- URL: https://rjicha.github.io/dgkralupy/admin/
- Authentication: GitHub OAuth
- Permissions: Repository contributors only

### Local Development

```bash
# Run local dev server
npm run dev

# Access admin at http://localhost:4321/admin/
```

### Content Structure

- **Articles**: `/src/content/articles/` - News and announcements
- **Pages**: `/src/content/pages/` - Static pages
- **Settings**: `/src/content/settings/` - Site configuration

### Custom Widgets

- **Author Widget**: Automatically sets author based on GitHub user
- **Enhanced Image Widget**: Image upload with focus point selection

### Deployment

Content changes trigger automatic deployment via GitHub Actions.
```

## Code Review Checklist

Before merging this implementation:

**Architecture**:
- [ ] Clean separation between CMS config and public site
- [ ] No CMS code leaks into public bundle
- [ ] Proper widget encapsulation
- [ ] Follows Decap CMS best practices

**Security**:
- [ ] OAuth configuration is correct
- [ ] No hardcoded credentials
- [ ] Admin route properly restricted
- [ ] File upload validation is secure
- [ ] XSS prevention in markdown rendering

**Code Quality**:
- [ ] Widget code is well-structured
- [ ] Error handling is implemented
- [ ] Console errors are handled gracefully
- [ ] Code is commented where necessary
- [ ] Czech translations are accurate

**Testing**:
- [ ] All manual tests pass
- [ ] Content validation script works
- [ ] Build pipeline includes validation
- [ ] No console errors in production

**Documentation**:
- [ ] User guide is complete (in Czech)
- [ ] Technical documentation updated
- [ ] Code comments explain complex logic
- [ ] README includes admin section

## Testing Plan

### Unit Tests

**Widget Testing** (optional, if using build tooling):
```bash
# If widgets are built with bundler
npm run test:widgets
```

### Integration Tests

**Content Validation**:
```bash
npm run validate
```

**Build Test**:
```bash
npm run build
# Should complete without errors
```

### End-to-End Tests

**Manual E2E checklist** (see Phase 7 testing section above)

### Performance Tests

```bash
# Lighthouse audit on admin page
npx lighthouse http://localhost:4321/admin/ --only-categories=performance,accessibility --view
```

## Verification Commands

After implementation, run these commands to verify:

```bash
# 1. Verify directory structure
ls -la public/admin/
# Should show: index.html, config.yml, widgets/

ls -la public/admin/widgets/
# Should show: author.js, enhanced-image.js

# 2. Verify CMS config
cat public/admin/config.yml
# Check backend.base_url matches existing OAuth endpoint

# 3. Run content validation
npm run validate
# Should pass with 0 errors

# 4. Test build
npm run build
# Should complete successfully

# 5. Start dev server and test
npm run dev
# Visit http://localhost:4321/admin/

# 6. Check for console errors
# Open browser dev tools, should see no errors

# 7. Verify git integration
git log -1
# Should show commit from CMS after saving content

# 8. Check deployment
git push origin main
# Monitor GitHub Actions for successful deployment
```

## Rollback Plan

If critical issues arise after deployment:

### Immediate Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <previous-commit-hash>
git push origin main --force
```

### Gradual Rollback

If only specific features are broken:

1. **Disable editorial workflow** (if enabled):
   - Comment out `publish_mode: editorial_workflow` in `config.yml`

2. **Disable custom widgets**:
   - Remove widget script tags from `index.html`
   - Switch to default CMS widgets in `config.yml`

3. **Restore backup config**:
   - Keep backup of working `config.yml`
   - Can swap quickly if new config has issues

### Recovery Procedures

**OAuth Issues**:
- Verify OAuth endpoint is accessible
- Check GitHub OAuth app credentials
- Confirm CORS settings on Cloudflare Worker

**Build Failures**:
- Check GitHub Actions logs
- Run `npm run validate` locally
- Fix content validation errors
- Revert problematic content commits

**Widget Errors**:
- Check browser console for errors
- Verify widget registration happens before CMS init
- Test widgets in isolation
- Temporarily disable broken widget

## Post-Implementation Tasks

After successful deployment:

### Week 1
- [ ] Monitor for errors in CMS usage
- [ ] Collect feedback from teachers
- [ ] Fix any usability issues
- [ ] Update documentation based on feedback

### Week 2
- [ ] Train additional users (if needed)
- [ ] Document any workarounds or tips
- [ ] Optimize performance if needed
- [ ] Add any requested features to backlog

### Month 1
- [ ] Review content quality
- [ ] Check image optimization is working
- [ ] Audit git commit history (ensure good practices)
- [ ] Plan Phase 2 enhancements (if any)

### Ongoing
- [ ] Monitor Decap CMS for updates
- [ ] Keep dependencies updated
- [ ] Back up author mappings regularly
- [ ] Review and refine editorial workflow

## Success Metrics

Implementation is successful when:

1. **Functional**:
   - ✅ Teachers can create articles without developer help
   - ✅ All content changes are version-controlled
   - ✅ Images can be uploaded with focus points
   - ✅ Czech language UI is fully functional
   - ✅ Build pipeline runs automatically

2. **Quality**:
   - ✅ No console errors in production
   - ✅ Accessibility audit passes
   - ✅ Performance is acceptable (< 3s load time)
   - ✅ All tests pass

3. **Adoption**:
   - ✅ Teachers use CMS regularly (weekly)
   - ✅ Positive feedback from users
   - ✅ Reduced developer involvement in content management
   - ✅ No support tickets for basic CMS usage

## Known Limitations & Future Enhancements

### Current Limitations

1. **No real-time preview**: Preview shows markdown rendering, not exact site layout
2. **Build delay**: Changes not instant (requires build time of ~2-3 minutes)
3. **Browser-only editing**: Requires internet connection
4. **Manual crop editor**: Not implemented in Phase 1 (focus point only)
5. **Focus point cropping**: Astro's native image processing doesn't support focus point positioning (requires custom integration)

### Future Enhancement Ideas

For detailed specifications and implementation plans for future enhancements, see:
**[Future Enhancements Document](./05-cms-future-enhancements.md)**

**Quick overview**:
- Preview templates (match exact site design)
- Editor components (shortcodes for YouTube, callouts, galleries)
- Content scheduling
- Content relations (related articles, series)
- Editorial workflow with approvals
- Advanced crop editor
- Content analytics integration
- Multi-language support (i18n)

## References

- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Decap CMS Widget Development](https://decapcms.org/docs/custom-widgets/)
- [Design Document: Issue #04](./04-cms-admin-architecture-design.md)
- [OAuth Configuration Guide](https://developers.cloudflare.com/workers/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)

## Changelog

- **2025-12-22 (Update 3)**: Added Implementation Progress Tracker
  - Added phase checklist at beginning of document for tracking implementation progress
  - Provides quick overview of all 8 phases with checkboxes

- **2025-12-22 (Update 2)**: Code review improvements applied
  - **Phase 2**: Added local development backend configuration with `local_backend` option
  - **Phase 2**: Added comprehensive media library configuration
  - **Phase 3**: Enhanced collection configuration with view filters, sortable fields, and preview paths
  - **Phase 4**: Modernized widget implementations to use React/Preact instead of deprecated `createClass` API
  - **Phase 4**: Improved author widget with better error handling and modern component structure
  - **Phase 4**: Updated enhanced image widget to use ES6 class syntax with proper method binding
  - **Phase 4.3**: Fixed widget registration race conditions using dynamic import approach
  - **Phase 5.1**: Completed build pipeline integration specification with concrete Astro implementation
  - **Phase 5.1**: Added ResponsiveImage component and focus point calculation utilities
  - **Phase 5.1**: Documented Astro image integration limitations and recommended approaches
  - **Phase 5.2**: Added security validation checks (XSS prevention, path traversal, script tag detection)
  - **Phase 5.2**: Enhanced content validation with security-focused tests
  - Created separate Future Enhancements document (Issue #05)
  - Updated references to link to future enhancements document

- **2025-12-22 (Initial)**: Initial implementation plan created
  - Defined 8 implementation phases
  - Created detailed checklists and code examples
  - Documented rollback and testing procedures
  - Established success metrics

---

**Ready for Implementation**: ✅
**Estimated Effort**: 3-5 days (full implementation including testing)
**Risk Level**: Medium (managed through phased approach and rollback plan)

# Design System - Dvořákovo Gymnázium

**Version**: 1.0.0
**Last Updated**: 2025-12-02
**Based on**: Current website at www.dgkralupy.cz

---

## Colors

### Status: ✅ Extracted from site.min.css

Complete color palette extracted from the current website CSS.

#### Brand Colors

**Primary Colors:**
```css
--color-primary-dark: #273946;    /* Dark blue-gray - navbar background, primary dark */
--color-primary: #3b5f78;         /* Blue-gray - navigation section 1, carousel dots */
--color-secondary: #44c2c4;       /* Cyan/turquoise - navigation section 2 */
--color-accent-green: #bfcc34;    /* Lime green - navigation section 3 */
--color-accent-coral: #ff6b6b;    /* Coral/red - navigation section 4, important badge */
--color-accent-rose: #c44d58;     /* Rose/pink - links, highlights, quick links */
```

**Text Colors:**
```css
--color-text-primary: #000000;    /* Black - primary text */
--color-text-secondary: #3b3b3b;  /* Dark gray - secondary text */
--color-text-muted: #a09f9f;      /* Gray - metadata, dates, author info */
--color-text-white: #ffffff;      /* White - navbar text, buttons */
```

**Background Colors:**
```css
--color-bg-page: #f0f0f0;         /* Light gray - page background */
--color-bg-content: #ffffff;      /* White - content boxes, cards */
--color-bg-navbar: #273946;       /* Dark blue-gray - navbar */
```

**Border Colors:**
```css
--color-border-light: #efefef;    /* Very light gray - subtle borders */
--color-border-medium: #eee;      /* Light gray - borders */
--color-border-default: #ccc;     /* Medium gray - standard borders */
--color-border-dark: #999;        /* Darker gray - table borders */
--color-border-darker: #444;      /* Dark - table headers */
```

**Shadow Colors:**
```css
--shadow-dropdown: rgba(200, 200, 200, 0.75);  /* Dropdown menu shadow */
--overlay-carousel: rgba(59, 95, 120, 0.7);    /* Carousel text overlay */
--overlay-hover: rgba(255, 255, 255, 0.3);     /* Navigation hover border */
```

#### Navigation Section Colors

The navigation uses distinct colors for each section:
1. **O škole** (About): `#3b5f78` (blue-gray)
2. **Studium** (Studies): `#44c2c4` (cyan)
3. **Aktivity** (Activities): `#bfcc34` (lime green)
4. **Aktuálně** (News): `#ff6b6b` (coral)
5. **Pomoc jiným** (Help Others): `#273946` (dark blue-gray)

#### Quick Links Colors

Used for sidebar quick link buttons (c0-c4):
- **c0**: `#ff6b6b` (coral)
- **c1**: `#44c2c4` (cyan)
- **c2**: `#c44d58` (rose)
- **c3**: `#bfcc34` (lime green)
- **c4**: `#3b5f78` (blue-gray)

### TailwindCSS Configuration

Update `tailwind.config.mjs` with these colors:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b5f78',
          dark: '#273946',
        },
        secondary: '#44c2c4',
        accent: {
          green: '#bfcc34',
          coral: '#ff6b6b',
          rose: '#c44d58',
        },
        text: {
          primary: '#000000',
          secondary: '#3b3b3b',
          muted: '#a09f9f',
        },
        bg: {
          page: '#f0f0f0',
          content: '#ffffff',
        },
        border: {
          light: '#efefef',
          DEFAULT: '#ccc',
          dark: '#999',
        },
      },
    },
  },
}
```

---

## Typography

### Status: ✅ Extracted from site.min.css and Google Fonts

Complete typography information extracted from the current website.

#### Font Families

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700|Roboto:300,400,700&subset=latin-ext" rel="stylesheet">
```

**Primary Font (Body Text):**
- **Font Family**: "Open Sans", Arial, sans-serif
- **Weights Available**: 300 (Light), 400 (Regular), 700 (Bold)
- **Charset**: Latin Extended (includes Czech characters: ě, š, č, ř, ž, ý, á, í, é, ú, ů, ň, ť, ď)

**Secondary Font (Headings):**
- **Font Family**: "Roboto", sans-serif
- **Weights Available**: 300 (Light), 400 (Regular), 700 (Bold)
- **Usage**: All headings (h1-h6)
- **Style**: Uppercase text-transform, font-weight: 100 (thin rendering)

#### Font Sizes

**Base Size:**
```css
body {
  font-size: 0.8rem;  /* Approximately 12.8px if root is 16px */
}
```

**Headings:**
```css
h1 { font-size: 2rem; }     /* ~32px */
h2 { font-size: 1.7rem; }   /* ~27.2px */
h3 { font-size: 1.5rem; }   /* ~24px */
h4 { font-size: 1.3rem; }   /* ~20.8px */
h5, h6 { /* Not explicitly defined, inherit base */ }
```

**Component-Specific Sizes:**
```css
--navbar-link-desktop: 1.05rem;   /* ~16.8px */
--navbar-link-mobile: 0.81rem;    /* ~13px */
--navbar-brand: 1rem;             /* ~16px */
--article-info: 0.7rem;           /* ~11.2px - metadata */
--breadcrumb: 0.8rem;             /* ~12.8px */
--quick-link: 0.8rem;             /* ~12.8px */
--dropdown-menu: 0.9rem;          /* ~14.4px */
```

#### Typography Characteristics

**Headings:**
- Font-family: Roboto, sans-serif
- Font-weight: 100 (thin)
- Text-transform: uppercase
- Text-align: left

**Body Text:**
- Font-family: Open Sans, Arial, sans-serif
- Font-size: 0.8rem
- Text-align: justify (on page content)

**Special Text Styles:**
- Article metadata: 0.7rem, uppercase, color: #a09f9f
- Page footer: 0.7rem, color: #a09f9f
- Attachments: 1rem

### TailwindCSS Configuration

Update `tailwind.config.mjs` with these typography settings:

```javascript
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Open Sans"', 'Arial', 'sans-serif'],
        heading: ['"Roboto"', 'sans-serif'],
      },
      fontSize: {
        // Base sizes matching current site
        'xs': '0.7rem',      // 11.2px - metadata, footer
        'sm': '0.8rem',      // 12.8px - body, breadcrumb
        'base': '0.9rem',    // 14.4px - dropdown
        'lg': '1.05rem',     // 16.8px - navbar
        'xl': '1.3rem',      // 20.8px - h4
        '2xl': '1.5rem',     // 24px - h3
        '3xl': '1.7rem',     // 27.2px - h2
        '4xl': '2rem',       // 32px - h1
      },
      fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        bold: '700',
      },
    },
  },
}
```

#### Typography Usage Guide

**When to use each font:**
- **Open Sans**: All body text, navigation links, buttons, metadata
- **Roboto**: All headings (h1-h6), preferably with uppercase transformation

**Recommended pairings:**
```css
.heading {
  font-family: 'Roboto', sans-serif;
  font-weight: 100;
  text-transform: uppercase;
}

.body-text {
  font-family: 'Open Sans', Arial, sans-serif;
  font-weight: 400;
  font-size: 0.8rem;
}

.metadata {
  font-family: 'Open Sans', Arial, sans-serif;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #a09f9f;
}
```

---

## Spacing & Layout

### Container Widths
- **Hero Section**: Full width (100vw)
- **Content Container**: TBD (extract from current site)
- **Card Width**: Standard article cards appear to use consistent widths

### Grid System
- **Article Cards**: Multi-column responsive grid
- **Partner Logos**: Grid layout
- **Footer**: Multi-column layout

### Image Dimensions
- **Hero Images**: 800x450px
- **Article Card Images**: 400x400px (square, center-cropped)
- **Thumbnails**: Various sizes with responsive cropping

---

## Components

### Navigation

#### Primary Navigation Bar
- **Type**: Horizontal menu with dropdowns
- **Structure**: 6 main sections with nested subsections
- **Behavior**: Hover/click to reveal dropdown menus
- **Mobile**: Likely hamburger menu (to be verified)

**Sections**:
1. O škole (13 subsections)
2. Studium (11 subsections)
3. Aktivity (11 subsections)
4. Aktuálně (news listing)
5. Pomoc jiným (single page)
6. Kontakty (4 subsections)

#### Quick Links Bar
- **Position**: Below header or in footer area
- **Style**: Horizontal list
- **Links**: High-traffic pages (Suplování, Rozvrhy hodin, Přijímací řízení)

### Content Components

#### Article Card
**Structure**:
```
┌─────────────────────┐
│                     │
│   Featured Image    │
│    (400x400px)      │
│                     │
├─────────────────────┤
│ Headline (linked)   │
│ Date • Author       │
│ [Tag] [Tag] [Tag]   │
│ Excerpt text...     │
│ → Read more         │
└─────────────────────┘
```

**Elements**:
- Featured image (square, cropped)
- Clickable headline
- Publication date
- Author name
- Category tags (clickable)
- Short excerpt
- "Read more" link

#### Hero Banner
**Structure**:
```
┌────────────────────────────────┐
│                                │
│     Large Featured Image       │
│        (800x450px)             │
│                                │
│  Overlay: Article Headline     │
│  CTA Button/Link               │
└────────────────────────────────┘
```

#### Important Announcements
- Distinct visual treatment
- Prominent positioning
- Date and author metadata
- Used for time-sensitive content (e.g., open house dates)

### Media Components

#### Calendar Widget
- **Type**: Embedded Google Calendar
- **Views**: Month/week/day
- **Integration**: iframe embed
- **Link**: "celý kalendář" (full calendar) link

#### Image Carousel/Slider
- **Library**: Likely Slick carousel or similar
- **Behavior**: Auto-rotating
- **Controls**: Navigation arrows, dots (to be verified)
- **Content**: Featured articles/announcements

#### Image Gallery
- **Layout**: Responsive grid
- **Interaction**: Likely lightbox/modal on click
- **Loading**: Lazy loading implementation

### Layout Components

#### Footer
**Structure**: Multi-column layout

**Column 1 - School Contact**:
- Address: Dvořákovo nám. 800, Kralupy nad Vltavou
- Phone: 315 727 311
- Email: info@dgkralupy.cz
- ID numbers (IČO, DIČ)
- Bank account info

**Column 2 - Cafeteria Contact**:
- Phone
- Email
- Electronic submission address

**Column 3 - Social Media**:
- Facebook icon/link
- Instagram icon/link

**Column 4 - Quick Links** (if present):
- Important page links

### Interactive Components

#### Search/Filter
- **Method**: Tag-based filtering
- **URL Pattern**: `/Hledej/?tag=[tag-name]`
- **UI**: Tag buttons/links on articles

#### External Link Indicators
- Visual distinction for external links (Bakaláři, ISIC, etc.)

---

## Patterns & Best Practices

### Content Hierarchy
1. **Hero Section**: Most important/featured content
2. **Important Announcements**: Time-sensitive information
3. **Recent Articles**: Latest news in card grid
4. **Quick Links**: Frequently accessed resources

### Responsive Behavior
- **Images**: Multiple size variants with smart cropping
- **Query Parameters**: `?center=`, `?anchor=center&mode=crop&width=`
- **Navigation**: Mobile-friendly (hamburger menu assumed)
- **Grid**: Responsive column count (desktop → tablet → mobile)

### Content Formatting
- **Dates**: Czech format (DD.MM.YYYY or variations)
- **Language**: Czech (primary)
- **Author Attribution**: Display author names with articles
- **Tags**: Multiple tags per article, clickable

---

## Accessibility Requirements

### Czech Republic Public Institution Standards
- Must comply with WCAG 2.1 AA
- Zákon č. 99/2019 Sb. (Act No. 99/2019 Coll. on accessibility of websites and mobile applications)

### Implementation Checklist
- [ ] Semantic HTML structure
- [ ] Proper heading hierarchy (h1-h6)
- [ ] Text alternatives for images
- [ ] Keyboard navigation support
- [ ] Sufficient color contrast (4.5:1 for text)
- [ ] ARIA labels where needed
- [ ] Focus indicators
- [ ] Skip-to-content links
- [ ] Screen reader compatibility

---

## Asset Guidelines

### Images

#### Format Recommendations
- **Photos**: JPEG (optimized, 80-85% quality)
- **Logos/Graphics**: PNG or SVG
- **Icons**: SVG preferred

#### Size Guidelines
- **Hero Images**: 1600x900px @1x (retina: 3200x1800px @2x)
- **Article Cards**: 800x800px @1x (retina: 1600x1600px @2x)
- **Thumbnails**: 400x400px @1x (retina: 800x800px @2x)

#### Optimization
- Compress images before upload
- Use responsive images (`<picture>` or `srcset`)
- Implement lazy loading
- Consider WebP format with JPEG fallback

### Documents
- **Preferred Format**: PDF/A (archival standard)
- **Naming Convention**: descriptive-kebab-case.pdf
- **Accessibility**: PDFs should be tagged and searchable

---

## Implementation Priorities

### Phase 2 Frontend Development

#### Must Extract Before Starting:
1. **Colors**: Extract hex codes via browser dev tools
2. **Typography**: Extract font families, sizes, weights
3. **Screenshots**: Take reference screenshots of key pages

#### Can Implement Now:
1. ✅ Navigation structure (hierarchy documented)
2. ✅ URL structure (patterns documented)
3. ✅ Component structure (layouts documented)
4. ✅ Content organization (types documented)
5. ✅ Image sizes (dimensions documented)

#### Implementation Order:
1. Extract and configure colors/typography
2. Build base layout with header/footer
3. Implement navigation menu
4. Create article card component
5. Build hero section
6. Add calendar integration
7. Implement search/filtering
8. Test responsiveness
9. Accessibility audit

---

## Browser Inspection TODO

### Color Extraction Steps:
✅ **Completed** - Extracted from site.min.css:
- ✅ Header background color: #273946
- ✅ Primary text color: #000000
- ✅ Link colors: #c44d58
- ✅ Button colors: Multiple (#3b5f78, #44c2c4, #bfcc34, #ff6b6b)
- ✅ Accent colors: #c44d58, #ff6b6b, #bfcc34
- ✅ Border colors: #ccc, #999, #eee, #efefef

### Typography Extraction Steps:
✅ **Completed** - Extracted from site.min.css and Google Fonts:
- ✅ Font family: "Open Sans" (body), "Roboto" (headings)
- ✅ Font size: 0.8rem (body), 2rem-1.3rem (headings)
- ✅ Font weight: 100, 300, 400, 700
- ✅ Line height: (inherited from base)
- ✅ Letter spacing: (not explicitly defined)

### Screenshot Requirements:
⚠️ **Manual Task** - Screenshots should be taken for visual reference:
- [ ] Homepage (full page)
- [ ] Article detail page
- [ ] News listing page
- [ ] Navigation menus (expanded)
- [ ] Footer
- [ ] Mobile view (responsive)

---

## Version History

### 1.0.0 (2025-12-02)
- Initial design system documentation
- Documented component structure
- Identified missing color/typography values
- Created implementation guidelines

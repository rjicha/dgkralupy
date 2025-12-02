# Design System - Dvořákovo Gymnázium

**Version**: 1.0.0
**Last Updated**: 2025-12-02
**Based on**: Current website at www.dgkralupy.cz

---

## Colors

### Status: ⚠️ Partial - Requires Browser Inspection

The current website does not expose explicit color values in the markup. The following colors need to be extracted using browser developer tools:

#### To Extract:
- [ ] Primary brand color
- [ ] Secondary brand color
- [ ] Accent color(s)
- [ ] Text colors (primary, secondary, muted)
- [ ] Background colors
- [ ] Link colors (default, hover, visited)
- [ ] Border colors
- [ ] Success/warning/error colors (if present)

#### Provisional Color Palette (Update after extraction):
```css
/* Update these values after browser inspection */
--color-primary: #PLACEHOLDER;
--color-secondary: #PLACEHOLDER;
--color-accent: #PLACEHOLDER;
--color-text-primary: #000000; /* likely black/dark gray */
--color-text-secondary: #666666; /* likely gray */
--color-background: #FFFFFF; /* white */
--color-link: #0066CC; /* likely standard blue */
--color-link-hover: #004499; /* darker blue */
```

### TailwindCSS Configuration Template

Once colors are extracted, update `tailwind.config.mjs`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#PLACEHOLDER',
          // Add shades if needed: 50, 100, ..., 900
        },
        secondary: {
          DEFAULT: '#PLACEHOLDER',
        },
        accent: {
          DEFAULT: '#PLACEHOLDER',
        },
      },
    },
  },
}
```

---

## Typography

### Status: ⚠️ Requires Browser Inspection

#### To Extract:
- [ ] Primary font family
- [ ] Secondary font family (if any)
- [ ] Font sizes for headings (h1-h6)
- [ ] Font sizes for body text
- [ ] Font weights used
- [ ] Line heights
- [ ] Letter spacing (if any)

#### Provisional Typography Scale (Update after extraction):

```css
/* Headings */
--font-h1: PLACEHOLDER; /* size, weight, line-height */
--font-h2: PLACEHOLDER;
--font-h3: PLACEHOLDER;
--font-h4: PLACEHOLDER;
--font-h5: PLACEHOLDER;
--font-h6: PLACEHOLDER;

/* Body */
--font-body: PLACEHOLDER;
--font-body-small: PLACEHOLDER;
--font-body-large: PLACEHOLDER;
```

### TailwindCSS Configuration Template

```javascript
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['PLACEHOLDER', 'system-ui', 'sans-serif'],
        // Add other font families if needed
      },
      fontSize: {
        // Update these after extraction
      },
    },
  },
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
1. Open www.dgkralupy.cz in Chrome/Firefox
2. Open Developer Tools (F12)
3. Inspect elements to find computed styles
4. Document:
   - Header background color
   - Primary text color
   - Link colors
   - Button colors
   - Accent colors
   - Border colors

### Typography Extraction Steps:
1. Inspect heading elements (h1-h6)
2. Inspect body text
3. Document:
   - Font family
   - Font size
   - Font weight
   - Line height
   - Letter spacing (if any)

### Screenshot Requirements:
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

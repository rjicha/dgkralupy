# Phase 0: Current Website Analysis
## Dvořákovo gymnázium Kralupy nad Vltavou

**Analysis Date**: 2025-12-02
**Website**: https://www.dgkralupy.cz
**Status**: ✅ Analysis Complete

---

## 0.1 Website Structure Analysis

### Navigation Hierarchy

The website uses a hierarchical navigation structure with 6 main sections:

#### 1. **O škole** (About School)
- Popis školy (School Description) - `/o-skole/popis-skoly/`
- Základní dokumenty (Core Documents) - `/o-skole/zakladni-dokumenty/`
- Společnost pro rozvoj Dvořákova gymnázia, o. p. s. (Development Society) - `/o-skole/spolecnost-pro-rozvoj-dg-ops/`
- Školní psycholog (School Psychologist) - `/o-skole/skolni-psycholog/`
- Kariérový poradce (Career Advisor) - `/o-skole/karierovy-poradce/`
- Rada rodičů (Parents' Council) - `/o-skole/rada-rodicu/`
- Partneři (Partners) - `/o-skole/partneri/`
- Granty a dotace (Grants & Subsidies) - `/o-skole/granty-a-dotace/`
- GDPR - `/o-skole/gdpr/`
- Školská rada (School Board) - `/o-skole/skolska-rada/`
- Ochrana oznamovatelů (Whistleblower Protection) - `/o-skole/ochrana-oznamovatelu/`
- Výchovný poradce a metodik prevence (Educational Counselor) - `/o-skole/vychovny-poradce-a-metodik-prevence/`
- Informace dle zákona 106/1999 Sb. (Legal Information) - `/o-skole/informace-dle-zakona-1061999-sb/`

#### 2. **Studium** (Studies)
- Suplování (Substitutions) - `/studium/suplovani/`
- Rozvrhy hodin (Schedules) - `/studium/rozvrhy-hodin/`
- Bakaláři (Student Portal) - `/studium/bakalari/`
- ISIC (Student ID Cards) - `/studium/isic/`
- Ke stažení (Downloads) - `/studium/dokumenty-a-vzory-ke-stazeni/`
- Přijímací řízení (Admissions) - `/studium/prijimaci-rizeni/`
- Maturita (Final Exams) - `/studium/maturita/`
- Výuka (Teaching) - `/studium/vyuka/`
- Výuka angličtiny (English Teaching) - `/studium/vyuka-anglictiny/`
- Software ve výuce (Educational Software) - `/studium/software-ve-vyuce/`
- Jídelna (Cafeteria) - `/studium/jidelna/`

#### 3. **Aktivity** (Activities)
- Studentský parlament (Student Parliament) - `/aktivity/studentsky-parlament/`
- Zájmové kluby (Interest Clubs) - `/aktivity/zajmove-kluby/`
- Erasmus+ - `/aktivity/erasmus/`
- Den pro DG (Day for DG) - `/aktivity/den-pro-dg/`
- Fiktivní a reálné firmy (Fictional & Real Companies) - `/aktivity/fiktivni-a-realne-firmy/`
- Pěvecký sbor DG (Choir) - `/aktivity/pevecky-sbor-dg/`
- Nota D - `/aktivity/nota-d/`
- Knihovna (Library) - `/aktivity/knihovna/`
- Úspěchy studentů (Student Achievements) - `/aktivity/uspechy-studentu/`
- DofE (Duke of Edinburgh Award) - `/aktivity/dofe/`
- Studentský časopis (Student Magazine) - `/aktivity/studentsky-casopis/`

#### 4. **Aktuálně** (News/Current)
- Main news listing page - `/aktualne/`
- Individual articles with URL structure: `/aktualne/[article-slug]/`
- Tag-based filtering: `/Hledej/?tag=[tag-name]`

#### 5. **Pomoc jiným** (Help Others)
- Social responsibility initiatives

#### 6. **Kontakty** (Contacts)
- Škola (School) - `/kontakty/skola/`
- Učitelé (Teachers) - `/kontakty/ucitele/`
- Předmětové komise (Subject Commissions) - `/kontakty/predmetove-komise/`
- Školní poradci (School Counselors) - `/kontakty/skolni-poradci/`

### URL Structure Pattern

The site follows a clear hierarchical URL pattern:
```
/[section]/[subsection]/
/aktualne/[article-slug]/
/Hledej/?tag=[tag-name]
```

### Key User Flows

1. **Prospective Students/Parents**: Home → Admissions → Open House Events
2. **Current Students**: Quick Links → Substitutions/Schedules → Student Portal (Bakaláři)
3. **News Readers**: Home → Featured Articles → News Archive
4. **Information Seekers**: Navigation Menu → Specific Section → Content

---

## 0.2 Visual Design Analysis

### Color Palette

⚠️ **Note**: The website does not expose explicit hex color codes in the markup. Visual inspection suggests:

- **Background**: White/light neutral tones
- **Primary Text**: Dark gray/black (#000000 or similar)
- **Links**: Blue (likely #0066cc or similar standard link blue)
- **Accent Colors**: To be determined through browser inspection or design files

**Action Required**: Need to use browser developer tools to extract exact color values or request design assets.

### Typography

- **Primary Font**: System default or web-safe fonts (specific font family not exposed in markup)
- **Font Sizes**: Various sizes for hierarchy (exact values need browser inspection)
- **Font Weights**: Multiple weights used for emphasis

**Action Required**: Need browser inspection to extract exact typography specifications.

### Layout Patterns

1. **Navigation**: Horizontal menu bar with dropdown submenus
2. **Content Grid**: Card-based layout for articles
3. **Hero Section**: Large banner with featured content (800x450px images)
4. **Content Cards**: Standard size 400x400px with responsive cropping
5. **Footer**: Multi-column layout with contact info and quick links

### Spacing & Structure

- Clear hierarchical organization
- Card-based content presentation
- Responsive image handling with multiple crop modes
- Distinct content blocks with visual separation

### Design Components Identified

1. **Navigation Bar**: Horizontal with dropdowns
2. **Hero Banner**: Full-width featured article section
3. **Article Cards**: Image + headline + metadata + excerpt
4. **Quick Links Bar**: Horizontal list of frequently accessed pages
5. **Calendar Widget**: Embedded Google Calendar
6. **Social Media Links**: Icon-based links (Facebook, Instagram)
7. **Partner Logos Grid**: Multi-column grid layout
8. **Footer**: Multi-column with comprehensive contact info

---

## 0.3 Content Audit

### Content Types

#### 1. **News/Articles** (Primary Dynamic Content)
- Publication date
- Author attribution
- Category tags (clickable)
- Featured image (400x400px)
- Article headline
- Content preview/excerpt
- Full article content
- "Read more" links

**Example Articles**:
- "Den otevřených dveří - středa 3. prosince 2025 od 14:30 do 17:00" (Published: 30.11.2025)
- "Adventní běhání" (Advent running fundraiser)
- "Vánoční koncert" (Christmas concert - December 18, 2025)
- Halloween celebration documentation
- Library reconstruction progress
- Erasmus study trips to Germany and Spain

#### 2. **Static Pages** (Institutional Information)
- School description and history
- Academic programs
- Staff listings
- Governance documents
- Legal compliance pages (GDPR, whistleblower protection)
- Partnership information

#### 3. **Documents & Downloads**
- Academic forms and templates
- Schedules and timetables
- Policy documents
- Educational materials

#### 4. **Embedded Media**
- **Google Calendar**: Embedded calendar showing school events
- **Image Galleries**: Photo collections for events
- **Social Media Feeds**: Links to Facebook and Instagram

#### 5. **External Integrations**
- **Bakaláři**: Student information system (external link)
- **ISIC**: Student ID card system (external link)
- **Meal Planning**: Cafeteria menu system

### Content Organization

- **Primary**: News/announcements on homepage
- **Secondary**: Static institutional information in navigation structure
- **Tertiary**: Quick access links for frequently used resources

### Dynamic Functionality

1. **Search/Filtering**: Tag-based article search
2. **Image Carousel**: Auto-rotating featured content slider
3. **Calendar Integration**: Real-time event display
4. **Responsive Images**: Multiple size variants with smart cropping

### Media Assets

- **Image Formats**: JPEG/PNG web-optimized images
- **Image Sizes**:
  - Hero: 800x450px
  - Cards: 400x400px
  - Responsive variants with query parameters
- **Documents**: PDFs (assumed for downloads section)
- **Logos**: Partner organization logos

---

## 0.4 Design System Documentation

### Component Library

#### 1. **Navigation Components**

##### Primary Navigation
- Horizontal menu bar
- Dropdown submenus for hierarchical content
- Mobile-responsive (hamburger menu assumed)

##### Quick Links
- Horizontal list of high-traffic pages
- Positioned prominently (likely below header)
- Links: Suplování, Rozvrhy hodin, Přijímací řízení, etc.

#### 2. **Content Components**

##### Hero Banner
- Full-width section
- Large featured image (800x450px)
- Article headline overlay
- Call-to-action link

##### Article Card
- Featured image (400x400px, center-cropped)
- Headline (linked)
- Publication date
- Author name
- Category tags (clickable)
- Excerpt text
- "Read more" link

##### Important Announcements Section
- Distinct styling for urgent content
- Date and author details
- Prominent positioning

#### 3. **Layout Components**

##### Grid System
- Multi-column card layout
- Responsive breakpoints
- Equal-height cards

##### Footer
- Multi-column layout
- Contact information block
  - Address: Dvořákovo nám. 800, Kralupy nad Vltavou
  - Phone: 315 727 311
  - Email: info@dgkralupy.cz
  - Bank details and ID numbers
- Social media icons
- Cafeteria contact info

#### 4. **Media Components**

##### Image Gallery
- Responsive grid
- Lightbox/modal view (assumed)
- Lazy loading

##### Calendar Widget
- Embedded Google Calendar
- Month/week/day views
- Event details on click

##### Carousel/Slider
- Auto-rotating featured content
- Navigation controls
- Smooth transitions

#### 5. **Interactive Components**

##### Search/Filter
- Tag-based filtering system
- URL-based search queries
- Results listing

##### External Links
- Consistent styling for external resources
- Icon indicators (assumed)

### Accessibility Features Present

- Hierarchical heading structure
- Text alternatives (to be verified)
- Keyboard navigation (to be tested)
- Semantic HTML structure

**Further Testing Required**: Screen reader compatibility, color contrast ratios, ARIA labels

---

## Key Findings & Recommendations

### Strengths of Current Design

1. ✅ Clear hierarchical navigation structure
2. ✅ Consistent URL patterns
3. ✅ Card-based content presentation
4. ✅ Integration with external systems (calendar, student portal)
5. ✅ Mobile-responsive image handling
6. ✅ Tag-based content organization

### Areas Requiring Further Investigation

1. ⚠️ **Color Palette**: Need exact hex codes via browser inspection
2. ⚠️ **Typography**: Need font family names, sizes, and weights
3. ⚠️ **Accessibility**: Requires comprehensive WCAG audit
4. ⚠️ **Performance**: Need Lighthouse audit results
5. ⚠️ **Content Volume**: Unknown total number of articles/pages

### Migration Considerations

#### URL Structure
- Current structure is clean and SEO-friendly
- Recommend maintaining same URL patterns for:
  - Static pages: `/[section]/[subsection]/`
  - Articles: `/aktualne/[slug]/`
  - Tags: `/Hledej/?tag=[name]`

#### Content Priority for Migration
1. **High Priority**:
   - Current news/articles (especially upcoming events)
   - Admissions information
   - Contact information
   - Quick access resources (schedules, substitutions)

2. **Medium Priority**:
   - Static institutional pages
   - Student activities information
   - Historical articles

3. **Low Priority**:
   - Archived news (older than 1 year)
   - Legacy documents

#### Technical Features to Replicate
1. ✅ Article card layout with images
2. ✅ Tag-based filtering
3. ✅ Calendar integration (Google Calendar or similar)
4. ✅ Social media links
5. ✅ Responsive image optimization
6. ✅ Search functionality
7. ⚠️ External system integrations (Bakaláři, meal system) - links only

---

## Next Steps for Phase 0 Completion

1. ✅ Website structure analysis - **COMPLETE**
2. ⚠️ **Extract exact color values** - Requires browser developer tools
3. ⚠️ **Document precise typography** - Requires browser inspection
4. ⚠️ **Take reference screenshots** - Recommended for design reference
5. ⚠️ **Create Tailwind config** - Based on extracted design tokens
6. ⏭️ Proceed to Phase 1 implementation with current findings

---

## Appendix: Technical Details

### Image Processing
- Query parameter-based cropping: `?center=` and `?anchor=center&mode=crop&width=`
- Multiple size variants served
- Lazy loading implementation likely

### External Dependencies
- Google Calendar embed
- Slick carousel library (or similar)
- Social media integration (Facebook, Instagram)

### URL Patterns for Redirects
```
/ → / (homepage)
/o-skole/* → /o-skole/* (maintain structure)
/studium/* → /studium/* (maintain structure)
/aktivity/* → /aktivity/* (maintain structure)
/aktualne/* → /aktualne/* (maintain structure)
/kontakty/* → /kontakty/* (maintain structure)
/Hledej/?tag=* → /tags/* (or maintain as-is)
```

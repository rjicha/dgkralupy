# UX Designer (Visual Design & User Experience)

> **Part of**: [Complete Personas Documentation](../PERSONAS.md)

## Role Overview
Ensures visual consistency, design system compliance, and excellent user experience across all pages and components.

## Core Responsibilities
- Validate design system compliance
- Check visual consistency across pages
- Verify accessibility standards (WCAG 2.1 AA basics)
- Review responsive design implementation
- Ensure proper interactive states (hover, focus, active)
- Validate user flows and navigation
- Approve visual implementation

## Design System Reference

### Brand Colors

**Primary Colors**:
```css
Primary (Blue-gray):    #3b5f78  /* Main brand color */
Primary Dark:           #273946  /* Navbar background */
Secondary (Cyan):       #44c2c4  /* Accent color */
Accent Green:           #bfcc34  /* Lime green */
Accent Coral:           #ff6b6b  /* Red/coral */
Accent Rose:            #c44d58  /* Links, highlights */
```

**Section Colors** (Navigation):
1. **O škole** (About): `#3b5f78` (blue-gray)
2. **Studium** (Studies): `#44c2c4` (cyan)
3. **Aktivity** (Activities): `#bfcc34` (lime green)
4. **Aktuálně** (News): `#ff6b6b` (coral)

**Text Colors**:
```css
Primary Text:     #000000  /* Black - main content */
Secondary Text:   #3b3b3b  /* Dark gray - body text */
Muted Text:       #a09f9f  /* Gray - metadata, dates */
White Text:       #ffffff  /* Navbar, buttons */
```

**Background Colors**:
```css
Page Background:    #f0f0f0  /* Light gray */
Content Boxes:      #ffffff  /* White */
Navbar:             #273946  /* Dark blue-gray */
```

**Border Colors**:
```css
Light:    #efefef  /* Very subtle borders */
Default:  #cccccc  /* Standard borders */
Dark:     #999999  /* Emphasis borders */
```

### Typography

**Font Families**:
- **Headings**: Roboto, sans-serif
  - Font-weight: 100 (thin)
  - Text-transform: uppercase
  - Used for all h1-h6

- **Body Text**: Open Sans, Arial, sans-serif
  - Font-weight: 400 (regular), 700 (bold)
  - Used for all body content, navigation, buttons

**Font Sizes** (Improved for readability):
```css
xs:    12px   /* Metadata, footer */
sm:    14px   /* Small text, breadcrumb */
base:  16px   /* Body text (web standard) */
lg:    18px   /* Large body text */
xl:    20px   /* H4 */
2xl:   24px   /* H3 */
3xl:   30px   /* H2 */
4xl:   36px   /* H1 */
5xl:   48px   /* Hero titles */
```

**Metadata Styling**:
```css
Font-size: 12px (0.75rem)
Text-transform: uppercase
Color: #a09f9f
```

### Spacing & Layout

**Container Widths**:
- Content container: Responsive with max-width
- Full-width: Hero sections, navigation

**Grid Patterns**:
- Article cards: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Responsive grid using TailwindCSS: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

**Image Dimensions**:
- Hero images: 1600×900px (16:9 ratio)
- Article cards: 800×800px (square, center-cropped)
- Thumbnails: Responsive sizing

### Responsive Breakpoints

```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

**Mobile-First Approach**: Design for mobile first, then enhance for larger screens.

## Interactive States

### Links
```css
Default:  text-accent-rose (#c44d58)
Hover:    text-accent-coral (#ff6b6b), underline
Focus:    Visible outline (accessibility)
Active:   Slightly darker color
```

### Buttons
```css
Default:  Solid color with padding
Hover:    Slightly darker background, shadow
Focus:    Visible outline ring
Active:   Pressed appearance
Disabled: Reduced opacity, no hover
```

### Navigation
```css
Default:  Normal state
Hover:    Background change, smooth transition
Active:   Highlighted with border or background
Focus:    Keyboard focus indicator
```

### Form Elements
```css
Default:  Clear border, proper padding
Focus:    Border color change, outline ring
Error:    Red border, error message
Success:  Green border/indicator
Disabled: Grayed out, cursor: not-allowed
```

## When Acting as UX Designer

```
I will:
- Review the implementation against the design system
- Check all visual elements for consistency
- Verify accessibility basics (colors, contrast, semantics)
- Test responsive behavior across breakpoints
- Validate interactive states (hover, focus, active, disabled)
- Ensure typography follows Roboto (headings) + Open Sans (body)
- Check that colors match the brand palette
- Validate user flows are intuitive
- Provide specific visual feedback with references
```

## Design Review Checklist

### Visual Consistency
- [ ] Colors match design system (no random hex codes)
- [ ] Typography uses Roboto for headings (uppercase, thin)
- [ ] Typography uses Open Sans for body text
- [ ] Font sizes follow the scale (xs through 5xl)
- [ ] Spacing is consistent with TailwindCSS scale
- [ ] Similar components look similar
- [ ] Visual hierarchy is clear

### Design System Compliance
- [ ] Uses TailwindCSS utility classes from config
- [ ] No inline styles (unless absolutely necessary)
- [ ] Brand colors used appropriately
- [ ] Section colors match navigation scheme
- [ ] Backgrounds use bg-page (#f0f0f0) and bg-content (#ffffff)
- [ ] Borders use defined border colors

### Responsive Design
- [ ] Mobile (< 640px): Single column, readable text, proper spacing
- [ ] Tablet (768px-1024px): Multi-column where appropriate
- [ ] Desktop (> 1024px): Full layout, optimal use of space
- [ ] No horizontal scrolling on any breakpoint
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] Images scale properly across devices

### Interactive States
- [ ] Links have hover state (color change, underline)
- [ ] Buttons have hover, focus, active states
- [ ] Navigation shows current page clearly
- [ ] Focus indicators visible for keyboard navigation
- [ ] Disabled states are visually distinct
- [ ] Transitions are smooth (200-300ms)

### User Experience
- [ ] Navigation is intuitive
- [ ] Call-to-action buttons are prominent
- [ ] Important content is above the fold
- [ ] Visual hierarchy guides the eye
- [ ] Clickable elements look clickable
- [ ] Loading states handled gracefully
- [ ] Error messages are user-friendly and visible

### Accessibility Basics
- [ ] Sufficient color contrast (4.5:1 for text)
- [ ] Text is readable (not too small)
- [ ] Heading hierarchy is logical
- [ ] Images have alt text
- [ ] Focus indicators are visible
- [ ] Interactive elements are keyboard accessible

## Common Design Issues

### Color Violations
```astro
<!-- ❌ Bad: Random hex color -->
<div class="text-[#FF5733]">Text</div>

<!-- ✅ Good: Design system color -->
<div class="text-accent-coral">Text</div>
```

### Typography Issues
```astro
<!-- ❌ Bad: Wrong font, wrong transform -->
<h2 class="font-sans">Heading</h2>

<!-- ✅ Good: Roboto, uppercase, thin -->
<h2 class="font-heading text-3xl uppercase font-thin">Heading</h2>
```

### Responsive Issues
```astro
<!-- ❌ Bad: Desktop-only grid -->
<div class="grid-cols-3">

<!-- ✅ Good: Mobile-first responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Missing Interactive States
```astro
<!-- ❌ Bad: No hover state -->
<button class="bg-primary text-white px-4 py-2">Click</button>

<!-- ✅ Good: Hover and focus states -->
<button class="bg-primary hover:bg-primary-dark focus:ring-2 focus:ring-primary text-white px-4 py-2 transition-colors">
  Click
</button>
```

## Review Feedback Template

```markdown
## Design Review Feedback

### 🎨 Visual Consistency
**Colors**: [Pass/Issues]
- [Comments on color usage]

**Typography**: [Pass/Issues]
- [Comments on fonts, sizes, hierarchy]

**Spacing**: [Pass/Issues]
- [Comments on padding, margins, gaps]

### 📱 Responsive Design
**Mobile (< 640px)**: [Pass/Issues]
- [Specific feedback]

**Tablet (768px-1024px)**: [Pass/Issues]
- [Specific feedback]

**Desktop (> 1024px)**: [Pass/Issues]
- [Specific feedback]

### 🖱️ Interactive States
**Links**: [Pass/Issues]
- Hover: [Feedback]
- Focus: [Feedback]

**Buttons**: [Pass/Issues]
- Hover: [Feedback]
- Focus: [Feedback]
- Active: [Feedback]

**Navigation**: [Pass/Issues]
- Current page indication: [Feedback]
- Hover states: [Feedback]

### ♿ Accessibility (Basic Check)
**Color Contrast**: [Pass/Issues]
- [List any contrast issues]

**Heading Hierarchy**: [Pass/Issues]
- [Comments on h1-h6 structure]

**Focus Indicators**: [Pass/Issues]
- [Comments on keyboard navigation visibility]

### 👤 User Experience
**Navigation**: [Intuitive/Confusing]
- [Feedback]

**Visual Hierarchy**: [Clear/Unclear]
- [Feedback]

**Call-to-Actions**: [Prominent/Weak]
- [Feedback]

### Approval Status
- [ ] ✅ Approved - Meets design standards
- [x] 🔄 Changes Requested - See issues above
- [ ] ❌ Rejected - Fundamental design problems

### Recommended Changes
1. [Priority change 1]
2. [Priority change 2]

### Optional Enhancements
- [Nice-to-have improvements]
```

## Example Reviews

### Example 1: Approved with Minor Notes

```markdown
## Design Review Feedback

### 🎨 Visual Consistency
**Colors**: ✅ Pass
- Excellent use of design system colors
- Section colors properly applied

**Typography**: ✅ Pass
- Roboto headings with proper uppercase styling
- Open Sans body text is readable

**Spacing**: ✅ Pass
- Consistent use of TailwindCSS spacing scale

### 📱 Responsive Design
**Mobile**: ✅ Pass - Clean single-column layout
**Tablet**: ✅ Pass - Good use of 2-column grid
**Desktop**: ✅ Pass - Optimal 3-column layout

### 🖱️ Interactive States
**Links**: ✅ Pass - Hover and focus states present
**Buttons**: ✅ Pass - All states implemented well

### Approval Status
- [x] ✅ Approved - Meets design standards

Great work! The implementation follows the design system perfectly.
```

### Example 2: Changes Requested

```markdown
## Design Review Feedback

### 🎨 Visual Consistency
**Colors**: ⚠️ Issues Found
- src/components/Hero.astro:12 - Using `#FF0000` instead of `accent-coral`
- Background should use `bg-page` not custom gray

**Typography**: ⚠️ Issues Found
- Heading on line 23 not using Roboto font
- Missing uppercase transform on h2 elements

### 📱 Responsive Design
**Mobile**: ⚠️ Issues
- Text size too small (11px, should be minimum 14px)
- Touch targets smaller than 44px on buttons

**Tablet**: ✅ Pass
**Desktop**: ✅ Pass

### 🖱️ Interactive States
**Buttons**: ❌ Missing
- No hover state defined
- Focus ring not visible
- Needs: `hover:bg-primary-dark focus:ring-2 focus:ring-primary`

### Approval Status
- [x] 🔄 Changes Requested

### Recommended Changes
1. Replace custom colors with design system colors
2. Fix heading typography (Roboto, uppercase, thin)
3. Increase mobile text size to at least 14px
4. Add button interactive states

### Next Steps
Please address the color and typography issues. Once fixed, I'll review again before passing to accessibility specialist.
```

## Resources

### Project Documentation
- [Complete Personas](../PERSONAS.md)
- [Design System](../DESIGN_SYSTEM.md)
- [Workflow](../WORKFLOW.md)

### Design Resources
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Google Fonts](https://fonts.google.com/) - Roboto & Open Sans
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Previous Step**: Code reviewed by [Staff Engineer](./staff-engineer.md)
**Next Step**: After approval, proceeds to [Accessibility Specialist](./accessibility.md) for WCAG audit

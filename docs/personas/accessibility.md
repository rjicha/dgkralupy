# Accessibility Specialist (WCAG & Compliance)

> **Part of**: [Complete Personas Documentation](../PERSONAS.md)

## Role Overview
Dedicated focus on accessibility compliance, ensuring the website meets Czech legal requirements and WCAG 2.1 AA standards.

## Core Responsibilities
- Audit accessibility compliance
- Verify WCAG 2.1 Level AA conformance
- Ensure Czech Law No. 99/2019 compliance
- Review semantic HTML structure
- Test keyboard navigation
- Validate screen reader compatibility
- Check color contrast ratios
- Review ARIA implementations

## Legal Requirements

### Czech Republic - Act No. 99/2019 Coll.
**Law on accessibility of websites and mobile applications**:
- Public institution websites **must be accessible**
- Must comply with **WCAG 2.1 Level AA**
- Accessibility statement **required**
- Regular audits and updates mandatory

**Applies to**: Public schools, government institutions, publicly funded organizations

## WCAG 2.1 AA Principles

### 1. Perceivable
Information and UI components must be presentable to users in ways they can perceive.

**Requirements**:
- **Text Alternatives**: All non-text content has text alternative (alt text)
- **Time-based Media**: Captions for audio, descriptions for video
- **Adaptable**: Content can be presented in different ways without losing information
- **Distinguishable**:
  - Color contrast ratio ≥ 4.5:1 for normal text
  - Color contrast ratio ≥ 3:1 for large text (18pt+ or 14pt+ bold)
  - Text can be resized up to 200% without loss of functionality
  - Images of text avoided (use actual text instead)

### 2. Operable
UI components and navigation must be operable.

**Requirements**:
- **Keyboard Accessible**: All functionality available via keyboard
- **Enough Time**: Users have adequate time to read and use content
- **Seizures**: No content flashing more than 3 times per second
- **Navigable**:
  - Skip-to-content links
  - Descriptive page titles
  - Logical focus order
  - Link purpose clear from link text
  - Multiple ways to find pages (nav, search, sitemap)

### 3. Understandable
Information and UI operation must be understandable.

**Requirements**:
- **Readable**:
  - Page language declared (`<html lang="cs">`)
  - Unusual words or jargon explained
- **Predictable**:
  - Consistent navigation across pages
  - Consistent component identification
  - No unexpected context changes
- **Input Assistance**:
  - Clear error identification
  - Labels or instructions for inputs
  - Error suggestions provided
  - Error prevention for critical actions

### 4. Robust
Content must be robust enough for assistive technologies.

**Requirements**:
- **Compatible**: Works with current and future assistive technologies
- Valid HTML markup
- Proper ARIA usage
- Name, role, value available for custom UI components

## When Acting as Accessibility Specialist

```
I will:
- Audit the implementation against WCAG 2.1 AA criteria
- Test keyboard navigation thoroughly (Tab, Shift+Tab, Enter, Space, Arrow keys)
- Verify semantic HTML structure (proper landmarks, headings)
- Check color contrast ratios using tools
- Review ARIA labels and landmarks
- Simulate screen reader experience
- Validate heading hierarchy (no skipped levels)
- Ensure form accessibility (labels, error messages, validation)
- Provide specific remediation steps for any issues
- Prioritize issues by severity (critical WCAG failures vs best practices)
```

## Accessibility Audit Checklist

### Document Structure
- [ ] Proper DOCTYPE declared
- [ ] Language attribute set (`<html lang="cs">` for Czech)
- [ ] Page has unique, descriptive `<title>`
- [ ] Proper `<meta>` tags including viewport

### Semantic HTML
- [ ] HTML5 semantic elements used (`<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`)
- [ ] Landmark regions properly defined
- [ ] No layout tables (use CSS for layout)
- [ ] Lists use `<ul>`, `<ol>`, `<li>` appropriately

### Heading Hierarchy
- [ ] Single `<h1>` per page (page title)
- [ ] Heading levels not skipped (h1→h2→h3, not h1→h3)
- [ ] Headings describe content sections
- [ ] Heading hierarchy is logical and meaningful

### Images & Media
- [ ] All `<img>` elements have `alt` attribute
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Complex images (charts, diagrams) have detailed descriptions
- [ ] Background images don't convey important information
- [ ] Videos have captions (if applicable)
- [ ] Audio content has transcripts (if applicable)

### Links & Navigation
- [ ] Link text is descriptive (not "click here" or "read more")
- [ ] Links to external sites indicated
- [ ] Skip-to-main-content link present (or ARIA landmark navigation)
- [ ] Current page indicated in navigation
- [ ] Navigation is consistent across pages
- [ ] Breadcrumb navigation present (where appropriate)

### Forms
- [ ] All `<input>` elements have associated `<label>`
- [ ] Labels use `for` attribute or wrap input
- [ ] Required fields marked with `required` attribute
- [ ] Error messages are clear and specific
- [ ] Error messages associated with inputs (ARIA)
- [ ] Form validation is accessible
- [ ] Placeholder text not used as labels

### Color & Contrast
- [ ] Text contrast ≥ 4.5:1 (normal text)
- [ ] Text contrast ≥ 3:1 (large text: ≥18pt or ≥14pt bold)
- [ ] Interactive element contrast ≥ 3:1
- [ ] Information not conveyed by color alone
- [ ] Focus indicators have ≥ 3:1 contrast against background

### Keyboard Navigation
- [ ] All interactive elements keyboard accessible (links, buttons, forms)
- [ ] Logical tab order (left to right, top to bottom)
- [ ] Focus indicators visible on all interactive elements
- [ ] No keyboard traps (can tab in and out)
- [ ] Dropdown/menu navigation works with keyboard
- [ ] Modal dialogs trap focus appropriately
- [ ] Skip links or landmark navigation available

### ARIA (when needed)
- [ ] ARIA used to enhance, not replace, semantic HTML
- [ ] ARIA roles appropriate and necessary
- [ ] ARIA labels descriptive and accurate
- [ ] ARIA live regions used for dynamic content
- [ ] ARIA states reflect actual component state

### Content
- [ ] Page titles unique and descriptive
- [ ] Text can be resized to 200% without horizontal scrolling
- [ ] No content flashes more than 3 times per second
- [ ] Reading order is logical
- [ ] Instructions don't rely solely on sensory characteristics

## Color Contrast Testing

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio Calculator](https://contrast-ratio.com/)
- Browser DevTools (Chrome/Firefox)

### Project Color Compliance

**Text on White Background** (`#ffffff`):
```
✅ Primary Text (#000000):     21:1 - Excellent
✅ Secondary Text (#3b3b3b):   11.5:1 - Pass AA
✅ Primary Dark (#273946):     13.3:1 - Pass AA
✅ Primary (#3b5f78):          6.4:1 - Pass AA
✅ Accent Rose (#c44d58):      4.6:1 - Pass AA
❌ Muted Text (#a09f9f):       2.8:1 - FAIL (use for non-essential only)
```

**Text on Page Background** (`#f0f0f0`):
```
✅ Primary Text (#000000):     19.1:1 - Excellent
✅ Secondary Text (#3b3b3b):   10.5:1 - Pass AA
✅ Primary (#3b5f78):          5.8:1 - Pass AA
```

**Reversed (White Text on Dark)**:
```
✅ White on Primary Dark (#273946): 13.3:1 - Pass AA
✅ White on Primary (#3b5f78):      6.4:1 - Pass AA
```

## Keyboard Navigation Testing

### Keys to Test
- **Tab**: Move forward through interactive elements
- **Shift + Tab**: Move backward through interactive elements
- **Enter**: Activate links and buttons
- **Space**: Activate buttons, toggle checkboxes
- **Arrow Keys**: Navigate within menus, radio groups, tabs
- **Esc**: Close modals, menus

### Test Checklist
- [ ] Tab order is logical (visual order matches tab order)
- [ ] All interactive elements reachable via keyboard
- [ ] Focus indicator clearly visible
- [ ] No keyboard traps
- [ ] Dropdowns navigable with arrows
- [ ] Forms can be completed with keyboard alone
- [ ] Modals trap focus, Esc closes modal

## Common Accessibility Issues

### Missing Alt Text
```astro
<!-- ❌ Bad: Missing alt attribute -->
<img src="/images/school.jpg">

<!-- ✅ Good: Descriptive alt text -->
<img src="/images/school.jpg" alt="Dvořákovo Gymnázium building entrance">

<!-- ✅ Good: Decorative image -->
<img src="/images/decoration.svg" alt="">
```

### Poor Link Text
```astro
<!-- ❌ Bad: Non-descriptive -->
<a href="/prijimaci">Klikněte zde</a>

<!-- ✅ Good: Descriptive -->
<a href="/prijimaci">Přijímací řízení 2025/2026</a>
```

### Missing Form Labels
```astro
<!-- ❌ Bad: No label -->
<input type="email" placeholder="Email">

<!-- ✅ Good: Proper label -->
<label for="email">Email:</label>
<input type="email" id="email" name="email">
```

### Skipped Heading Levels
```astro
<!-- ❌ Bad: Skips from h1 to h3 -->
<h1>Page Title</h1>
<h3>Subsection</h3>

<!-- ✅ Good: Logical hierarchy -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

### Low Contrast
```astro
<!-- ❌ Bad: Insufficient contrast -->
<p class="text-text-muted">Important information</p>  <!-- 2.8:1 -->

<!-- ✅ Good: Sufficient contrast -->
<p class="text-text-secondary">Important information</p>  <!-- 11.5:1 -->
```

### No Focus Indicator
```css
/* ❌ Bad: Removes focus outline */
button:focus {
  outline: none;
}

/* ✅ Good: Visible focus indicator */
button:focus {
  outline: 2px solid #3b5f78;
  outline-offset: 2px;
}
/* Or use Tailwind: focus:ring-2 focus:ring-primary */
```

## ARIA Best Practices

### When to Use ARIA
- **Use semantic HTML first**: `<button>` is better than `<div role="button">`
- **ARIA enhances**: Use ARIA to add information, not replace semantics
- **Common uses**:
  - `aria-label` for icon buttons
  - `aria-labelledby` for complex labels
  - `aria-describedby` for help text
  - `aria-live` for dynamic updates

### Common ARIA Patterns

**Icon Button**:
```astro
<!-- Screen reader reads "Close" -->
<button aria-label="Zavřít">
  <svg><!-- Close icon --></svg>
</button>
```

**Dropdown Menu**:
```astro
<button aria-expanded="false" aria-controls="menu-id">
  Menu
</button>
<ul id="menu-id" hidden>
  <li><a href="/page">Link</a></li>
</ul>
```

**Current Page**:
```astro
<nav aria-label="Hlavní navigace">
  <a href="/home">Domů</a>
  <a href="/about" aria-current="page">O škole</a>
</nav>
```

**Form Error**:
```astro
<label for="email">Email:</label>
<input
  type="email"
  id="email"
  aria-describedby="email-error"
  aria-invalid="true"
>
<span id="email-error" role="alert">
  Zadejte platnou emailovou adresu
</span>
```

## Audit Report Template

```markdown
## Accessibility Audit Report

### Compliance Status
- WCAG 2.1 Level: [AA Target]
- Overall Status: [Pass/Fail/Partial]
- Critical Issues: [Number]
- Warnings: [Number]

---

### ✅ Compliant Areas
- [List areas that meet WCAG 2.1 AA]
- [Note strong accessibility features]

---

### ❌ Critical Issues (WCAG AA Failures)

#### Issue 1: [Title]
- **WCAG Criterion**: [e.g., 1.4.3 Contrast (Minimum)]
- **Level**: AA
- **Location**: [src/components/Header.astro:45]
- **Problem**: [Specific description]
- **Impact**: [Users affected and how]
- **Remediation**:
  ```astro
  <!-- Current (fails) -->
  <p class="text-text-muted">Text</p>

  <!-- Fixed (passes) -->
  <p class="text-text-secondary">Text</p>
  ```

#### Issue 2: [Title]
[Same structure...]

---

### ⚠️ Warnings (Best Practices)

#### Warning 1: [Title]
- **Location**: [File:line]
- **Issue**: [Description]
- **Recommendation**: [How to improve]

---

### Testing Summary

**Keyboard Navigation**: [✅ Pass / ❌ Fail]
- Tab order: [Comments]
- Focus indicators: [Comments]
- No keyboard traps: [Comments]

**Screen Reader** (Simulated): [✅ Pass / ❌ Fail]
- Landmarks: [Comments]
- Headings: [Comments]
- Alt text: [Comments]

**Color Contrast**: [✅ Pass / ❌ Fail]
- Text contrast: [Comments]
- Interactive elements: [Comments]

**Semantic HTML**: [✅ Pass / ❌ Fail]
- Structure: [Comments]
- Headings: [Comments]
- ARIA usage: [Comments]

---

### Approval Status
- [ ] ✅ Fully Compliant - WCAG 2.1 AA met, Czech Law No. 99/2019 compliant
- [x] ⚠️ Issues Found - Address critical items before approval
- [ ] ❌ Major Non-Compliance - Significant accessibility barriers

---

### Next Steps
1. [Priority action 1]
2. [Priority action 2]
3. [Priority action 3]

### Resources for Fixes
- [Link to relevant WCAG techniques]
- [Link to code examples]
```

## Testing Tools

### Browser Extensions
- **axe DevTools** (Chrome/Firefox) - Automated testing
- **WAVE** (Chrome/Firefox) - Visual accessibility evaluation
- **Lighthouse** (Chrome DevTools) - Accessibility score

### Manual Testing
- **Keyboard Navigation**: Tab through entire page
- **Color Contrast**: Use WebAIM Contrast Checker
- **Screen Reader**: NVDA (Windows), JAWS (Windows), VoiceOver (Mac)

### Validation
- **W3C HTML Validator**: https://validator.w3.org/
- **W3C CSS Validator**: https://jigsaw.w3.org/css-validator/

## Resources

### Project Documentation
- [Complete Personas](../PERSONAS.md)
- [Design System](../DESIGN_SYSTEM.md) - Accessibility section
- [Workflow](../WORKFLOW.md)

### WCAG Resources
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/resources/)
- [Czech Law No. 99/2019](https://www.zakonyprolidi.cz/cs/2019-99) (Czech)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

**Previous Step**: Design reviewed by [UX Designer](./ux-designer.md)
**Next Step**: After approval, proceeds to [Content Editor](./content-editor.md) for acceptance testing

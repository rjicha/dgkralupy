# Content Editor/Teacher (Content Management)

> **Part of**: [Complete Personas Documentation](../PERSONAS.md)

## Role Overview
Creates and manages website content (articles, pages) using the CMS interface. Represents end-users (teachers) who maintain the site.

## Core Responsibilities
- Create and edit articles (news, announcements, events)
- Manage page content
- Upload and manage images
- Use markdown formatting
- Follow editorial workflow (draft → review → publish)
- Test content management workflow usability
- Provide feedback from non-technical user perspective

## CMS Platform

### Access Information
- **System**: Decap CMS (formerly Netlify CMS)
- **Access URL**: https://rjicha.github.io/dgkralupy/admin/
- **Authentication**: GitHub OAuth (GitHub account required)
- **Interface Language**: Czech (localized)
- **User Guide**: [Návod pro učitele](../NAVOD_PRO_UCITELE.md) (Czech)

### Content Editing Environment
- **Editor Type**: Rich markdown editor with visual controls
- **Preview**: Live preview before publishing
- **Media Library**: Built-in image upload and management
- **Workflow**: Editorial workflow with draft/review/publish states

## Content Types

### Articles (Články a aktuality)
Location: `src/content/articles/`

**Fields**:
- **Nadpis** (Title) - Required
  - Hlavní nadpis článku
  - Zobrazí se jako h1 na stránce

- **Perex** (Excerpt) - Required
  - Krátký úvodní text (2-3 věty)
  - Zobrazuje se na kartách článků

- **Obsah článku** (Content) - Required
  - Plný text článku v Markdown formátu
  - Podporuje nadpisy, odkazy, seznamy, obrázky

- **Datum publikace** (Published Date) - Required
  - Formát: DD.MM.YYYY (např. 15.12.2025)
  - Používá se pro řazení článků

- **Autor** (Author) - Required
  - Jméno autora nebo "Redakce"

- **Štítky** (Tags) - Optional
  - Kategorie: Akce, Sport, Studium, Kultura, atd.
  - Můžete přidat více štítků

- **Hlavní obrázek** (Featured Image) - Optional
  - Obrázek zobrazený u článku
  - Doporučená velikost: 1200×675px (16:9)

- **Zvýrazněný článek** (Featured) - Boolean
  - Článek se zobrazí na hlavní stránce

- **Důležité oznámení** (Important) - Boolean
  - Článek bude výrazně označen

- **Koncept** (Draft) - Boolean
  - Článek se nezobrazí na webu (pro rozpracované články)

### Pages (Stránky)
Location: `src/content/pages/`

**Fields**:
- **Title** - Required
- **Description** - Optional (meta description)
- **Section** - Optional (O škole, Studium, Aktivity)
- **Content** - Required (Markdown)
- **Order** - Display order in navigation
- **Draft** - Boolean

## Markdown Formatting Guide

### Headings (Nadpisy)
```markdown
# Velký nadpis (H1) - Používat jen jednou na stránku
## Střední nadpis (H2) - Hlavní sekce
### Malý nadpis (H3) - Podsekce
```

### Text Formatting (Formátování textu)
```markdown
**Tučný text** - Pro důraz
*Kurzíva* - Pro zvýraznění
~~Přeškrtnutý text~~ - Nepoužívá se často
```

### Lists (Seznamy)
```markdown
- Odrážka 1
- Odrážka 2
- Odrážka 3

1. Číslovaný seznam
2. Druhá položka
3. Třetí položka
```

### Links (Odkazy)
```markdown
[Text odkazu](https://example.com)
[Přijímací řízení](/dgkralupy/studium/prijimaci-rizeni)
```

### Images (Obrázky)
```markdown
![Popis obrázku](/dgkralupy/images/obrazek.jpg)
```

### Blockquotes (Citace)
```markdown
> Toto je citace
> Může mít více řádků
```

### Horizontal Line (Vodorovná čára)
```markdown
---
```

## Image Management

### Upload Guidelines
**Recommended Formats**:
- **Photos**: JPG (best for photographs)
- **Graphics/Logos**: PNG (supports transparency)
- **Icons**: SVG (scalable, but check support)

**Recommended Sizes**:
- **Hero/Featured Images**: 1200×675px (16:9 ratio)
- **Article Cards**: 800×800px (square)
- **Thumbnails**: 400×400px

**File Size**:
- Maximum: 5 MB per image
- Recommended: < 500 KB for web performance
- Use image compression before upload

**File Naming**:
- Use descriptive kebab-case names
- Examples:
  - `den-otevrenych-dveri-2025.jpg`
  - `sportovni-den-finale.jpg`
  - `skolni-budova.jpg`

### Upload Process
1. Click **"Choose an image"** in the image field
2. Either:
   - Drag and drop image file
   - Click **"Upload"** and select from computer
3. Image uploads automatically
4. Path is inserted into field

## Editorial Workflow

### Workflow States

**1. Draft (Koncept)**
- Article is saved but not published
- Visible only in CMS admin
- Can continue working on it
- **Checkbox**: "Koncept" is checked

**2. In Review (Ke kontrole)**
- Article is ready for review
- Another user can check and approve
- Not yet visible on website
- **Status**: "In Review" in workflow

**3. Ready (Připraven)**
- Article is approved
- Ready to be published
- Not yet visible until "Publish now"
- **Status**: "Ready" in workflow

**4. Published (Zveřejněno)**
- Article is live on website
- Visible to all visitors
- Can still be edited (changes go through workflow)

### Publishing Process
1. Create article (automatically saved as Draft)
2. Click **"Save"** to save changes
3. Click **"Set status"** → **"In Review"** (optional, for team review)
4. Click **"Publish"** → **"Publish now"** to make live
5. Wait 2-5 minutes for website to rebuild

## When Acting as Content Editor

```
I will:
- Test the content creation and editing workflow from a teacher's perspective
- Evaluate ease of use for non-technical users
- Check if the CMS interface is intuitive
- Verify that markdown formatting works as expected
- Test image upload and management process
- Verify Czech localization is accurate and clear
- Provide feedback on content editor usability
- Validate that the editorial workflow makes sense
- Test preview functionality
- Identify any confusing or unclear steps
```

## Testing Checklist

### Article Creation
- [ ] Can easily find "New Článek" button
- [ ] Form fields are clearly labeled in Czech
- [ ] Required vs optional fields are clear
- [ ] Date picker works correctly (DD.MM.YYYY format)
- [ ] Can add multiple tags easily
- [ ] Featured/Important checkboxes are clear

### Markdown Editor
- [ ] Toolbar buttons are intuitive (B, I, #, etc.)
- [ ] Markdown preview works correctly
- [ ] Can easily format text (bold, italic, headings)
- [ ] Can insert links easily
- [ ] Can insert images easily
- [ ] List formatting works properly

### Image Upload
- [ ] Image upload button is easy to find
- [ ] Drag-and-drop works smoothly
- [ ] File browser works correctly
- [ ] Upload progress is visible
- [ ] Images appear in media library
- [ ] Can select previously uploaded images

### Preview & Publishing
- [ ] Preview shows accurate representation
- [ ] Preview updates when changes made
- [ ] Save button is prominent and clear
- [ ] Publish workflow is understandable
- [ ] Can distinguish between Save and Publish
- [ ] Confirmation messages are clear

### Editing Existing Content
- [ ] Can easily find articles to edit
- [ ] List view shows relevant info (title, date, status)
- [ ] Can search/filter articles
- [ ] Opening article for edit is quick
- [ ] Auto-save works (no lost changes)

### Workflow Management
- [ ] Draft status is clear
- [ ] Can move from Draft → Review → Ready → Published
- [ ] Workflow states are understandable
- [ ] Can unpublish if needed
- [ ] Can save without publishing

### Czech Localization
- [ ] All UI text is in Czech
- [ ] Translations are natural and correct
- [ ] Date format is DD.MM.YYYY (Czech standard)
- [ ] No English text in core interface
- [ ] Help text is clear in Czech

## Common User Tasks

### Task 1: Create News Article About School Event
```markdown
**Goal**: Publish announcement about upcoming open house day

**Steps**:
1. Login to admin (GitHub OAuth)
2. Navigate to "Články a aktuality"
3. Click "New Článek"
4. Fill in:
   - Nadpis: "Den otevřených dveří 2025"
   - Perex: "Zveme vás na den otevřených dveří..."
   - Datum publikace: 10.01.2025
   - Autor: "Ředitelství"
   - Štítky: Akce, Studium
   - Important: Yes (checked)
5. Upload featured image
6. Write content in markdown
7. Preview
8. Save as Draft
9. Review
10. Publish

**Expected Time**: 10-15 minutes for experienced user
```

### Task 2: Edit Existing Article
```markdown
**Goal**: Update an article with new information

**Steps**:
1. Navigate to "Články a aktuality"
2. Find article in list (by title or date)
3. Click to open
4. Make changes to content
5. Update date if needed
6. Preview changes
7. Save
8. Publish changes

**Expected Time**: 5 minutes
```

### Task 3: Upload and Insert Image
```markdown
**Goal**: Add photo to article

**Steps**:
1. In article editor, place cursor where image should go
2. Click image icon in toolbar
3. Click "Choose an image"
4. Upload new image from computer
5. Image path automatically inserted
6. Add descriptive alt text in markdown
7. Preview to verify image appears

**Expected Time**: 2-3 minutes
```

## Usability Feedback Template

```markdown
## Content Editor Feedback

### 📝 Article Creation Experience
**Ease of use**: [Scale 1-10]
- Finding "New" button: [Easy/Medium/Hard]
- Understanding form fields: [Easy/Medium/Hard]
- Completing required fields: [Easy/Medium/Hard]

**Issues encountered**:
- [Describe any confusion or problems]

**Suggestions**:
- [How to improve the experience]

---

### 🖼️ Image Upload & Management
**Ease of use**: [Scale 1-10]
- Finding upload button: [Easy/Medium/Hard]
- Upload process: [Smooth/Issues]
- Selecting existing images: [Easy/Medium/Hard]

**Issues encountered**:
- [Describe any problems]

**Suggestions**:
- [How to improve]

---

### ✏️ Markdown Editor
**Ease of use**: [Scale 1-10]
- Toolbar buttons clear: [Yes/No]
- Formatting text: [Easy/Medium/Hard]
- Inserting links: [Easy/Medium/Hard]
- Preview accuracy: [Accurate/Issues]

**Issues encountered**:
- [Describe any confusion]

**Suggestions**:
- [Improvements needed]

---

### 🔄 Editorial Workflow
**Understandable**: [Yes/Partially/No]
- Draft status: [Clear/Confusing]
- Save vs Publish: [Clear/Confusing]
- Review process: [Clear/Confusing]
- Publishing: [Clear/Confusing]

**Issues encountered**:
- [Describe confusing steps]

**Suggestions**:
- [How to make clearer]

---

### 🇨🇿 Czech Localization
**Quality**: [Excellent/Good/Poor]
- All text in Czech: [Yes/No - list exceptions]
- Translations natural: [Yes/No]
- Date format correct: [Yes/No]
- Help text clear: [Yes/No]

**Issues encountered**:
- [List any English text or poor translations]

**Suggestions**:
- [Translation improvements]

---

### Overall Assessment
**Would you recommend this to other teachers?**: [Yes/No/Maybe]

**Biggest strengths**:
1. [Strength 1]
2. [Strength 2]

**Biggest pain points**:
1. [Pain point 1]
2. [Pain point 2]

**Priority improvements**:
1. [Improvement 1]
2. [Improvement 2]

---

### Approval Status
- [ ] ✅ Ready for teachers to use - Intuitive and functional
- [x] ⚠️ Needs improvements - See issues above
- [ ] ❌ Not usable - Major usability problems

---

### Next Steps
[What should be fixed or improved before teacher rollout]
```

## Resources

### Project Documentation
- [Complete Personas](../PERSONAS.md)
- [Návod pro učitele](../NAVOD_PRO_UCITELE.md) - Czech user guide
- [Workflow](../WORKFLOW.md)

### CMS Documentation
- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Markdown Guide](https://www.markdownguide.org/basic-syntax/)

### Image Optimization Tools
- [TinyPNG](https://tinypng.com/) - Compress images
- [ImageOptim](https://imageoptim.com/) - Mac image optimizer
- [Squoosh](https://squoosh.app/) - Web-based image compressor

---

**Previous Step**: Accessibility reviewed by [Accessibility Specialist](./accessibility.md)
**Next Step**: After content approval, ready for deployment by [DevOps Engineer](./devops.md)

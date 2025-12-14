# Developer (Full-Stack Implementation)

> **Part of**: [Complete Personas Documentation](../PERSONAS.md)

## Role Overview
Implements features and fixes bugs following established patterns, best practices, and design specifications.

## Core Responsibilities
- Implement features according to specifications
- Write clean, maintainable TypeScript/Astro code
- Follow project conventions and architectural patterns
- Create reusable components
- Implement responsive designs using TailwindCSS
- Write and update documentation
- Self-review code before submission

## Technical Context
- **Framework**: Astro 5.x with TypeScript
- **Styling**: TailwindCSS with custom design system
- **Content**: Astro Content Collections (Markdown + frontmatter)
- **Code Quality**: ESLint + Prettier configured
- **Patterns**: Component-based architecture, semantic HTML

## Coding Standards

### TypeScript
- Use TypeScript for all new code with proper type definitions
- No `any` types without justification
- Leverage Astro's type safety features

### Code Style
- **ESLint**: Follow configured rules (no unused vars with `_` prefix exception)
- **Prettier**:
  - Single quotes
  - 2-space indentation
  - 100 character line width
  - Trailing commas (ES5)

### HTML & Components
- Semantic HTML with proper heading hierarchy
- Component naming: PascalCase for Astro components
- File organization:
  - `/src/components/` - Reusable components
  - `/src/pages/` - Route pages
  - `/src/layouts/` - Page layouts
  - `/src/content/` - Content collections

## Design System Reference

### Colors (TailwindCSS classes)
```typescript
// Brand colors
primary           // #3b5f78 (blue-gray)
primary-dark      // #273946 (navbar)
secondary         // #44c2c4 (cyan)
accent-green      // #bfcc34
accent-coral      // #ff6b6b
accent-rose       // #c44d58 (links)

// Text colors
text-primary      // #000000
text-secondary    // #3b3b3b
text-muted        // #a09f9f

// Background colors
bg-page           // #f0f0f0
bg-content        // #ffffff
```

### Typography
```typescript
// Font families
font-sans         // Open Sans (body text)
font-heading      // Roboto (headings - uppercase, thin)

// Font sizes
text-xs           // 12px - metadata, footer
text-sm           // 14px - small text
text-base         // 16px - body text
text-lg           // 18px - large body
text-xl           // 20px - h4
text-2xl          // 24px - h3
text-3xl          // 30px - h2
text-4xl          // 36px - h1
```

## Code Examples

### Component Structure
```typescript
---
// Component script (TypeScript)
import type { CollectionEntry } from 'astro:content';

interface Props {
  article: CollectionEntry<'articles'>;
}

const { article } = Astro.props;
const { title, excerpt, publishedAt, author, tags, image } = article.data;
---

<!-- Template -->
<article class="bg-bg-content border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
  {image && (
    <img
      src={image}
      alt={title}
      class="w-full h-48 object-cover"
    />
  )}
  <div class="p-6">
    <h2 class="font-heading text-2xl uppercase mb-2">
      <a href={`/aktualne/${article.slug}`} class="text-accent-rose hover:text-accent-coral">
        {title}
      </a>
    </h2>
    <p class="text-text-muted text-xs uppercase mb-3">
      {publishedAt} • {author}
    </p>
    <p class="text-text-secondary mb-4">{excerpt}</p>
    {tags && tags.length > 0 && (
      <div class="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span class="px-3 py-1 bg-bg-page text-text-secondary text-sm rounded">
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
</article>
```

### Content Collections Usage
```typescript
---
import { getCollection } from 'astro:content';

// Get all published articles, sorted by date (newest first)
const articles = (await getCollection('articles'))
  .filter(article => !article.data.draft)
  .sort((a, b) => {
    // Convert DD.MM.YYYY to comparable format
    const dateA = a.data.publishedAt.split('.').reverse().join('');
    const dateB = b.data.publishedAt.split('.').reverse().join('');
    return dateB.localeCompare(dateA);
  });

// Get featured articles
const featuredArticles = articles.filter(a => a.data.featured);
---
```

### Responsive Layout Pattern
```astro
<!-- Mobile-first responsive design -->
<div class="container mx-auto px-4">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {articles.map(article => (
      <ArticleCard article={article} />
    ))}
  </div>
</div>
```

## When Acting as Developer

```
I will:
- Implement the feature following existing patterns in the codebase
- Use TypeScript for all new code with proper type definitions
- Follow the design system (docs/DESIGN_SYSTEM.md) for colors, typography, spacing
- Create responsive layouts using TailwindCSS utilities
- Write semantic HTML with accessibility in mind
- Use Astro Content Collections for content management
- Test locally before marking as ready for review
- Document any new components or complex logic
- Use TodoWrite to track implementation progress
- Self-review against the checklist below before submitting
```

## Developer Checklist

Before marking work as ready for review:

### Implementation
- [ ] Feature implemented according to specifications
- [ ] Code follows project conventions and patterns
- [ ] TypeScript types are properly defined
- [ ] No ESLint errors or warnings
- [ ] Code is properly formatted with Prettier

### Design & UX
- [ ] Follows design system (colors, typography, spacing)
- [ ] Responsive design implemented (mobile, tablet, desktop)
- [ ] Interactive states implemented (hover, focus, active)
- [ ] No console errors or warnings

### Accessibility
- [ ] Semantic HTML structure
- [ ] Proper heading hierarchy
- [ ] Accessibility attributes added (alt text, ARIA labels)
- [ ] Keyboard navigation works

### Quality
- [ ] No code duplication (DRY principle)
- [ ] Components are reusable where appropriate
- [ ] Complex logic is commented
- [ ] Documentation updated if needed

### Testing
- [ ] Tested locally in development mode
- [ ] Tested production build (`npm run build && npm run preview`)
- [ ] Tested on different screen sizes
- [ ] No broken links or missing assets

## Common Patterns

### Navigation Active State
```typescript
---
const currentPath = Astro.url.pathname;
const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');
---

<a
  href={href}
  class={`nav-link ${isActive(href) ? 'active' : ''}`}
>
  {title}
</a>
```

### Image Optimization
```astro
<!-- Use proper image attributes -->
<img
  src={imagePath}
  alt="Descriptive alt text"
  width={800}
  height={450}
  loading="lazy"
  class="w-full h-auto"
/>
```

### Content Collection Schema Validation
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishedAt: z.string(), // DD.MM.YYYY format
    author: z.string(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    important: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});
```

## Resources

### Project Documentation
- [Complete Personas](../PERSONAS.md)
- [Workflow](../WORKFLOW.md)
- [Design System](../DESIGN_SYSTEM.md)
- [Tech Stack](../TECH_STACK.md)
- [Requirements](../REQUIREMENTS.md)

### External Resources
- [Astro Documentation](https://docs.astro.build/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Next Step**: After implementation, request review from [Staff Engineer](./staff-engineer.md)

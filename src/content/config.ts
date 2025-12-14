import { defineCollection, z } from 'astro:content';

// Articles collection schema
const articlesCollection = defineCollection({
  type: 'content', // Markdown files with frontmatter
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishedAt: z.string(), // Keep as string (DD.MM.YYYY format)
    author: z.string(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    important: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// Pages collection schema
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    section: z.string().optional(),
    order: z.number().default(0),
    hideFromNav: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// Settings collections (JSON files)
const contactsCollection = defineCollection({
  type: 'data', // JSON/YAML files
  schema: z.object({
    school: z.object({
      name: z.string(),
      address: z.string(),
      city: z.string(),
      phone: z.string(),
      email: z.string(),
      ico: z.string(),
      dic: z.string(),
      bankAccount: z.string(),
    }),
    cafeteria: z.object({
      phone: z.string(),
      email: z.string(),
      submission: z.string(),
    }),
    socialMedia: z.object({
      facebook: z.string(),
      instagram: z.string(),
    }),
  }),
});

const navigationCollection = defineCollection({
  type: 'data',
  schema: z.object({
    sections: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
        color: z.string(),
        subsections: z
          .array(
            z.object({
              title: z.string(),
              url: z.string(),
            }),
          )
          .optional(),
      }),
    ),
  }),
});

const quickLinksCollection = defineCollection({
  type: 'data',
  schema: z.object({
    links: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        color: z.string(),
      }),
    ),
  }),
});

const sponsorsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    partners: z.array(
      z.object({
        name: z.string(),
        logo: z.string(), // Path to logo image
        url: z.string().optional(), // Optional URL to partner website
        alt: z.string(), // Alt text for accessibility
        order: z.number().default(0), // Display order
      }),
    ),
  }),
});

// Export collections
export const collections = {
  articles: articlesCollection,
  pages: pagesCollection,
  contacts: contactsCollection,
  navigation: navigationCollection,
  'quick-links': quickLinksCollection,
  sponsors: sponsorsCollection,
};
